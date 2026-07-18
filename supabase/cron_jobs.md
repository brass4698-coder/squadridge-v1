# pg_cron job inventory (SquadRidge)
#
# Supabase CLI `config.toml` does **not** support a `[db.cron_jobs]` key
# (unknown keys fail config decode). Schedules are applied by SQL migrations
# on `db reset` / `db push`. Keep this file aligned with those migrations.

| jobname | schedule | command | migration |
|---------|----------|---------|-----------|
| `cleanup-expired-data` | `0 * * * *` | `SELECT public.run_expired_data_cleanup();` | `20260718071000_ttl_cleanup_audit_and_zk_expiry.sql` (supersedes inline deletes from `20260418090000_ttl_cleanup.sql`) |
| `matchmaking-sweep-active-pools` | `*/3 * * * *` | `SELECT public.matchmaking_sweep_active_pools();` | `20260420120000_matchmaking_sweep_cron.sql` |

`run_expired_data_cleanup` purges: `messages`, `match_queue`, `squads`, `zk_proof_submissions`, logging `moderation_audit_log.action = 'ttl_purge'` before each batch delete.
