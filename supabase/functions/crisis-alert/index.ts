/**
 * crisis-alert Edge Function — out-of-band participant alerts for facilitator
 * intervention (Phase 2.4 of the audit remediation plan, see
 * `docs/operations/pilot-runbook.md` § "Crisis alert flow").
 *
 * Contract:
 *   POST /functions/v1/crisis-alert
 *   Authorization: Bearer <user JWT>
 *   Body: { squad_id: string, reason_code: 'immediate_danger' | 'request_pause' | 'request_facilitator' }
 *
 *   200: { ok: true, id: string }
 *   400: invalid body (no PII echoed back)
 *   401: missing / invalid JWT
 *   403: caller not a member of the squad
 *   429: rate-limited (default Edge Redis limiter)
 *   500: server config / database error
 *
 * Why an Edge Function (not an RPC):
 *   - The alert must succeed even when message INSERTs are blocked (e.g. the
 *     ingest-message rate limiter is throttling). The crisis-alert Edge
 *     function uses a separate rate-limit bucket so a chat flood cannot
 *     suppress emergencies.
 *   - We never want to log free-form context that participants might type
 *     under stress; the reason_code enum keeps the audit trail PII-free.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

const REASON_CODES = ['immediate_danger', 'request_pause', 'request_facilitator'] as const;
type ReasonCode = (typeof REASON_CODES)[number];

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  ch: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
}

async function assertEdgeRateLimit(jwt: string): Promise<void> {
  const rawUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!rawUrl || !anonKey) return;
  const baseUrl = rawUrl.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/functions/v1/rate-limit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'crisis_alert' }),
  });
  if (res.status === 429) {
    throw new Error('rate_limited');
  }
  if (res.status === 503 && Deno.env.get('RATE_LIMIT_FAIL_OPEN') === 'true') return;
  if (res.status === 503) throw new Error('rate_limit_unavailable');
  if (!res.ok) throw new Error('rate_limit_check_failed');
}

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse(500, { error: 'Server configuration error' }, ch);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }
  const jwt = authHeader.slice(7).trim();

  try {
    await assertEdgeRateLimit(jwt);
  } catch (e) {
    return jsonResponse(429, { error: e instanceof Error ? e.message : 'rate_limited' }, ch);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return jsonResponse(401, { error: 'Unauthorized' }, ch);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, ch);
  }
  const b = body as { squad_id?: unknown; reason_code?: unknown };
  const squadId = typeof b.squad_id === 'string' ? b.squad_id.trim() : '';
  const reasonCode = typeof b.reason_code === 'string' ? b.reason_code.trim() : '';
  if (!squadId) return jsonResponse(400, { error: 'Missing squad_id' }, ch);
  if (!REASON_CODES.includes(reasonCode as ReasonCode)) {
    return jsonResponse(400, { error: 'Invalid reason_code' }, ch);
  }

  // Squad membership check via the user's JWT — RLS enforces.
  const { data: memb, error: membErr } = await userClient
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (membErr || !memb) return jsonResponse(403, { error: 'Forbidden' }, ch);

  // Service-role insert (RLS denies direct client INSERTs on crisis_alerts).
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: inserted, error: insErr } = await admin
    .from('crisis_alerts')
    .insert({
      actor_user_id: user.id,
      squad_id: squadId,
      reason_code: reasonCode as ReasonCode,
    })
    .select('id')
    .single();
  if (insErr) {
    logError('crisis_alert_insert_failed', {
      function: 'crisis-alert',
      error_code: insErr.code ?? null,
      error_message: safeErrorMessage(new Error(insErr.message)),
    });
    return jsonResponse(500, { error: 'Could not record alert' }, ch);
  }

  // Telemetry only — no participant identifiers, no plaintext.
  logInfo('crisis_alert_created', {
    function: 'crisis-alert',
    error_code: reasonCode,
  });

  return jsonResponse(200, { ok: true, id: inserted!.id }, ch);
});
