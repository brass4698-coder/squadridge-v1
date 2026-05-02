/**
 * serve-pitch-deck — gated reader for pitch-deck HTML.
 *
 * Request shape:
 *   GET /functions/v1/serve-pitch-deck/<deckId>?token=<jwt>
 *
 * Authentication paths (in priority order):
 *   1. `?token=<jwt>` — HMAC-signed by `mint-deck-share`. Bound to deckId
 *      and audience; share tokens are also looked up in `pitch_deck_shares`
 *      so revocation takes effect immediately.
 *   2. `Authorization: Bearer <supabase_session>` — moderator session,
 *      verified against the `moderators` table via the service-role
 *      client. Used by tooling / future direct-link viewing.
 *
 * On success the response:
 *   - Streams the bundled HTML from `./decks/<file>`, with relative asset
 *     paths rewritten via injected `<base href>` to point back at the
 *     still-public chrome (`/pitch-deck-hub/*.css|.js`).
 *   - Inlines `investor-deck-model.embed.js` directly into the response so
 *     the financial model never travels as its own gated request.
 *   - Sets `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private,
 *     no-store`, and a strict CSP that only allows the chrome origin.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { logError, safeErrorMessage } from '../_shared/log.ts';
import {
  DeckShareTokenInvalid,
  readDeckSigningSecret,
  verifyDeckShareToken,
} from '../_shared/deckShareToken.ts';
import { deckHtmlFilenameFor, isAllowedInlineAssetFile } from './fileMap.ts';

const FUNCTION_NAME = 'serve-pitch-deck';
const BASE_HREF_ENV = 'PITCH_DECK_PUBLIC_CHROME_BASE_URL';

interface ServeFailure {
  status: number;
  body: string;
  errorCode: string;
}

function htmlError(status: number, message: string, errorCode: string): ServeFailure {
  const escaped = message.replace(
    /[&<>]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!,
  );
  return {
    status,
    errorCode,
    body: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Pitch deck unavailable</title></head><body style="font:14px/1.5 system-ui;color:#cbd5e1;background:#0f172a;padding:48px;max-width:560px;margin:0 auto"><h1 style="font-weight:600;font-size:1.05rem;margin-bottom:8px">${escaped}</h1><p style="color:#64748b">If you reached this from a shared link, ask the sender to mint a fresh one. Status code: ${status} (${errorCode}).</p></body></html>`,
  };
}

function safeBaseHref(): string {
  const raw = Deno.env.get(BASE_HREF_ENV)?.trim();
  if (!raw) return '/pitch-deck-hub/';
  // Force a trailing slash so relative resolution works.
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/**
 * Inject `<base href>` and the noindex meta into `<head>`. We do not rewrite
 * absolute paths (`/assets/...`) because those continue to resolve against
 * whatever origin the function is mounted on — the chrome and hero images
 * still live in `public/`. Only relative URLs need redirection.
 */
function injectHead(html: string, baseHref: string): string {
  const inject = `<base href="${baseHref}"><meta name="robots" content="noindex,nofollow">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${inject}`);
  }
  return `<head>${inject}</head>${html}`;
}

/**
 * Replace `<script src="investor-deck-model.embed.js"></script>` (or any
 * permitted inline asset) with the asset's contents wrapped in an inline
 * <script>. Skips quietly when no such reference exists. We only inline
 * filenames listed in `isAllowedInlineAssetFile` so a future template typo
 * cannot accidentally exfiltrate other bundled files.
 */
async function inlineKnownAssets(html: string, decksDirUrl: URL): Promise<string> {
  const pattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
  const matches = [...html.matchAll(pattern)];
  let next = html;
  for (const m of matches) {
    const src = m[1];
    if (!isAllowedInlineAssetFile(src)) continue;
    try {
      const assetUrl = new URL(src, decksDirUrl);
      const assetText = await Deno.readTextFile(assetUrl);
      next = next.replace(m[0], `<script>${assetText}</script>`);
    } catch (e) {
      logError('serve_pitch_deck_inline_asset_failed', {
        function: FUNCTION_NAME,
        error_message: safeErrorMessage(e),
      });
    }
  }
  return next;
}

async function readDeckHtml(deckId: string): Promise<string | null> {
  const filename = deckHtmlFilenameFor(deckId);
  if (!filename) return null;
  const decksDirUrl = new URL('./decks/', import.meta.url);
  const fileUrl = new URL(filename, decksDirUrl);
  try {
    const html = await Deno.readTextFile(fileUrl);
    return await inlineKnownAssets(html, decksDirUrl);
  } catch (e) {
    logError('serve_pitch_deck_read_failed', {
      function: FUNCTION_NAME,
      error_message: safeErrorMessage(e),
    });
    return null;
  }
}

interface AuthOk {
  ok: true;
  via: 'token' | 'moderator';
  /** Present only for share tokens (used for audit logging). */
  jti?: string;
}

