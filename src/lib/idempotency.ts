/**
 * Helpers for conflict-safe retries on critical writes (invite, release, pull-back).
 * Keys must never include message bodies or PII — ids and action names only.
 */

export function buildIdempotencyKey(parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((p) => p !== null && p !== undefined && String(p).length > 0)
    .map((p) => String(p).trim())
    .join(':');
}

/** Stable browser-session nonce for a logical operation (survives double-click). */
export function rememberIdempotencyKey(storageKey: string, factory: () => string): string {
  if (typeof sessionStorage === 'undefined') return factory();
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const next = factory();
  sessionStorage.setItem(storageKey, next);
  return next;
}

export function clearIdempotencyKey(storageKey: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(storageKey);
}
