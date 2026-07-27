/**
 * Client-side helpers mirroring match_queue TTL / expire semantics
 * (`set_match_queue_ttl` + `sweep_matchmaking_queue` in Postgres).
 */

/** Matches `NEW.expires_at := now() + INTERVAL '7 days'` on match_queue insert. */
export const MATCH_QUEUE_TTL_DAYS = 7;

export type MatchQueueExpireRow = {
  id: string;
  user_id: string;
  expires_at: string | null;
};

export function isMatchQueueExpired(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return Number.isFinite(t) && t < nowMs;
}

/** Same predicate as `DELETE … WHERE expires_at < now()` in sweep_matchmaking_queue. */
export function filterUnexpiredMatchQueueRows<T extends { expires_at?: string | null }>(
  rows: T[],
  nowMs: number = Date.now(),
): T[] {
  return rows.filter((row) => !isMatchQueueExpired(row.expires_at ?? null, nowMs));
}

export function defaultMatchQueueExpiresAt(enqueuedAtMs: number = Date.now()): string {
  return new Date(enqueuedAtMs + MATCH_QUEUE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
