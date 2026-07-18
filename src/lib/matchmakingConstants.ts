/**
 * Matchmaking behavior (see `supabase/migrations/*matchmaking_queue.sql`).
 * Export copy-safe constants for UI and tests — keep in sync with SQL.
 */

/** Each squad is 2 perspective A + 2 perspective B. */
export const MATCHMAKING_SIDE_SIZE = 2;

/** `private.matchmaking_try_form_pool` repeats until fewer than 2 waiting per side. */
export const MATCHMAKING_SQUAD_TOTAL = 4;

/** Inserted squads use `expires_at = now() + interval '1 day'`. */
export const MATCHED_SQUAD_TTL_HOURS = 24;

/**
 * Waiting `match_queue` rows get `expires_at = now() + 7 days` (`set_match_queue_ttl`).
 * Hourly `sweep_matchmaking_queue` / `run_expired_data_cleanup` deletes expired rows.
 */
export const MATCH_QUEUE_TTL_DAYS = 7;

/**
 * Prefer Leave queue (`matchmaking_cancel_waiting`) when you stop waiting; the server
 * also expires stale waiting rows after {@link MATCH_QUEUE_TTL_DAYS} days.
 */
export const MATCH_QUEUE_NO_SERVER_TIMEOUT =
  'Queue entries expire after about a week on the server — use Leave queue if you stop waiting sooner.';
