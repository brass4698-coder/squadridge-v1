/**
 * mint-deck-share — moderator-only mint endpoint for pitch-deck access tokens.
 *
 * Request shape:
 *   POST /functions/v1/mint-deck-share
 *   Authorization: Bearer <supabase_session>
 *   { deckId: string, audience: 'self' | 'share', ttlSeconds?: number,
 *     status?: 'draft' | 'internal' | 'external_ready' | 'needs_review' }
 *
 * Behaviour:
 *   - `audience: 'self'` always allowed (used by `DeckViewerRedirectPage` to
 *     transparently view a gated deck inside the moderator session). Tiny
 *     TTL, not persisted.
 *   - `audience: 'share'` allowed only when:
 *       * the deckId is NOT in the always-moderator-only list, AND
 *       * the caller-supplied `status === 'external_ready'`.
 *     The status is editorial; the security boundary is the always-moderator-only
 *     list. We persist a row in `pitch_deck_shares` so revocation works and
 *     we can list active shares.
 *
 * The function returns the relative URL the client should `window.open` —
 * the caller composes the absolute URL using `window.location.origin` so
 * the function does not need to know its own deployed origin.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';
import {
  clampTtlSeconds,
  readDeckSigningSecret,
  signDeckShareToken,
  type DeckShareAudience,
} from '../_shared/deckShareToken.ts';
import {
  getDeckAccessTier,
  isDeckShareAudienceAllowed,
  type DeckStatusForGate,
} from '../_shared/deckAccessTiers.ts';

const FUNCTION_NAME = 'mint-deck-share';

interface MintRequestBody {
  deckId?: string;
  audience?: DeckShareAudience;
  ttlSeconds?: number;
  status?: DeckStatusForGate;
}

interface MintFailBody {
  ok: false;
  error: string;
  errorCode: string;
}

function failBody(message: string, errorCode: string): MintFailBody {
  return { ok: false, error: message, errorCode };
}

function jsonResponse(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

const ALLOWED_STATUSES: ReadonlySet<DeckStatusForGate> = new Set([
  'draft',
  'internal',
  'external_ready',
  'needs_review',
]);

function normalizeBody(input: unknown): MintRequestBody | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  const deckId = typeof obj.deckId === 'string' ? obj.deckId.trim() : undefined;
  const audience = obj.audience === 'self' || obj.audience === 'share' ? obj.audience : undefined;
  const ttlSeconds =
    typeof obj.ttlSeconds === 'number' && Number.isFinite(obj.ttlSeconds)
      ? obj.ttlSeconds
      : undefined;
  const status =
    typeof obj.status === 'string' && ALLOWED_STATUSES.has(obj.status as DeckStatusForGate)
      ? (obj.status as DeckStatusForGate)
      : undefined;
  if (!deckId || !/^[a-z0-9-]+$/i.test(deckId) || deckId.length > 80) return null;
  if (!audience) return null;
  return { deckId, audience, ttlSeconds, status };
}

async function getModeratorUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) return null;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return null;
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: modRow, error: modErr } = await admin
    .from('moderators')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (modErr) {
    logError('mint_deck_share_moderator_lookup_failed', {
      function: FUNCTION_NAME,
      error_code: modErr.code ?? null,
      error_message: safeErrorMessage(new Error(modErr.message)),
    });
    return null;
  }
  return modRow ? user.id : null;
}

async function persistShareRow(input: {
  jti: string;
  deckId: string;
  mintedBy: string;
  expiresAt: Date;
}): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return false;
  const admin = createClient(supabaseUrl, serviceKey);
  const { error } = await admin.from('pitch_deck_shares').insert({
    jti: input.jti,
    deck_id: input.deckId,
    minted_by: input.mintedBy,
    expires_at: input.expiresAt.toISOString(),
  });
  if (error) {
    logError('pitch_deck_shares_insert_failed', {
      function: FUNCTION_NAME,
      error_code: error.code ?? null,
      error_message: safeErrorMessage(new Error(error.message)),
    });
    return false;
  }
  return true;
}

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }
  if (req.method !== 'POST') {
    return jsonResponse(req, failBody('Method not allowed', 'METHOD_NOT_ALLOWED'), 405);
  }

  let parsedJson: unknown;
  try {
    parsedJson = await req.json();
  } catch {
    return jsonResponse(req, failBody('Invalid JSON', 'INVALID_JSON'), 400);
  }

  const body = normalizeBody(parsedJson);
  if (!body || !body.deckId || !body.audience) {
    return jsonResponse(req, failBody('Invalid request body', 'INVALID_REQUEST'), 400);
  }

  const moderatorId = await getModeratorUserId(req.headers.get('Authorization'));
  if (!moderatorId) {
    return jsonResponse(req, failBody('Moderator session required', 'NOT_MODERATOR'), 403);
  }

  const tier = getDeckAccessTier(body.deckId, body.status);
  if (body.audience === 'share') {
    // Defense in depth: the always-moderator-only list is enforced server
    // side regardless of what the client claims about status.
    if (!isDeckShareAudienceAllowed('share', tier)) {
      return jsonResponse(
        req,
        failBody(
          'This deck is not eligible for shareable links — mark it external_ready first, or it is on the always-moderator-only list.',
          'NOT_SHAREABLE',
        ),
        403,
      );
    }
  }

  let secret: string;
  try {
    secret = readDeckSigningSecret();
  } catch {
    return jsonResponse(req, failBody('Server configuration error', 'SERVER_CONFIG'), 500);
  }

  const ttl = clampTtlSeconds(body.audience, body.ttlSeconds);
  const { token, claims } = await signDeckShareToken({
    deckId: body.deckId,
    audience: body.audience,
    ttlSeconds: ttl,
    mintedBy: moderatorId,
    secret,
  });
  const expiresAt = new Date(claims.exp * 1000);

  if (body.audience === 'share') {
    const ok = await persistShareRow({
      jti: claims.jti,
      deckId: body.deckId,
      mintedBy: moderatorId,
      expiresAt,
    });
    if (!ok) {
      return jsonResponse(req, failBody('Could not record share link', 'PERSIST_FAILED'), 500);
    }
    logInfo('deck_share_minted', {
      function: FUNCTION_NAME,
      duration_ms: ttl * 1000,
    });
  }

  // Return a relative path; the client composes the absolute URL with its
  // own origin (the function URL is `${SUPABASE_URL}/functions/v1/serve-pitch-deck/...`).
  const relativePath = `/functions/v1/serve-pitch-deck/${encodeURIComponent(body.deckId)}?token=${encodeURIComponent(token)}`;

  return jsonResponse(
    req,
    {
      ok: true,
      deckId: body.deckId,
      audience: body.audience,
      jti: claims.jti,
      expiresAt: expiresAt.toISOString(),
      relativePath,
      ttlSeconds: ttl,
    },
    200,
  );
}

Deno.serve(handle);
