# Matchmaking authority (server-side)

Pool dequeue and squad formation run **inside Postgres**, not in the browser.

## RPC `matchmaking_enqueue_and_try`

Defined in migrations such as [`20260416164823_matchmaking_queue.sql`](../../supabase/migrations/20260416164823_matchmaking_queue.sql):

1. **`SECURITY DEFINER`** — executes with privileges needed to insert/update queue rows and create squads.
2. Enqueues or updates the caller’s **`match_queue`** row under **`auth.uid()`**, then **`PERFORM private.matchmaking_try_form_pool(pool_key)`** in the **same transaction** as the enqueue body.

## Concurrency and races

Helper **`private.matchmaking_try_form_pool`** selects waiting rows per side with **`FOR UPDATE SKIP LOCKED`**. Concurrent transactions dequeue disjoint sets of rows instead of blocking indefinitely; insufficient depth per side exits the loop without forming a squad.

Under pilot load this provides **serialized formation per pool_key slice** without a separate advisory lock. If observability shows starvation or duplicate squad assignments (unexpected), escalate with reproduction traces — migrations would then consider stricter locking around **`matchmaking_try_form_pool`** only after measurement.

See also [`matchmaking-automation.md`](./matchmaking-automation.md) for sweep cron and metrics.
