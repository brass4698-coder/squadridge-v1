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
 * MVP: queue rows are not auto-cancelled by age in Postgres. Users leave via
 * `matchmaking_cancel_waiting` or by matching.
 */
export const MATCH_QUEUE_NO_SERVER_TIMEOUT =
  'There is no automatic server-side timeout for the queue in this MVP — use Leave queue when you stop waiting.';
