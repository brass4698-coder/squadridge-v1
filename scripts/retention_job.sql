-- =============================================================================
-- Data retention job (pg_cron scaffold)
-- =============================================================================
-- File: scripts/retention_job.sql
-- Author: Security & Privacy Infrastructure PR
--
-- SCAFFOLD — This file shows the patterns for automated data retention.
-- The jobs below are NOT yet scheduled in production.
--
-- To deploy:
--   1. Ensure pg_cron is enabled in your Supabase project:
--      (Dashboard → Database → Extensions → pg_cron)
--   2. Schedule each job from a superuser-privileged connection:
--      SELECT cron.schedule('job_name', 'cron_schedule', $$query$$);
--   3. Test the jobs manually first by running the DELETE/DROP statements
--      with LIMIT clauses and DRY_RUN logic before enabling the cron.
--   4. Monitor with: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
--
-- Retention windows (from DATA_RETENTION.md):
--   - Archived squad messages:       90 days after squad.archived_at
--   - Match queue rows:              24 hours after creation or on match
--   - ZK proof submissions:         180 days
--   - Moderation audit logs:         90 days
--   - Crisis alert events:           180 days
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: create_monthly_partition (call this before each new month)
-- ---------------------------------------------------------------------------
-- This function creates next-month's partition for messages_partitioned if it
-- does not already exist. Schedule it to run on the 25th of each month so the
-- partition is ready before the 1st.
--
-- NOTE: messages_partitioned must already exist (see 20260429_message_partitioning.sql).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_next_message_partition()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_month      date := date_trunc('month', now() + interval '1 month');
    partition_name  text := 'messages_y' ||
                            to_char(next_month, 'YYYY') || 'm' ||
                            to_char(next_month, 'MM');
    range_start     text := to_char(next_month, 'YYYY-MM-01');
    range_end       text := to_char(next_month + interval '1 month', 'YYYY-MM-01');
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name AND n.nspname = 'public'
    ) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS public.%I
             PARTITION OF public.messages_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, range_start, range_end
        );
        RAISE NOTICE 'Created partition: %', partition_name;
    ELSE
        RAISE NOTICE 'Partition already exists: %', partition_name;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.create_next_message_partition IS
'Creates next month''s messages_partitioned child table. Schedule on the 25th of each month.';

-- ---------------------------------------------------------------------------
-- Job 1: Drop old message partitions (90-day retention for archived squads)
-- ---------------------------------------------------------------------------
-- Drops any messages_partitioned child table whose data is entirely older than
-- 90 days. Only drops partitions where ALL rows in the partition are for
-- archived squads (or the partition is entirely outside the retention window).
--
-- IMPORTANT: This drops an entire monthly partition. Any non-archived squad
-- messages in that partition would also be deleted. Before enabling this job,
-- ensure your application moves active-squad messages to current partitions
-- and only old, archived-squad data lives in expiring partitions.
--
-- For a safer approach during transition: use the soft-delete version below
-- which marks rows deleted rather than dropping partitions.
-- ---------------------------------------------------------------------------

-- Soft-delete version (safer, no DROP TABLE):
-- Run daily. Marks messages for archived squads older than 90 days as deleted.
-- Hard-delete can be a separate, less-frequent job after verification.

CREATE OR REPLACE FUNCTION public.soft_delete_expired_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rows_affected integer;
    cutoff        timestamptz := now() - interval '90 days';
BEGIN
    -- We use the messages table (live table) here.
    -- Once messages_partitioned is in production, update this to use that table.
    UPDATE public.messages m
    SET    status = 'retracted'
    FROM   public.squads s
    WHERE  m.squad_id = s.id
      AND  s.status = 'archived'
      AND  s.archived_at IS NOT NULL
      AND  s.archived_at < cutoff
      AND  m.status != 'retracted';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_expired_messages IS
'Marks messages for archived squads older than 90 days as retracted (soft-delete).
Scaffold: run manually first; schedule via pg_cron after validation.';

-- ---------------------------------------------------------------------------
-- Job 2: Delete expired matchmaking queue rows
-- ---------------------------------------------------------------------------
-- Rows older than 24 hours that were not matched should not persist.

CREATE OR REPLACE FUNCTION public.delete_expired_match_queue()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rows_affected integer;
BEGIN
    DELETE FROM public.match_queue
    WHERE  created_at < now() - interval '24 hours'
      AND  status != 'matched';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$;

COMMENT ON FUNCTION public.delete_expired_match_queue IS
'Removes unmatched match_queue rows older than 24 hours. Safe to run hourly.';

-- ---------------------------------------------------------------------------
-- Job 3: Delete expired ZK proof submissions (180-day retention)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_expired_zk_proofs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rows_affected integer;
BEGIN
    DELETE FROM public.zk_proof_submissions
    WHERE  created_at < now() - interval '180 days';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$;

COMMENT ON FUNCTION public.delete_expired_zk_proofs IS
'Removes ZK proof submission rows older than 180 days. Safe to run daily.';

-- ---------------------------------------------------------------------------
-- Job 4: Delete expired moderation audit log rows (90-day retention)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_expired_moderation_audit()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rows_affected integer;
BEGIN
    DELETE FROM public.moderation_audit_log
    WHERE  created_at < now() - interval '90 days';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$;

COMMENT ON FUNCTION public.delete_expired_moderation_audit IS
'Removes moderation audit log rows older than 90 days. Run daily.';

-- =============================================================================
-- Schedule these jobs once you are ready:
-- =============================================================================
-- (Run the following in a superuser session, not from application code)
--
-- SELECT cron.schedule('create-next-partition',  '0 10 25 * *',  'SELECT public.create_next_message_partition()');
-- SELECT cron.schedule('soft-delete-messages',   '0 2  *  * *',  'SELECT public.soft_delete_expired_messages()');
-- SELECT cron.schedule('delete-match-queue',      '30 * *  * *',  'SELECT public.delete_expired_match_queue()');
-- SELECT cron.schedule('delete-zk-proofs',       '0 3  *  * *',  'SELECT public.delete_expired_zk_proofs()');
-- SELECT cron.schedule('delete-mod-audit',       '0 3  *  * *',  'SELECT public.delete_expired_moderation_audit()');
--
-- Verify scheduled jobs:
-- SELECT jobid, jobname, schedule, active, command FROM cron.job;
--
-- Check run history (last 20 runs per job):
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- =============================================================================
