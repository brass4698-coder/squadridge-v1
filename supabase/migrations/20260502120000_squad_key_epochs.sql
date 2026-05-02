-- Phase 3 (key rotation): per-squad message-encryption-key epochs.
--
-- Background: prior to this migration each squad held a single AES-256-GCM key
-- in `squads.message_encryption_key`. The threat model called this out as
-- "no key rotation in the product today" and a follow-up to the
-- archive_squad_encryption_snapshot migration. This change introduces a
-- canonical epoch table, backfills epoch 1 from existing squads, and tags
-- every existing message with the matching epoch.
--
-- Trust posture is unchanged: keys are still server-readable (operator-readable
-- in the threat-model §5 sense). What rotation buys is the ability to retire a
-- compromised or stale key without losing decrypt-for-review and to scope the
-- attack window to a bounded subset of historical messages.
--
-- Companion migrations:
--   * 20260502120100_rotate_squad_key_rpc.sql     — moderator + service-role
--                                                   rotation entry point.
--   * 20260502120200_archive_squad_uses_epochs.sql — moderator_archive_squad
--                                                   snapshots the *current*
--                                                   epoch's key.
--
-- Track B (`20260503*`) layers a retired-key purge cron on top. This migration
-- intentionally leaves `squads.message_encryption_key` populated so the
-- existing fast-path clients (worker, mod-decrypt) continue to read live
-- ciphertext without a forced upgrade — the column becomes a denormalised
-- mirror of the current epoch.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.squad_key_epochs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    squad_id uuid NOT NULL REFERENCES public.squads (id) ON DELETE CASCADE,
    epoch_number integer NOT NULL,
    encryption_key text,
    encryption_key_purged_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    retired_at timestamptz,
    retired_reason text,
    CONSTRAINT squad_key_epochs_unique_epoch UNIQUE (squad_id, epoch_number),
    CONSTRAINT squad_key_epochs_purged_implies_no_key CHECK (
        encryption_key_purged_at IS NULL OR encryption_key IS NULL
    )
);

COMMENT ON TABLE public.squad_key_epochs IS
'Per-squad AES-256-GCM key epochs. New rows added by public.rotate_squad_key. Track B may null encryption_key for retired epochs (purge); the moderator-recovery copy lives in squads.archived_encryption_key_snapshot when the squad is archived.';

COMMENT ON COLUMN public.squad_key_epochs.encryption_key IS
'Base64(url) 32-byte AES-256-GCM material. NULL after retired-epoch purge (Track B); historical messages remain decryptable via squads.archived_encryption_key_snapshot only when the squad is archived.';

COMMENT ON COLUMN public.squad_key_epochs.encryption_key_purged_at IS
'Set by the retired-epoch purge cron when the encryption_key column has been zeroed for forward-secrecy reasons. Audit metadata only — the row itself is preserved so messages.key_epoch_id remains a valid reference.';

CREATE INDEX squad_key_epochs_squad_id_idx
    ON public.squad_key_epochs (squad_id, epoch_number DESC);

CREATE INDEX squad_key_epochs_retired_idx
    ON public.squad_key_epochs (retired_at)
    WHERE retired_at IS NOT NULL AND encryption_key_purged_at IS NULL;

ALTER TABLE public.squads
    ADD COLUMN IF NOT EXISTS current_epoch_id uuid
        REFERENCES public.squad_key_epochs (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.squads.current_epoch_id IS
'Pointer to the live squad_key_epochs row used for new message INSERTs. message_encryption_key remains as a denormalised fast-path mirror of the same key; rotation updates both atomically.';

ALTER TABLE public.messages
    ADD COLUMN IF NOT EXISTS key_epoch_id uuid
        REFERENCES public.squad_key_epochs (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.messages.key_epoch_id IS
'Stamps which squad_key_epochs row this message was encrypted under. NULL for legacy rows that pre-date this column; consumers should treat NULL as "current epoch on the squad row".';

-- Backfill: one epoch row per squad with a non-empty key.
INSERT INTO public.squad_key_epochs (squad_id, epoch_number, encryption_key, created_at)
SELECT
    s.id,
    1,
    s.message_encryption_key,
    s.created_at
FROM
    public.squads s
WHERE
    s.message_encryption_key IS NOT NULL
    AND btrim(s.message_encryption_key) <> ''
ON CONFLICT (squad_id, epoch_number) DO NOTHING;

UPDATE
    public.squads s
SET
    current_epoch_id = ke.id
FROM
    public.squad_key_epochs ke
WHERE
    ke.squad_id = s.id
    AND ke.epoch_number = 1
    AND s.current_epoch_id IS NULL;

UPDATE
    public.messages m
SET
    key_epoch_id = s.current_epoch_id
FROM
    public.squads s
WHERE
    m.squad_id = s.id
    AND m.key_epoch_id IS NULL
    AND s.current_epoch_id IS NOT NULL;

CREATE INDEX messages_key_epoch_id_idx
    ON public.messages (key_epoch_id)
    WHERE key_epoch_id IS NOT NULL;

ALTER TABLE public.squad_key_epochs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.squad_key_epochs FROM PUBLIC;

-- Members: read epoch metadata + key for their own squad. Use the existing
-- security-definer helper to avoid recursion against squad_members RLS.
CREATE POLICY "Squad_key_epochs_select_member" ON public.squad_key_epochs
    FOR SELECT TO authenticated
    USING (public.auth_user_is_squad_member (squad_id));

CREATE POLICY "Squad_key_epochs_select_moderator" ON public.squad_key_epochs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.moderators m
            WHERE m.user_id = auth.uid ()
        )
    );

-- No INSERT / UPDATE / DELETE policies for `authenticated`. Writes are gated to
-- service_role and SECURITY DEFINER RPCs (rotate_squad_key, the archive flow,
-- and the Track B purge cron).
GRANT SELECT ON public.squad_key_epochs TO authenticated;

GRANT ALL ON public.squad_key_epochs TO service_role;

COMMENT ON COLUMN public.squads.message_encryption_key IS
'Live mirror of squads.current_epoch_id''s encryption_key. Maintained by the BEFORE INSERT trigger on new squads and by public.rotate_squad_key on rotation. Operators reading old code should source the canonical key from squad_key_epochs; a future migration may drop this column once all clients use key_epoch_id directly.';
