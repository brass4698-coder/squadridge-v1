-- migrations/20260428_message_partitioning.sql
--
-- Message table partitioning and rate-limit token table.
--
-- Status: SCAFFOLD — review partition boundaries and retention window
-- with your DBA before applying to production.
--
-- Apply with:
--   psql $DATABASE_URL -f migrations/20260428_message_partitioning.sql
--
-- Prerequisites: PostgreSQL 14+, pg_cron extension (optional — for automated retention).
--
-- See docs/Architecture.md, DATA_RETENTION.md, scripts/retention_job.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- messages (partitioned by month)
-- ---------------------------------------------------------------------------
-- If messages already exist in a non-partitioned table, migrate carefully:
--   1. Rename existing table to messages_legacy.
--   2. Create new partitioned table (below).
--   3. INSERT INTO messages SELECT * FROM messages_legacy;
--   4. Drop messages_legacy after verification.

CREATE TABLE IF NOT EXISTS messages (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid          NOT NULL,
  -- Ephemeral handle only — never a persistent user id or real name.
  sender_handle   text          NOT NULL CHECK (char_length(sender_handle) <= 64),
  -- Encrypted client-side or server-side (AES-GCM). Raw plaintext must never be stored.
  ciphertext      bytea         NOT NULL,
  -- Base64 IV used for AES-GCM decryption (16 bytes).
  iv              text          NOT NULL CHECK (char_length(iv) = 24),
  -- Reference to the wrapped data-key in your KMS / key store.
  wrapped_key_ref text          NOT NULL,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  -- Minimal, privacy-safe metadata. No user PII.
  metadata        jsonb         NOT NULL DEFAULT '{}'::jsonb
) PARTITION BY RANGE (created_at);

-- Indexes on the parent table are inherited by each partition.
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages (conversation_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Monthly partitions (bootstrap: current month + next two months)
-- Extend this list as part of your monthly ops runbook, or use pg_partman.
-- ---------------------------------------------------------------------------

-- April 2026
CREATE TABLE IF NOT EXISTS messages_2026_04
  PARTITION OF messages
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- May 2026
CREATE TABLE IF NOT EXISTS messages_2026_05
  PARTITION OF messages
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- June 2026
CREATE TABLE IF NOT EXISTS messages_2026_06
  PARTITION OF messages
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- ---------------------------------------------------------------------------
-- rate_limit_tokens (hashed, short-lived)
-- ---------------------------------------------------------------------------
-- Stores hashed session/device tokens for server-side rate limiting.
-- Raw IPs or user identifiers must NEVER be stored here.

CREATE TABLE IF NOT EXISTS rate_limit_tokens (
  token_hash  text          PRIMARY KEY CHECK (char_length(token_hash) = 64),
  request_count  integer    NOT NULL DEFAULT 1,
  window_start   timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL DEFAULT now() + INTERVAL '1 minute'
);

CREATE INDEX IF NOT EXISTS rate_limit_tokens_expires_idx
  ON rate_limit_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- pg_cron: automated retention job (optional — requires pg_cron extension)
-- ---------------------------------------------------------------------------
-- Uncomment and adapt if pg_cron is available in your Supabase project
-- (available on Pro tier and above, or self-hosted Postgres + pg_cron).

-- SELECT cron.schedule(
--   'purge-expired-rate-limit-tokens',
--   '*/5 * * * *',  -- every 5 minutes
--   $$DELETE FROM rate_limit_tokens WHERE expires_at < now()$$
-- );

-- SELECT cron.schedule(
--   'drop-old-message-partitions',
--   '0 3 1 * *',   -- 03:00 on the 1st of every month
--   $$
--     -- Drop partitions older than 30 days.
--     -- See scripts/retention_job.sql for the full parametric version.
--     DO $$
--     DECLARE
--       cutoff date := date_trunc('month', now() - INTERVAL '30 days')::date;
--       partition_name text;
--     BEGIN
--       FOR partition_name IN
--         SELECT inhrelid::regclass::text
--         FROM   pg_inherits
--         WHERE  inhparent = 'messages'::regclass
--       LOOP
--         -- Only drop if the partition covers dates before the cutoff.
--         IF (regexp_match(partition_name, '_(\d{4})_(\d{2})$'))[1]::int * 100
--            + (regexp_match(partition_name, '_(\d{4})_(\d{2})$'))[2]::int
--            < extract(year from cutoff) * 100 + extract(month from cutoff)
--         THEN
--           EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
--           RAISE NOTICE 'Dropped partition: %', partition_name;
--         END IF;
--       END LOOP;
--     END;
--     $$;
--   $$
-- );

COMMIT;
