/**
 * anonymizeRequest.ts
 *
 * Strips or replaces privacy-sensitive HTTP headers before any downstream
 * processing or logging occurs. Designed for use in Supabase Edge Functions
 * (Deno / Web Fetch API) and as a pattern reference for any Node.js gateway
 * you wire in front of the app.
 *
 * Tradeoffs and assumptions:
 *  - We hash IPs rather than drop them entirely so abuse-prevention code
 *    can still rate-limit by a stable per-client token without learning the
 *    real IP. The hash is HMAC-SHA-256 keyed by ANON_PEPPER so two different
 *    deployments produce different hashes for the same IP (compartmentalization).
 *  - We truncate the hash to 12 bytes (24 hex chars) — long enough to be a
 *    useful rate-limit key, short enough to be obviously useless as an
 *    identifier without the pepper.
 *  - We remove User-Agent entirely. UA strings are surprisingly identifying
 *    (OS, browser version, device class). If you need UA for abuse detection,
 *    consider bucketing to coarse categories (mobile/desktop) instead.
 *  - x-forwarded-for is removed after we read the client IP from it, so the
 *    anonymized IP hash is the only downstream record.
 *  - This module has no side-effects at import time and does not call any
 *    logger, so it is safe to import in any context.
 *
 * Scaffold note:
 *  This module is fully implemented. Wire it into your Edge Function handlers
 *  by calling anonymizeHeaders() on the incoming Request headers before you
 *  pass them to any logging or analytics path.
 */

/** Headers that carry raw IP or routing information. */
const PII_HEADERS_TO_REMOVE = [
  'x-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'cf-connecting-ip', // Cloudflare
  'true-client-ip',
  'fastly-client-ip',
  'forwarded',
] as const;

/** Output of the anonymization pass. Immutable record; original is not modified. */
export interface AnonymizedHeaders {
  /** New Headers object with PII removed and x-anon-ip set. */
  headers: Headers;
  /** HMAC-SHA-256 hash (24 hex chars) of the client IP, or 'unknown' if no IP was present. */
  anonIp: string;
}

/**
 * Extract the most-specific client IP from the raw header value.
 * x-forwarded-for is a comma-separated chain: "client, proxy1, proxy2".
 * We want the leftmost entry (the original client).
 */
export function extractClientIp(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(',')[0];
  return first ? first.trim() : null;
}

/**
 * Compute an HMAC-SHA-256 keyed hash of `ip` using `pepper`.
 * Returns the first 24 hex characters of the digest — enough entropy
 * to be a useful rate-limit key, too short to be a stable identifier.
 *
 * Uses the Web Crypto API (available in browsers, Deno, and Node 18+).
 */
export async function hashIpWithPepper(ip: string, pepper: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(ip));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 24);
}

/**
 * Return a new Headers object with PII removed and x-anon-ip set.
 *
 * @param incoming - Original request headers (not mutated).
 * @param pepper   - ANON_PEPPER env var value. If empty, IP is hashed
 *                   with an empty key (weaker but still removes plaintext IP).
 */
export async function anonymizeHeaders(
  incoming: Headers,
  pepper: string,
): Promise<AnonymizedHeaders> {
  // Read the raw IP before removing the headers.
  const rawXff = incoming.get('x-forwarded-for');
  const rawIp =
    extractClientIp(rawXff) ??
    incoming.get('x-real-ip') ??
    incoming.get('cf-connecting-ip') ??
    null;

  const anonIp = rawIp ? await hashIpWithPepper(rawIp, pepper) : 'unknown';

  // Build a new Headers object rather than mutating the original.
  const out = new Headers(incoming);

  for (const name of PII_HEADERS_TO_REMOVE) {
    out.delete(name);
  }

  // User-agent carries device/OS/browser fingerprint — remove it.
  out.delete('user-agent');

  // Set the anonymized IP for downstream rate-limiting and abuse detection.
  out.set('x-anon-ip', anonIp);

  return { headers: out, anonIp };
}
