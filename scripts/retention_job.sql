-- scripts/retention_job.sql
--
-- Data retention enforcement job.
-- Run on a schedule (pg_cron, external cron, or your CI pipeline).
--
-- Status: SCAFFOLD — adjust RETENTION_DAYS and table names to match your schema.
-- Never run this script against production without a dry run first (use the
-- COUNT queries below to preview what would be deleted).
--
-- Usage:
--   # Dry run (counts only):
--   psql $DATABASE_URL -v RETENTION_DAYS=30 -v DRY_RUN=true -f scripts/retention_job.sql
--
--   # Live run:
--   psql $DATABASE_URL -v RETENTION_DAYS=30 -v DRY_RUN=false -f scripts/retention_job.sql
--
-- See DATA_RETENTION.md and migrations/20260428_message_partitioning.sql.

-- ---------------------------------------------------------------------------
-- Configuration (override via psql -v VAR=value)
-- ---------------------------------------------------------------------------
\set RETENTION_DAYS 30
\set DRY_RUN true

DO $$
DECLARE
  cutoff         timestamptz := now() - (:'RETENTION_DAYS' || ' days')::interval;
  dry_run        boolean     := :'DRY_RUN'::boolean;
  rows_deleted   bigint;
  partition_name text;
  cutoff_month   text;
BEGIN
  RAISE NOTICE '=== SquadRidge retention job ===';
  RAISE NOTICE 'Cutoff: %   Dry run: %', cutoff, dry_run;
  RAISE NOTICE '';

  -- -------------------------------------------------------------------------
  -- 1. Expire rate-limit tokens
  -- -------------------------------------------------------------------------
  IF dry_run THEN
    SELECT count(*) INTO rows_deleted
    FROM rate_limit_tokens
    WHERE expires_at < now();
    RAISE NOTICE '[DRY RUN] Would delete % expired rate_limit_token rows', rows_deleted;
  ELSE
    DELETE FROM rate_limit_tokens WHERE expires_at < now();
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % expired rate_limit_token rows', rows_deleted;
  END IF;

  -- -------------------------------------------------------------------------
  -- 2. Drop old message partitions
  -- -------------------------------------------------------------------------
  -- Identify the oldest month still within retention.
  cutoff_month := to_char(date_trunc('month', cutoff), 'YYYY_MM');

  FOR partition_name IN
    SELECT inhrelid::regclass::text AS pname
    FROM   pg_inherits
    WHERE  inhparent = 'messages'::regclass
    ORDER  BY pname
  LOOP
    -- Partition names are expected to be messages_YYYY_MM.
    -- Drop only partitions whose month is strictly before the cutoff month.
    IF regexp_replace(partition_name, '^.*messages_', '') < cutoff_month THEN
      IF dry_run THEN
        RAISE NOTICE '[DRY RUN] Would drop partition: %', partition_name;
      ELSE
        RAISE NOTICE 'Dropping partition: %', partition_name;
        EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
        RAISE NOTICE 'Dropped partition: %', partition_name;
      END IF;
    ELSE
      RAISE NOTICE 'Keeping partition (within retention): %', partition_name;
    END IF;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 3. Anonymise resolved moderation flags beyond 90-day window
  -- -------------------------------------------------------------------------
  -- Replace sender_handle with a deletion marker.
  -- The exact table/column names depend on your moderation schema.
  -- Uncomment and adapt when the moderation schema is defined.
  --
  -- IF dry_run THEN
  --   SELECT count(*) INTO rows_deleted
  --   FROM moderation_flags
  --   WHERE resolved_at < now() - INTERVAL '90 days'
  --     AND sender_handle != '[deleted]';
  --   RAISE NOTICE '[DRY RUN] Would anonymise % moderation flag rows', rows_deleted;
  -- ELSE
  --   UPDATE moderation_flags
  --   SET sender_handle = '[deleted]'
  --   WHERE resolved_at < now() - INTERVAL '90 days'
  --     AND sender_handle != '[deleted]';
  --   GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  --   RAISE NOTICE 'Anonymised % moderation flag rows', rows_deleted;
  -- END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== Retention job complete ===';
END;
$$;
