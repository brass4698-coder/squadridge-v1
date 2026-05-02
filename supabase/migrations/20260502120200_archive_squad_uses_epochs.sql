-- Phase 3 (key rotation): teach moderator_archive_squad about epochs.
--
-- The archive flow originally introduced in 20260428123000 captured a copy of
-- squads.message_encryption_key at archive time, which made operational sense
-- when there was a single canonical key per squad. With the epoch table in
-- place (20260502120000) the *current* epoch's key is now the canonical
-- "live" recovery copy; older epochs may be retired or even purged by Track B.
--
-- This migration:
--   * keeps archived_encryption_key_snapshot wired to the current epoch's
--     encryption_key (looked up via squads.current_epoch_id), with the
--     existing column on squads as a fallback for any pre-epoch rows that
--     never got backfilled;
--   * preserves the audit row shape and the "first archive wins" rule —
--     we only write the snapshot on the transition out of NULL, so a
--     re-archive does not overwrite an earlier recovery key.
--
-- Behaviour after this migration:
--   archived_encryption_key_snapshot := coalesce(
--       (key from squad_key_epochs.id = squads.current_epoch_id),
--       squads.message_encryption_key
--   )

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
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'squad_archived', 'squad', p_squad_id, jsonb_build_object('key_snapshot_written', TRUE, 'epoch_number', epoch_number_for_audit));
END;
$$;

COMMENT ON FUNCTION public.moderator_archive_squad (uuid) IS
'Archives a squad and snapshots the current epoch''s encryption key into squads.archived_encryption_key_snapshot for moderator-recovery. First-archive-wins; subsequent calls do not overwrite the snapshot. Records {key_snapshot_written, epoch_number} in moderation_audit_log.';
