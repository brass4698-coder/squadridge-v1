-- Moderator-only archive + message flag via SECURITY DEFINER (narrow surface; no broad UPDATE RLS on squads/messages).

CREATE OR REPLACE FUNCTION public.moderator_flag_message (p_message_id uuid, p_reason text)
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
        public.messages
    SET
        status = 'flagged'
    WHERE
        id = p_message_id
        AND status = 'sent';
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN
        RAISE EXCEPTION 'message not found or not flaggable';
    END IF;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'message_flagged', 'message', p_message_id, jsonb_build_object('reason', coalesce(p_reason, '')));
END;
$$;

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
        status = 'archived'
    WHERE
        id = p_squad_id
        AND archived_at IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN
        RAISE EXCEPTION 'squad not found or already archived';
    END IF;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'squad_archived', 'squad', p_squad_id, '{}'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.moderator_flag_message (uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.moderator_flag_message (uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.moderator_archive_squad (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.moderator_archive_squad (uuid) TO authenticated;

COMMENT ON FUNCTION public.moderator_flag_message (uuid, text) IS 'Moderator: set message status to flagged and append audit row.';

COMMENT ON FUNCTION public.moderator_archive_squad (uuid) IS 'Moderator: archive squad (same effect as member archive).';
