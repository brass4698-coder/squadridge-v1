-- =============================================================================
-- Message table partitioning scaffold
-- =============================================================================
-- Migration: 20260429_message_partitioning.sql
-- Author: Security & Privacy Infrastructure PR
--
-- What this does:
--   Adds a partitioned shadow table (messages_partitioned) that stores
--   messages with full encryption metadata columns and monthly range
--   partitions for efficient retention-window deletion.
--
-- What this does NOT do yet:
--   It does not replace the existing messages table in production.
--   Migrating live data from messages → messages_partitioned requires
--   a separate, carefully coordinated data migration (see "Next steps").
--
-- Why partition?
--   Dropping a partition (DROP TABLE messages_y2026m04) is atomic and
--   near-instant, versus DELETE FROM messages WHERE sent_at < ... which
--   locks rows, grows the WAL, and is slow on large tables.
--   With monthly partitions we can enforce the 90-day retention window by
--   dropping the three-months-ago partition once a month.
--
-- Encryption columns:
--   payload_ciphertext  - AES-GCM ciphertext (from ingest-message Edge)
--   iv                  - 12-byte GCM nonce, base64url
--   auth_tag_included   - true (GCM tag is appended to ciphertext)
--   wrapped_key_ref     - reference to the KMS-wrapped DEK for this squad
--                         (scaffold: populated once KMS integration is wired)
--   metadata            - non-identifying routing metadata (e.g. message type,
--                         content-class label from redaction engine)
--
-- NOTE: wrapped_key_ref is NULL until KMS integration is deployed. Existing
-- messages use the squad key stored in squads.message_encryption_key.
-- See src/utils/encryption.ts for the KMS wrapping pattern.
-- =============================================================================

-- Create the partitioned table
CREATE TABLE IF NOT EXISTS public.messages_partitioned (
    id               uuid         NOT NULL DEFAULT gen_random_uuid(),
    squad_id         uuid         NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
    sender_handle    text         NOT NULL,   -- ephemeral pseudonym only; no FK to users
    payload_ciphertext text       NOT NULL,   -- AES-GCM v3 JSON blob
    iv               text,                    -- 12-byte nonce, base64url (v3 payloads embed this)
    wrapped_key_ref  text,                    -- KMS-wrapped DEK reference (null until KMS wired)
    metadata         jsonb        NOT NULL DEFAULT '{}'::jsonb,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    squad_archived   boolean      NOT NULL DEFAULT false
)
PARTITION BY RANGE (created_at);

-- Indexes (created on the parent; inherited by child partitions)
CREATE INDEX IF NOT EXISTS messages_partitioned_squad_created
    ON public.messages_partitioned (squad_id, created_at DESC);

CREATE INDEX IF NOT EXISTS messages_partitioned_created
    ON public.messages_partitioned (created_at DESC);

-- RLS: same as messages — only squad members or service role can read
ALTER TABLE public.messages_partitioned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MessagesPartitioned_select_squad_member"
    ON public.messages_partitioned
    FOR SELECT TO authenticated
    USING (
        squad_id IN (
            SELECT squad_id FROM public.squad_members
            WHERE user_id = auth.uid()
        )
    );

-- Direct client inserts blocked — same policy as messages (ingest-message Edge only)
CREATE POLICY "MessagesPartitioned_insert_blocked"
    ON public.messages_partitioned
    FOR INSERT TO authenticated
    WITH CHECK (FALSE);

COMMENT ON TABLE public.messages_partitioned IS
'Partitioned messages table for retention-window deletion via partition drop.
Each month gets its own child partition (see scripts/retention_job.sql).
Not yet used in production; data migration from messages is a separate step.';

COMMENT ON COLUMN public.messages_partitioned.sender_handle IS
'Ephemeral pseudonym used in-session. No FK to auth.users — sender identity
is not stored here (see squad_members for membership).';

COMMENT ON COLUMN public.messages_partitioned.wrapped_key_ref IS
'KMS-wrapped Data Encryption Key reference. NULL until KMS integration is deployed.
Until then, encryption uses the squad key in squads.message_encryption_key.
See src/utils/encryption.ts for the wrapping pattern.';

-- ---------------------------------------------------------------------------
-- Create the initial partition covering the current quarter.
-- In production you would create partitions ahead of time (e.g. in a cron job).
-- The retention job (scripts/retention_job.sql) drops partitions older than 90 days.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages_y2026m04
    PARTITION OF public.messages_partitioned
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS public.messages_y2026m05
    PARTITION OF public.messages_partitioned
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS public.messages_y2026m06
    PARTITION OF public.messages_partitioned
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS public.messages_y2026m07
    PARTITION OF public.messages_partitioned
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- =============================================================================
-- Next steps (track as GitHub issues)
-- =============================================================================
-- 1. Wire KMS: set wrapped_key_ref on new inserts once src/utils/encryption.ts
--    is connected to a real KMS provider.
-- 2. Data migration: copy existing messages rows into messages_partitioned
--    and switch ingest-message Edge to write to the new table.
-- 3. Deploy retention_job.sql as a pg_cron job that drops partitions older
--    than the retention window (90 days for archived squads).
-- 4. Create future partitions automatically: add a pg_cron job or a pre-create
--    trigger so partitions exist before messages arrive.
-- =============================================================================
