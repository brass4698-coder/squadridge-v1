-- migrations/20260428_message_partitioning.sql
--
-- Example: partition the messages table by month for efficient retention
-- and scalable storage management.
--
-- NOTE: This is a STANDALONE EXAMPLE for reference and planning. The
-- production schema lives in supabase/migrations/ (managed by Supabase CLI).
-- Apply this pattern when migrating to a partitioned messages table in a
-- custom PostgreSQL deployment (e.g. self-hosted Postgres or RDS).
--
-- Prerequisites:
--   - pg_cron extension (CREATE EXTENSION IF NOT EXISTS pg_cron;)
--   - Postgres 11+ (declarative partitioning)
--
-- Usage:
--   psql -d <database> -f migrations/20260428_message_partitioning.sql
--
-- See DATA_RETENTION.md for retention policy context.
-- See docs/technical/data-model.md for the full schema.

-- ── Enable required extensions ───────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── Partitioned messages table ───────────────────────────────────────────────

-- Drop the old table if migrating (CAUTION: backup first).
-- DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE IF NOT EXISTS messages (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  conversation_id  uuid        NOT NULL,
  -- Ephemeral handle only — never a real user FK so account deletion does not
  -- cascade message rows (handled separately by the retention job).
  sender_handle    text        NOT NULL,
  -- AES-256-GCM ciphertext (base64url); plaintext never stored server-side.
  ciphertext       bytea       NOT NULL,
  -- Serialised IV for the AES-GCM operation (stored with the ciphertext).
  iv               bytea       NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  -- Optional: KMS-wrapped data key reference for field-level KMS integration.
  -- Leave NULL if using squad-level keys (current default).
  wrapped_key      text        DEFAULT NULL,
  kms_key_id       text        DEFAULT NULL,
  -- Arbitrary metadata (sequence number, reply_to, etc.). No plaintext message body.
  metadata         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  -- Partition key must be part of the primary key for declarative partitioning.
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Enforce: never add a plaintext message column.
-- COMMENT ON COLUMN messages.ciphertext IS 'AES-256-GCM ciphertext only. Never store plaintext.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Main access patterns: by conversation + time, by sender handle + time.
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS messages_created_at_idx
  ON messages (created_at DESC);

-- ── Create monthly partitions ────────────────────────────────────────────────
-- Extend this list forward each month or use the auto-partition function below.

CREATE TABLE IF NOT EXISTS messages_y2026m04 PARTITION OF messages
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS messages_y2026m05 PARTITION OF messages
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS messages_y2026m06 PARTITION OF messages
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS messages_y2026m07 PARTITION OF messages
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Default partition catches rows outside the defined ranges (prevents insert errors).
CREATE TABLE IF NOT EXISTS messages_default PARTITION OF messages DEFAULT;

-- ── Automated partition creation (pg_cron) ───────────────────────────────────

-- Function: create the next month's partition if it does not exist.
CREATE OR REPLACE FUNCTION create_next_month_messages_partition()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_next_month  date := date_trunc('month', now()) + interval '1 month';
  v_month_after date := v_next_month + interval '1 month';
  v_table_name  text := 'messages_y' ||
                        to_char(v_next_month, 'YYYY') || 'm' ||
                        to_char(v_next_month, 'MM');
  v_sql         text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = v_table_name
  ) THEN
    v_sql := format(
      'CREATE TABLE %I PARTITION OF messages FOR VALUES FROM (%L) TO (%L)',
      v_table_name,
      v_next_month::text,
      v_month_after::text
    );
    EXECUTE v_sql;
    RAISE NOTICE 'Created partition: %', v_table_name;
  END IF;
END;
$$;

-- Schedule partition creation on the 15th of each month at 02:00 UTC.
-- Adjust the cron expression as needed.
SELECT cron.schedule(
  'create-next-month-messages-partition',
  '0 2 15 * *',
  'SELECT create_next_month_messages_partition()'
);

-- ── Retention job ─────────────────────────────────────────────────────────────

-- Function: drop message partitions older than `retention_months`.
-- Dropping a partition is instantaneous (no vacuum needed) and releases storage immediately.
CREATE OR REPLACE FUNCTION drop_old_messages_partitions(retention_months integer DEFAULT 3)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_cutoff    date := date_trunc('month', now()) - (retention_months * interval '1 month');
  v_rec       record;
  v_year      text;
  v_month     text;
  v_part_date date;
BEGIN
  FOR v_rec IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'messages\_y%m%'
    ORDER BY tablename
  LOOP
    -- Parse year/month from table name like messages_y2026m04
    v_year  := substring(v_rec.tablename FROM 'messages_y(\d{4})m\d{2}');
    v_month := substring(v_rec.tablename FROM 'messages_y\d{4}m(\d{2})');
    IF v_year IS NULL OR v_month IS NULL THEN
      CONTINUE;
    END IF;
    v_part_date := (v_year || '-' || v_month || '-01')::date;
    IF v_part_date < v_cutoff THEN
      RAISE NOTICE 'Dropping old partition: %', v_rec.tablename;
      EXECUTE format('DROP TABLE IF EXISTS %I', v_rec.tablename);
    END IF;
  END LOOP;
END;
$$;

-- Schedule retention job: run on the 1st of each month at 03:00 UTC.
-- Retention window: 3 months (adjust retention_months parameter).
SELECT cron.schedule(
  'drop-old-messages-partitions',
  '0 3 1 * *',
  'SELECT drop_old_messages_partitions(3)'
);

-- ── Verify setup ─────────────────────────────────────────────────────────────

-- To verify partitions exist:
-- SELECT tablename FROM pg_tables WHERE tablename LIKE 'messages_%' ORDER BY tablename;

-- To verify cron jobs:
-- SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE '%messages%';

-- To manually trigger retention (e.g. in a one-off cleanup):
-- SELECT drop_old_messages_partitions(3);
