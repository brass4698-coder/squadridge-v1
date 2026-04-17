/**
 * CORS for browser clients: allow only origins listed in ALLOWED_ORIGINS (comma-separated).
 * When unset, falls back to the request Origin (local dev); production should set explicit origins.
 */
export function getAllowedOrigin(req: Request): string | null {
  const raw = Deno.env.get('ALLOWED_ORIGINS')?.trim() ?? '';
  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get('Origin');
  if (allowed.length > 0) {
    if (origin && allowed.includes(origin)) return origin;
    return null;
  }
  return origin;
}

export function corsHeadersFor(
  req: Request,
  extra: Record<string, string> = {},
): Record<string, string> {
  const allow = getAllowedOrigin(req);
  return {
    ...(allow ? { 'Access-Control-Allow-Origin': allow } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    ...extra,
  };
}