interface AuthFail {
  ok: false;
  failure: ServeFailure;
}

async function authorizeRequest(req: Request, deckId: string): Promise<AuthOk | AuthFail> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (token) {
    let secret: string;
    try {
      secret = readDeckSigningSecret();
    } catch {
      return { ok: false, failure: htmlError(500, 'Server configuration error', 'SERVER_CONFIG') };
    }
    let claims;
    try {
      claims = await verifyDeckShareToken(token, { expectedDeckId: deckId, secret });
    } catch (e) {
      const code = e instanceof DeckShareTokenInvalid ? e.code : 'TOKEN_INVALID';
      return {
        ok: false,
        failure: htmlError(403, 'Pitch-deck link is no longer valid.', code),
      };
    }
    if (claims.aud === 'share') {
      const ok = await assertShareTokenNotRevoked(claims.jti);
      if (!ok) {
        return {
          ok: false,
          failure: htmlError(403, 'Pitch-deck link has been revoked.', 'REVOKED'),
        };
      }
      return { ok: true, via: 'token', jti: claims.jti };
    }
    return { ok: true, via: 'token' };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      failure: htmlError(401, 'Sign in as a moderator to view this pitch deck.', 'MISSING_AUTH'),
    };
  }
  const moderatorOk = await assertCallerIsModerator(authHeader);
  if (!moderatorOk) {
    return {
      ok: false,
      failure: htmlError(
        403,
        'Moderator access required to view this pitch deck.',
        'NOT_MODERATOR',
      ),
    };
  }
  return { ok: true, via: 'moderator' };
}

async function assertShareTokenNotRevoked(jti: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return false;
  const admin = createClient(supabaseUrl, serviceKey);
  const { data, error } = await admin
    .from('pitch_deck_shares')
    .select('jti, revoked_at, expires_at')
    .eq('jti', jti)
    .maybeSingle();
  if (error) {
    logError('pitch_deck_shares_lookup_failed', {
      function: FUNCTION_NAME,
      error_code: error.code ?? null,
      error_message: safeErrorMessage(new Error(error.message)),
    });
    return false;
  }
  if (!data) return false;
  if (data.revoked_at) return false;
  if (data.expires_at && Date.parse(String(data.expires_at)) <= Date.now()) return false;
  return true;
}

async function assertCallerIsModerator(authHeader: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) return false;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return false;
  const admin = createClient(supabaseUrl, serviceKey);
  const { data: modRow, error: modErr } = await admin
    .from('moderators')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (modErr) {
    logError('serve_pitch_deck_moderator_lookup_failed', {
      function: FUNCTION_NAME,
      error_code: modErr.code ?? null,
      error_message: safeErrorMessage(new Error(modErr.message)),
    });
    return false;
  }
  return modRow != null;
}

function parseDeckIdFromPath(req: Request): string | null {
  const url = new URL(req.url);
  // Edge Functions strip the `/functions/v1/<name>` prefix; what's left is
  // the in-function path. We accept either `/<deckId>` or `/<deckId>/`.
  const segments = url.pathname.split('/').filter(Boolean);
  // Defensive: when invoked via the legacy local-dev shim the function name
  // may still be present. Drop it if so.
  if (segments[0] === FUNCTION_NAME) segments.shift();
  const candidate = segments[0];
  if (!candidate) return null;
  // Reject anything that smells like path traversal or query smuggling.
  if (!/^[a-z0-9-]+$/i.test(candidate)) return null;
  return candidate;
}

function strictHtmlHeaders(): Record<string, string> {
  // The chrome (CSS, JS) is served from the same parent origin via the
  // injected `<base href>`, so `'self'` covers it. We deliberately do NOT
  // allow third-party script hosts from inside the deck shell.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': csp,
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'private, no-store',
  };
}

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204 });
  }
  if (req.method !== 'GET') {
    const fail = htmlError(405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
    return new Response(fail.body, { status: fail.status, headers: strictHtmlHeaders() });
  }

  const deckId = parseDeckIdFromPath(req);
  if (!deckId) {
    const fail = htmlError(404, 'Unknown pitch deck.', 'UNKNOWN_DECK');
    return new Response(fail.body, { status: fail.status, headers: strictHtmlHeaders() });
  }

  const auth = await authorizeRequest(req, deckId);
  if (!auth.ok) {
    return new Response(auth.failure.body, {
      status: auth.failure.status,
      headers: strictHtmlHeaders(),
    });
  }

  const html = await readDeckHtml(deckId);
  if (!html) {
    const fail = htmlError(404, 'Unknown pitch deck.', 'UNKNOWN_DECK');
    return new Response(fail.body, { status: fail.status, headers: strictHtmlHeaders() });
  }

  const finalHtml = injectHead(html, safeBaseHref());
  return new Response(finalHtml, { status: 200, headers: strictHtmlHeaders() });
}

Deno.serve(handle);
