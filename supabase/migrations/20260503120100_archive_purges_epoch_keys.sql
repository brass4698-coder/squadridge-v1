-- Track B (interim forward secrecy): archive flow now purges per-epoch keys
-- as soon as the snapshot is taken.
--
-- The archive RPC introduced in 20260428123000 (and updated in
-- 20260502120200 to use squads.current_epoch_id) writes a recovery copy of
-- the current epoch's key into squads.archived_encryption_key_snapshot. With
-- that copy in place, retaining duplicate copies in squad_key_epochs is
-- unnecessary attack surface for an archived squad.
--
-- After this migration, a freshly archived squad has:
--   * archived_encryption_key_snapshot — single moderator-recovery key copy
--   * squad_key_epochs rows preserved (history) but encryption_key NULL and
--     encryption_key_purged_at set
--
-- The daily purge cron (20260503120000) handles squads archived before this
-- migration shipped on its next run; this migration also performs an
-- immediate one-shot pass for already-archived squads with a snapshot.

CREATE OR REPLACE FUNCTION public.moderator_archive_squad (p_squad_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    n int;
    snapshot_key text;
    epoch_number_for_audit int;
    purged_count int;
BEGIN
    IF uid IS NULL OR NOT EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = uid) THEN
        RAISE EXCEPTION 'not authorized';
    END IF;
    SELECT
        coalesce(ke.encryption_key, s.message_encryption_key),
        ke.epoch_number INTO snapshot_key,
        epoch_number_for_audit
    FROM
        public.squads s
        LEFT JOIN public.squad_key_epochs ke ON ke.id = s.current_epoch_id
    WHERE
        s.id = p_squad_id;
    UPDATE
        public.squads
    SET
        archived_at = timezone('utc'::text, now()),
        status = 'archived'::text,
        archived_encryption_key_snapshot = CASE WHEN archived_encryption_key_snapshot IS NULL THEN
            snapshot_key
        ELSE
            archived_encryption_key_snapshot
        END
    WHERE
        id = p_squad_id
        AND archived_at IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN
        RAISE EXCEPTION 'squad not found or already archived';
    END IF;
    -- Track B: with the snapshot now in place, drop per-epoch encryption_key
    -- material for this squad. Recovery flows go through the snapshot column.
    WITH purgable AS (
        SELECT
            ke.id
        FROM
            public.squad_key_epochs ke
        WHERE
            ke.squad_id = p_squad_id
            AND ke.encryption_key IS NOT NULL
            AND ke.encryption_key_purged_at IS NULL
    )
    UPDATE
        public.squad_key_epochs ke
    SET
        encryption_key = NULL,
        encryption_key_purged_at = timezone('utc'::text, now())
    FROM
        purgable
    WHERE
        ke.id = purgable.id;
    GET DIAGNOSTICS purged_count = ROW_COUNT;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'squad_archived', 'squad', p_squad_id, jsonb_build_object('key_snapshot_written', TRUE, 'epoch_number', epoch_number_for_audit, 'purged_epoch_keys', purged_count));
END;
$$;

COMMENT ON FUNCTION public.moderator_archive_squad (uuid) IS
'Archives a squad: snapshots the current epoch''s key into squads.archived_encryption_key_snapshot, then purges encryption_key on every squad_key_epochs row for the squad (Track B: snapshot is now the single moderator-recovery surface). First-archive-wins for the snapshot column. Records {key_snapshot_written, epoch_number, purged_epoch_keys} in moderation_audit_log.';

-- One-shot: purge archived squads that already have a snapshot.
SELECT
    public.purge_retired_squad_key_material (0);
