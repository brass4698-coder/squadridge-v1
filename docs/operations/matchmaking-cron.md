# Matchmaking sweep (pg_cron) — verification

After applying [`supabase/migrations/20260420120000_matchmaking_sweep_cron.sql`](../../supabase/migrations/20260420120000_matchmaking_sweep_cron.sql) (and any follow-up metrics migration), confirm the scheduled job exists on **staging** and **production**.

## 1. Extension

In the Supabase Dashboard: **Database → Extensions** — ensure **pg_cron** is enabled (same as TTL cleanup).

## 2. Job registered

Run in **SQL Editor** (postgres role):

```sql
SELECT jobid, jobname, schedule, command, nodename, active
FROM cron.job
WHERE jobname = 'matchmaking-sweep-active-pools';
```

Expected: `schedule` = `*/3 * * * *`, `command` containing `matchmaking_sweep_active_pools`, `active` = true.

If the row is missing, the migration’s `DO` block may not have run (e.g. `pg_cron` unavailable in that environment). Re-run the migration SQL or schedule manually:

```sql
SELECT cron.schedule(
  'matchmaking-sweep-active-pools',
  '*/3 * * * *',
  $$SELECT public.matchmaking_sweep_active_pools();$$
);
```

## 3. Manual sweep (service role)

From a trusted environment only, using the **service role** key (never in client bundles):

```sql
SELECT public.matchmaking_sweep_active_pools();
```

## 4. Metrics

If [`20260420140000_matchmaking_sweep_metrics.sql`](../../supabase/migrations/20260420140000_matchmaking_sweep_metrics.sql) is deployed, see [Matchmaking automation](../technical/matchmaking-automation.md) and query:

```sql
SELECT * FROM public.matchmaking_sweep_runs ORDER BY ran_at DESC LIMIT 20;

SELECT public.matchmaking_queue_stats();
```

(service role or SQL Editor as postgres.)
