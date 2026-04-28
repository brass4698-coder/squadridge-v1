/**
 * Request anonymisation utilities.
 *
 * Strips or replaces PII (IP address, User-Agent, and other sensitive headers)
 * before the request context is used for logging or stored in the database.
 *
 * Design:
 *  - IP addresses are replaced with a truncated HMAC-SHA-256 (pepper from env).
 *    Only the first 16 hex characters are kept so the value is not reversible.
 *  - User-Agent is removed entirely (not required for business logic).
 *  - A configurable set of additional sensitive headers are redacted.
 *
 * Usage (Edge Function or server):
 *
 *   import { anonymizeRequestHeaders } from '@/middleware/anonymizeRequest';
 *
 *   const safe = await anonymizeRequestHeaders(req.headers, req.ip, {
 *     pepper: Deno.env.get('ANON_PEPPER') ?? '',
 *   });
 *   // safe.anonIp — truncated hash, safe to log
 *   // safe.headers — headers with PII removed
 *
 * All functions are pure / side-effect-free and require no network access,
 * making them straightforward to unit-test in vitest (jsdom or node).
 */

export interface AnonymiseOptions {
  /**
   * A server-side secret used as the HMAC key.
   * Source from an environment variable — never hard-code.
   * When omitted the IP is hashed without a pepper (weaker, but still non-reversible).
   */
  pepper?: string;
  /**
   * Additional header names to redact (case-insensitive).
   * The defaults below are always redacted regardless of this list.
   */
  extraSensitiveHeaders?: string[];
}

/**
 * Headers that are always stripped before logging or DB writes.
 * Extend via `AnonymiseOptions.extraSensitiveHeaders`.
 */
const DEFAULT_SENSITIVE_HEADERS: ReadonlySet<string> = new Set([
  'user-agent',
  'cookie',
  'set-cookie',
  'authorization',
  'x-forwarded-for',
  'cf-connecting-ip',
  'x-real-ip',
  'x-client-ip',
  'forwarded',
  'proxy-authorization',
]);

export interface AnonymisedContext {
  /** Truncated HMAC-SHA-256 of the original IP, or null if no IP was provided. */
  anonIp: string | null;
  /** Request headers with all sensitive fields removed. */
  headers: Record<string, string>;
}

/**
 * Returns an HMAC-SHA-256 of `value` keyed by `pepper`.
 * Falls back to a plain SHA-256 when the pepper is empty.
 * Result is hex-encoded and truncated to 16 characters.
 */
export async function hashWithPepper(value: string, pepper: string): Promise<string> {
  const encoder = new TextEncoder();

  if (pepper.length === 0) {
    // No pepper: use plain SHA-256 (still not reversible, but no HMAC guarantee).
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16);
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

/**
 * Builds a safe, anonymised request context from raw headers and an IP string.
 *
 * - Sensitive headers are removed (see `DEFAULT_SENSITIVE_HEADERS`).
 * - The IP is replaced with a truncated HMAC hash.
 * - Logs should use the returned `anonIp` and `headers` — never the originals.
 */
export async function anonymizeRequestHeaders(
  rawHeaders: Record<string, string> | Headers,
  rawIp: string | null | undefined,
  options: AnonymiseOptions = {},
): Promise<AnonymisedContext> {
  const pepper = options.pepper ?? '';
  const extra = new Set((options.extraSensitiveHeaders ?? []).map((h) => h.toLowerCase()));

  // Normalise headers to a plain object
  const normalized: Record<string, string> = {};
  if (rawHeaders instanceof Headers) {
    rawHeaders.forEach((value, key) => {
      normalized[key.toLowerCase()] = value;
    });
  } else {
    for (const [k, v] of Object.entries(rawHeaders)) {
      normalized[k.toLowerCase()] = v;
    }
  }

  // Remove sensitive headers
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (!DEFAULT_SENSITIVE_HEADERS.has(key) && !extra.has(key)) {
      safe[key] = value;
    }
  }

  // Hash the IP
  const anonIp =
    rawIp != null && rawIp.trim().length > 0 ? await hashWithPepper(rawIp.trim(), pepper) : null;

  return { anonIp, headers: safe };
}

/**
 * Convenience wrapper that accepts a Fetch-API `Request` object.
 * Compatible with Supabase Edge Functions (Deno) and the browser Fetch API.
 */
export async function anonymizeRequest(
  request: Request,
  options: AnonymiseOptions = {},
): Promise<AnonymisedContext> {
  // In Edge Functions, the real IP is typically in CF-Connecting-IP or X-Real-IP.
  // We read them before stripping so callers do not lose the (hashed) value.
  const rawIp =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null;

  return anonymizeRequestHeaders(request.headers, rawIp, options);
}
