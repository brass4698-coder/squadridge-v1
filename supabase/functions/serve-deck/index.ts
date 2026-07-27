/**
 * serve-deck — auth + has_deck_access gated pitch briefing assets.
 *
 * GET /functions/v1/serve-deck?path=<basename>
 * Authorization: Bearer <user access token>
 *
 * Static files live under ./static (not Vite public/). Raw /pitch-deck-hub/*.html
 * URLs on the app host must not serve these bytes.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';

const ALLOWED_PATH = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(html|css|js|json)$/;

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
};

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  ch: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...ch,
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  });
}

function sanitizePath(raw: string | null): string | null {
  if (!raw) return null;
  const base = raw.replace(/^.*[/\\]/, '').trim();
  if (!ALLOWED_PATH.test(base)) return null;
  return base;
}

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'GET') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    return jsonResponse(500, { error: 'Server configuration error' }, ch);
  }

  const authHeader = req.headers.get('Authorization')?.trim() ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse(401, { error: 'NOT_AUTHENTICATED' }, ch);
  }

  const url = new URL(req.url);
  const safePath = sanitizePath(url.searchParams.get('path'));
  if (!safePath) {
    return jsonResponse(400, { error: 'INVALID_PATH' }, ch);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: allowed, error: accessErr } = await userClient.rpc('has_deck_access');
  if (accessErr) {
    return jsonResponse(403, { error: 'ACCESS_CHECK_FAILED' }, ch);
  }
  if (allowed !== true) {
    return jsonResponse(403, { error: 'FORBIDDEN' }, ch);
  }

  let bytes: Uint8Array;
  try {
    bytes = await Deno.readFile(new URL(`./static/${safePath}`, import.meta.url));
  } catch {
    return jsonResponse(404, { error: 'NOT_FOUND' }, ch);
  }

  const ext = safePath.split('.').pop() ?? '';
  const contentType = MIME[ext] ?? 'application/octet-stream';

  return new Response(bytes, {
    status: 200,
    headers: {
      ...ch,
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
