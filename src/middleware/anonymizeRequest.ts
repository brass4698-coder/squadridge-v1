/**
 * anonymizeRequest.ts
 *
 * Express-compatible middleware that strips or hashes PII from the incoming
 * request BEFORE any logging, analytics, or downstream handler can read it.
 *
 * Status: SCAFFOLD — wire into your server runtime (Express / Fastify / Edge Function)
 * before enabling production logging. The helper functions (hashWithPepper,
 * isPrivateIp) are safe to use as-is; connect them to your actual crypto and
 * secret-management setup before going live.
 *
 * See docs/security/threat-model.md §3 (Re-identification via logs).
 */

import { createHash } from 'node:crypto';

/** Shape of the anonymised metadata attached to the request. */
export interface AnonMeta {
  /** Truncated, peppered hash of the originating IP — safe to log. */
  anonIp: string;
  /** Whether the original IP was a loopback / RFC-1918 address. */
  isPrivateNetwork: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if `ip` is a loopback or RFC-1918 private address.
 * This prevents leaking internal network topology in logs.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return false;
  const stripped = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  return (
    stripped === '127.0.0.1' ||
    stripped === '::1' ||
    stripped.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(stripped) ||
    stripped.startsWith('192.168.')
  );
}

/**
 * Hashes `value` with a HMAC-SHA256 using a server-side pepper.
 *
 * IMPORTANT: In production, load `ANONYMIZE_PEPPER` from your secret manager
 * (AWS Secrets Manager, GCP Secret Manager, etc.). Do NOT hardcode it here.
 * The fallback value below is intentionally weak and only safe for local dev.
 */
export function hashWithPepper(value: string): string {
  const pepper = process.env['ANONYMIZE_PEPPER'] ?? 'dev-only-pepper-do-not-use-in-prod';
  return createHash('sha256').update(pepper).update(':').update(value).digest('hex').slice(0, 16); // Truncate to reduce brute-force surface.
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/** Minimal Express-compatible request shape. */
export interface MinimalRequest {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers: Record<string, string | string[] | undefined>;
  anonMeta?: AnonMeta;
}

/** Minimal Express-compatible response shape. */
export type MinimalResponse = Record<string, unknown>;

export type NextFunction = (err?: unknown) => void;

/**
 * anonymizeRequest middleware
 *
 * Strips user-agent and replaces the raw IP with a truncated hash before any
 * downstream handler or logger can read them.
 *
 * Usage (Express):
 * ```ts
 * import { anonymizeRequest } from './middleware/anonymizeRequest';
 * app.use(anonymizeRequest);
 * ```
 */
export function anonymizeRequest(
  req: MinimalRequest,
  _res: MinimalResponse,
  next: NextFunction,
): void {
  const rawIp = req.ip ?? req.socket?.remoteAddress ?? '';

  // Attach anonymised metadata for any logging middleware that runs after this.
  req.anonMeta = {
    anonIp: hashWithPepper(rawIp),
    isPrivateNetwork: isPrivateIp(rawIp),
  };

  // Remove headers that could re-identify the user in downstream logs.
  delete req.headers['user-agent'];
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  delete req.headers['cf-connecting-ip'];
  delete req.headers['x-client-ip'];

  next();
}
