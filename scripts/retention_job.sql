-- scripts/retention_job.sql
--
-- PURPOSE
-- -------
-- pg_cron job definition for the automated message-retention enforcement.
-- This script:
--   1. Defines a function that drops message partitions older than the
--      configured retention window.
--   2. Schedules that function to run nightly via pg_cron.
--
-- PREREQUISITES
-- -------------
-- - pg_cron extension installed and enabled.
-- - The `messages_partitioned` table and `partition_drop_log` table from
--   migrations/20260428_message_partitioning.sql.
-- - The executing role must have DROP TABLE privilege on message partitions.
--   In Supabase, this typically means running as the `postgres` superuser or a
--   dedicated `retention_agent` role.
--
-- RETENTION WINDOW
-- ----------------
-- Default: 90 days (3 calendar months, inclusive of the current month).
-- To change: update the `p_retention_days` parameter in the cron job or the
-- function call at the bottom of this script.
--
-- SAFETY NOTES
-- ------------
-- 1. This script is DESTRUCTIVE by design — it drops table partitions. Always
--    test in a staging environment first.
-- 2. Run `EXPLAIN` on the query in `list_droppable_partitions` before scheduling
--    to confirm it identifies the correct partitions.
-- 3. Keep the `partition_drop_log` table for audit purposes; it is retained for
--    1 year per DATA_RETENTION.md.
-- 4. If you need to extend retention for a specific partition (legal hold),
--    rename it (e.g. `messages_partitioned_2026_01_hold`) before this job runs.
--    The job matches partitions by name pattern `messages_partitioned_YYYY_MM`.
--
-- SCAFFOLD NOTES
-- --------------
-- [ ] Enable pg_cron on your Supabase project:
--     Dashboard → Database → Extensions → pg_cron → Enable
-- [ ] Set the cron schedule to match your business hours (run off-peak).
-- [ ] Add alerting when a partition drops (webhook or Slack via pg_notify).
-- [ ] Consider a dry-run mode (LOG only, no DROP) before enabling.

-- ─── Install pg_cron (if not already enabled) ────────────────────────────────
-- Run this once as superuser in Supabase SQL editor or psql:
--
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   GRANT USAGE ON SCHEMA cron TO postgres;

-- ─── Retention function ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION drop_old_message_partitions(
  p_retention_days integer DEFAULT 90,
  p_dry_run        boolean DEFAULT false
)
RETURNS TABLE (
  partition_name text,
  partition_date date,
  action         text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff_date    date;
  v_partition_name text;
  v_partition_date date;
  v_row_estimate   bigint;
  v_schema_name    text := 'public';
  v_table_pattern  text := 'messages\_partitioned\_\d{4}\_\d{2}';
BEGIN
  -- Anything with a partition month ENDING before the cutoff should be dropped.
  -- We keep the current month and the previous (p_retention_days / 30) months.
  v_cutoff_date := date_trunc('month', now() - (p_retention_days || ' days')::interval)::date;

  FOR v_partition_name IN
    SELECT relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = v_schema_name
      AND c.relkind = 'r'  -- ordinary table (partition leaf)
      AND relname ~ v_table_pattern
    ORDER BY relname
  LOOP
    -- Parse YYYY_MM from the partition name (format: messages_partitioned_YYYY_MM)
    BEGIN
      v_partition_date := to_date(
        regexp_replace(v_partition_name, '^.*_(\d{4})_(\d{2})$', '\1-\2-01'),
        'YYYY-MM-DD'
      );
    EXCEPTION WHEN others THEN
      RAISE WARNING 'Could not parse date from partition name %', v_partition_name;
      CONTINUE;
    END;

    -- Only drop partitions that ended before the cutoff date.
    -- A partition for month M covers [M, M+1), so we drop if M+1 <= cutoff
    -- (i.e. the entire partition is before the cutoff).
    IF (v_partition_date + interval '1 month')::date <= v_cutoff_date THEN
      -- Estimate row count for the audit log.
      SELECT reltuples::bigint INTO v_row_estimate
      FROM pg_class
      WHERE relname = v_partition_name;

      IF p_dry_run THEN
        partition_name := v_partition_name;
        partition_date := v_partition_date;
        action         := 'DRY_RUN_WOULD_DROP';
        RETURN NEXT;
      ELSE
        -- Log before dropping so we have a record even if the drop fails.
        INSERT INTO partition_drop_log (
          partition_name,
          table_name,
          row_estimate,
          retention_days,
          notes
        ) VALUES (
          v_partition_name,
          'messages_partitioned',
          v_row_estimate,
          p_retention_days,
          'Automated retention drop by drop_old_message_partitions()'
        );

        -- Drop the partition (CASCADE removes dependent indexes automatically).
        EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', v_schema_name, v_partition_name);

        partition_name := v_partition_name;
        partition_date := v_partition_date;
        action         := 'DROPPED';
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$$;

COMMENT ON FUNCTION drop_old_message_partitions IS
  'Drop monthly message partitions older than p_retention_days. '
  'Set p_dry_run=true to preview without dropping. '
  'Logs all drops to partition_drop_log. See DATA_RETENTION.md.';

-- ─── Schedule the retention job with pg_cron ─────────────────────────────────
-- Runs daily at 02:00 UTC (low-traffic window for most deployments).
-- Adjust the cron expression and retention_days to match your policy.
--
-- IMPORTANT: Uncomment and run this block once pg_cron is enabled:

/*
SELECT cron.schedule(
  'message-partition-retention',     -- job name (must be unique)
  '0 2 * * *',                       -- daily at 02:00 UTC
  $$
    SELECT partition_name, action
    FROM drop_old_message_partitions(
      p_retention_days => 90,        -- adjust to match DATA_RETENTION.md
      p_dry_run        => false
    );
  $$
);
*/

-- ─── Create next month's partition (proactive) ────────────────────────────────
-- Also schedule creation of the next calendar month's partition so the table
-- never "falls off" at month boundaries. Supabase pg_cron supports this.
--
-- IMPORTANT: Uncomment and run this block once pg_cron is enabled:

/*
SELECT cron.schedule(
  'message-partition-create-next-month',
  '0 1 25 * *',   -- 25th of each month at 01:00 UTC (creates next month's partition)
  $$
    DO $$
    DECLARE
      v_next_month   date := date_trunc('month', now() + interval '1 month');
      v_end_month    date := v_next_month + interval '1 month';
      v_table_name   text := 'messages_partitioned_' || to_char(v_next_month, 'YYYY_MM');
      v_sql          text;
    BEGIN
      v_sql := format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF messages_partitioned '
        'FOR VALUES FROM (%L) TO (%L)',
        v_table_name,
        v_next_month,
        v_end_month
      );
      EXECUTE v_sql;
      RAISE NOTICE 'Created partition %', v_table_name;
    END;
    $$;
  $$
);
*/

-- ─── Verify pg_cron jobs (run after scheduling) ──────────────────────────────
-- SELECT jobid, schedule, command FROM cron.job WHERE jobname LIKE 'message-partition-%';

-- ─── Manual test (dry run) ───────────────────────────────────────────────────
-- To preview which partitions would be dropped without dropping them:
-- SELECT * FROM drop_old_message_partitions(p_retention_days => 90, p_dry_run => true);
