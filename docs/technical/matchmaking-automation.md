# Matchmaking automation

## Default behavior (production)

- **Pairing** runs in Postgres: [`matchmaking_enqueue_and_try`](../../supabase/migrations/20260418130000_squad_peer_profiles_and_zk_pool.sql) inserts into `match_queue` and calls [`private.matchmaking_try_form_pool`](../../supabase/migrations/20260416164823_matchmaking_queue.sql), which forms squads when each side has enough waiting depth.
- **Sweep**: [`public.matchmaking_sweep_active_pools`](../../supabase/migrations/20260420120000_matchmaking_sweep_cron.sql) periodically re-runs `matchmaking_try_form_pool` for every `pool_key` that still has `waiting` rows—useful when no new enqueue happens (edge cases). Scheduled with **pg_cron** every three minutes when the extension is available (same pattern as TTL cleanup). Executable by **service_role** only (ops/manual); not exposed to anon JWTs.
- **Metrics** (migration [`20260420140000_matchmaking_sweep_metrics.sql`](../../supabase/migrations/20260420140000_matchmaking_sweep_metrics.sql)): each sweep inserts into **`matchmaking_sweep_runs`** (`pool_keys_swept`). RPC **`matchmaking_queue_stats`** returns JSON `{ total_waiting, by_pool: [...] }` for ops (service role only).
- **Client**: The match gate page uses **Supabase Realtime** on `match_queue` for the current user as the primary refresh signal, with a **slower fallback poll** when Realtime is connected (reduces redundant RPCs) and a **faster poll** when Realtime is not yet connected.

## Operations

- Verify cron after deploy: [Matchmaking cron (operations)](../operations/matchmaking-cron.md).

## Extension points

| Direction | Notes |
|-----------|--------|
| **Notifications** | Deploy [`match-notify`](../../supabase/functions/match-notify/index.ts); set Edge secret **`MATCH_QUEUE_WEBHOOK_SECRET`**, then add a **Database Webhook** in the Dashboard for `match_queue` (e.g. UPDATE) to `https://<ref>.supabase.co/functions/v1/match-notify` with header `x-match-queue-secret`. Extend the function to call email/SMS providers. |
| **Smarter `pool_key`** | Still output a string consumed by the same RPCs; richer routing lives in app or new SQL. |
| **Load testing** | `npm run matchmaking:soak` — see [`scripts/matchmaking-soak.mjs`](../../scripts/matchmaking-soak.mjs) (service role stats, optional `--enqueue` with anonymous users). |

See also: [threat model § matchmaking](../security/threat-model.md) for data visibility.
