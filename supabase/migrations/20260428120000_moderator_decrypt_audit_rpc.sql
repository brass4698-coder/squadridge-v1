-- Audited intent before moderators decrypt message ciphertext clientside (squads.message_encryption_key is readable via Squads_select_moderator).

CREATE OR REPLACE FUNCTION public.moderator_record_decrypt_audit (p_message_id uuid, p_justification text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    v_squad_id uuid;
    j_trunc text;
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
        squad_id INTO v_squad_id
    FROM
        public.messages
    WHERE
        id = p_message_id;
    IF v_squad_id IS NULL THEN
        RAISE EXCEPTION 'message not found';
    END IF;
    j_trunc := substring(coalesce(trim(p_justification), ''), 1, 512);
    IF length(j_trunc) < 8 THEN
        RAISE EXCEPTION 'justification_required';
    END IF;
    INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
        VALUES (uid, 'message_plaintext_decrypt_review', 'message', p_message_id, jsonb_build_object('justification', j_trunc, 'squad_id', v_squad_id));
END;
$$;

REVOKE ALL ON FUNCTION public.moderator_record_decrypt_audit (uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.moderator_record_decrypt_audit (uuid, text) TO authenticated;
