-- Immutable snapshot of the squad AES key row at moderator archive time (operator audit / contested recovery flows).

ALTER TABLE public.squads
    ADD COLUMN IF NOT EXISTS archived_encryption_key_snapshot TEXT;

COMMENT ON COLUMN public.squads.archived_encryption_key_snapshot IS
'Optional copy of message_encryption_key at first archive transition (set by moderator_archive_squad).';

CREATE OR REPLACE FUNCTION public.moderator_archive_squad (p_squad_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    n int;
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
    UPDATE
        public.squads
    SET
        archived_at = timezone('utc'::text, now()),
        status = 'archived'::text,
        archived_encryption_key_snapshot = CASE WHEN archived_encryption_key_snapshot IS NULL THEN
            message_encryption_key
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
        VALUES (uid, 'squad_archived', 'squad', p_squad_id, '{"key_snapshot_written":true}'::jsonb);
END;
$$;
