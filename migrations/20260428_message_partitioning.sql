-- migrations/20260428_message_partitioning.sql
--
-- PURPOSE
-- -------
-- Create a partitioned `messages` table that stores encrypted message content
-- alongside the metadata needed for retention and moderator review.
--
-- DESIGN DECISIONS
-- ----------------
-- 1. Partition by RANGE on `created_at` (monthly partitions). This lets us
--    enforce the data-retention window by dropping the entire partition rather
--    than running a slow `DELETE WHERE created_at < ...` on millions of rows.
--    See DATA_RETENTION.md for the retention windows.
--
-- 2. Message content is stored as encrypted ciphertext (bytea). The encryption
--    key is never stored in this table — it lives in `squads.message_encryption_key`
--    (or, post-KMS migration, in a wrapped-key column + KMS). See
--    src/utils/encryption.ts scaffold and docs/security/encryption-scope.md.
--
-- 3. `iv` and `tag` are separate columns so the DB schema is self-documenting
--    about the AES-GCM structure (ciphertext | IV | GCM authentication tag).
--    In the current application layer (src/lib/messageCrypto.ts) these are
--    bundled into a JSON payload; this migration shows the target schema for
--    future KMS integration where they'd be stored separately.
--
-- 4. `wrapped_key_ref` is a reference to the KMS-wrapped data key used to
--    encrypt this specific message. In the MVP this column is nullable (we use
--    the squad-level key). In the KMS migration this should be NOT NULL.
--
-- 5. `metadata` (jsonb) holds routing and moderation metadata (sender handle,
--    squad_id, content warnings, etc.) but NOT the plaintext message body.
--    Be careful what you put here — jsonb is not encrypted.
--
-- 6. `sender_handle` is an ephemeral pseudonym (not linked to real identity
--    in this table). Cross-squad linking would require joining against
--    `squad_members` and `users` — that join is privilege-gated by RLS.
--
-- RETENTION ENFORCEMENT
-- ---------------------
-- Monthly partitions are dropped by the pg_cron job in scripts/retention_job.sql.
-- The default retention window is 90 days (3 monthly partitions).
-- To change the window, adjust the retention job — no schema change required.
--
-- NOTE: This migration creates the schema alongside the existing Supabase
-- migrations in supabase/migrations/. It is standalone and additive. If you
-- have a `messages` table already (the SquadRidge production table), do NOT
-- apply this migration against that table — it is a forward-looking reference
-- for a future refactor or a greenfield deployment.
--
-- SCAFFOLD NOTES
-- --------------
-- [ ] Before production use: decide whether to migrate the existing `messages`
--     table to this schema or keep them separate.
-- [ ] Wire `wrapped_key_ref` once KMS envelope encryption is deployed.
-- [ ] Add column-level encryption for `metadata` fields that could re-identify
--     users (e.g. region hints, matched tags).
-- [ ] Add indexes for production query patterns (see below).

-- ─── Parent table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages_partitioned (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  -- Squad that the message belongs to (partition-local FK — not a true FK
  -- in partitioned tables without Postgres 11+ declarative FK; add manually).
  squad_id        uuid        NOT NULL,
  -- Ephemeral pseudonym for the sender within this squad session.
  -- Not a foreign key here to preserve data after account deletion.
  sender_handle   text        NOT NULL,
  -- AES-256-GCM ciphertext (the encrypted message body).
  ciphertext      bytea       NOT NULL,
  -- 12-byte GCM initialization vector (must be unique per (key, plaintext) pair).
  iv              bytea       NOT NULL,
  -- 16-byte GCM authentication tag (appended to ciphertext by SubtleCrypto;
  -- stored separately here for clarity — adjust if your crypto layer bundles it).
  tag             bytea,
  -- Reference to the KMS-wrapped data key (null in MVP; not null post-KMS migration).
  -- Format: base64url-encoded wrapped key blob, or a UUID pointing to `encrypted_keys`.
  wrapped_key_ref text,
  -- Non-identifying routing metadata (squad_id copy for partition pruning,
  -- content warning flags, sequence number, etc.). NOT the message body.
  -- Example: {"content_warning": "conflict", "seq": 42}
  metadata        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  -- Partition key: used to route to the correct monthly partition.
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Row-level constraints
  CONSTRAINT messages_partitioned_iv_length CHECK (length(iv) = 12),
  CONSTRAINT messages_partitioned_tag_length CHECK (tag IS NULL OR length(tag) = 16)
)
PARTITION BY RANGE (created_at);

COMMENT ON TABLE messages_partitioned IS
  'Partitioned message store. Monthly partitions; retention enforced by dropping partitions. '
  'See DATA_RETENTION.md and scripts/retention_job.sql.';

COMMENT ON COLUMN messages_partitioned.ciphertext IS
  'AES-256-GCM encrypted message body. Never store plaintext here.';

COMMENT ON COLUMN messages_partitioned.wrapped_key_ref IS
  'SCAFFOLD: nullable in MVP (uses squad-level key). Set NOT NULL after KMS migration. '
  'See src/utils/encryption.ts for the target envelope encryption design.';

COMMENT ON COLUMN messages_partitioned.metadata IS
  'Non-encrypted routing metadata only. Do NOT store message content or PII here.';

-- ─── Monthly partitions (create 3 months around the current date) ─────────────
-- Adjust to match your actual retention window and deployment date.
-- In production, create partitions in advance via a cron job (see retention_job.sql).

-- Current month
CREATE TABLE IF NOT EXISTS messages_partitioned_2026_04
  PARTITION OF messages_partitioned
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- Next month
CREATE TABLE IF NOT EXISTS messages_partitioned_2026_05
  PARTITION OF messages_partitioned
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

-- Month after
CREATE TABLE IF NOT EXISTS messages_partitioned_2026_06
  PARTITION OF messages_partitioned
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- ─── Indexes ──────────────────────────────────────────────────────────────────
-- Create indexes on the parent table; Postgres automatically propagates them
-- to existing and future partitions (Postgres 11+).

-- Primary lookup: squad + time (most common query pattern for chat history).
CREATE INDEX IF NOT EXISTS idx_messages_partitioned_squad_created
  ON messages_partitioned (squad_id, created_at DESC);

-- Retention job index: partition pruning by date (the partition manager uses this
-- for partition detection; individual row queries use the squad index above).
CREATE INDEX IF NOT EXISTS idx_messages_partitioned_created
  ON messages_partitioned (created_at);

-- ─── Audit log for partition drops ───────────────────────────────────────────
-- SCAFFOLD: This table is referenced by scripts/retention_job.sql.
-- [ ] Add a trigger to alert when a partition drop occurs.
-- [ ] Wire to the operational metrics dashboard.

CREATE TABLE IF NOT EXISTS partition_drop_log (
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partition_name text        NOT NULL,
  table_name     text        NOT NULL,
  row_estimate   bigint,
  dropped_at     timestamptz NOT NULL DEFAULT now(),
  dropped_by     text        NOT NULL DEFAULT current_user,
  retention_days integer,
  notes          text
);

COMMENT ON TABLE partition_drop_log IS
  'Audit log for partition drops (retention enforcement). '
  'Retained for 1 year per DATA_RETENTION.md.';
