/**
 * Salted, truncated SHA-256 of the Supabase `auth.users.id` for Sentry context.
 *
 * The raw UUID is not directly identifying, but it is stably linkable across
 * Supabase logs / DB rows / Edge logs. If the Sentry project is misconfigured
 * or compromised, the raw id becomes a re-identification primitive. Hashing
 * with a build-time salt and truncating to 16 hex chars keeps the value
 * useful for cross-event correlation in Sentry itself while making it
 * non-trivial to link back to a specific user without the salt.
 *
 * Salt source: `VITE_SENTRY_USER_HASH_SALT` (validated in {@link ./env.ts}).
 * In dev with no salt set, a sentinel string is used so the hash function is
 * still deterministic — it's not a privacy boundary in dev anyway.
 */

const DEV_FALLBACK_SALT = 'mendguild.sentry.dev-fallback';
const HEX_CHARS = '0123456789abcdef';

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    out += HEX_CHARS[(b >>> 4) & 0xf]! + HEX_CHARS[b & 0xf]!;
  }
  return out;
}

function getConfiguredSalt(): string {
  const raw = import.meta.env.VITE_SENTRY_USER_HASH_SALT;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return DEV_FALLBACK_SALT;
}

/**
 * Compute the truncated salted hash for `userId`.
 *
 * @returns 16 lowercase hex chars (64 bits — collision-resistant enough for
 *   Sentry user-id correlation while being short enough for tag values).
 *
 * Public for unit testing; production code should call
 * {@link ./sentry.ts#setSentryUserContext} which caches the result.
 *
 * Exported separately to keep the hashing logic pure and testable. Accepts
 * an optional `salt` override (used by tests; production callers should rely
 * on `VITE_SENTRY_USER_HASH_SALT`).
 */
export async function hashUserIdForSentry(userId: string, salt?: string): Promise<string> {
  const usedSalt = typeof salt === 'string' ? salt : getConfiguredSalt();
  const subtle =
    typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle
      ? globalThis.crypto.subtle
      : null;
  if (!subtle) {
    throw new Error('SubtleCrypto unavailable; cannot hash user id for Sentry');
  }
  const data = new TextEncoder().encode(`${usedSalt}:${userId}`);
  const digest = await subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest)).slice(0, 16);
}

/** Regex matching the truncated hex form returned by {@link hashUserIdForSentry}. */
export const SENTRY_USER_HASH_PATTERN = /^[0-9a-f]{16}$/;

export function isSentryUserHash(value: unknown): value is string {
  return typeof value === 'string' && SENTRY_USER_HASH_PATTERN.test(value);
}
