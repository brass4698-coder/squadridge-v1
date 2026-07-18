-- Moderation layer hardening:
--   * auth_user_is_moderator() helper (roster table — not profiles.role)
--   * RLS on moderation_audit_log uses the helper
--   * Unified moderator_flag_and_archive(target_type, target_id, reason)
--   * REVOKE EXECUTE from anon; GRANT authenticated + service_role on moderator RPCs
--
-- Schema note (vs early design docs):
--   Table is public.moderation_audit_log with actor_user_id + action + metadata
--   (reason lives in metadata->>'reason'). There is no profiles.role = 'moderator';
--   moderators are rows in public.moderators.

CREATE OR REPLACE FUNCTION public.auth_user_is_moderator ()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        EXISTS (
            SELECT
                1
            FROM
                public.moderators m
            WHERE
                m.user_id = auth.uid ());
$$;

REVOKE ALL ON FUNCTION public.auth_user_is_moderator () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_user_is_moderator () TO authenticated;

GRANT EXECUTE ON FUNCTION public.auth_user_is_moderator () TO service_role;

COMMENT ON FUNCTION public.auth_user_is_moderator () IS
    'True when auth.uid() is listed in public.moderators. Used by moderation RLS and RPCs.';

-- SELECT: moderators only (via helper). INSERT policy keeps actor = session + moderator check.
DROP POLICY IF EXISTS "Moderators_select_audit" ON public.moderation_audit_log;

CREATE POLICY "Moderators_select_audit" ON public.moderation_audit_log
    FOR SELECT TO authenticated
        USING (public.auth_user_is_moderator ());

DROP POLICY IF EXISTS "Moderators_insert_audit" ON public.moderation_audit_log;

CREATE POLICY "Moderators_insert_audit" ON public.moderation_audit_log
    FOR INSERT TO authenticated
        WITH CHECK (
            public.auth_user_is_moderator ()
            AND actor_user_id = auth.uid ());

-- Unified client-facing RPC: flag message or archive squad + audit row.
CREATE OR REPLACE FUNCTION public.moderator_flag_and_archive (
    p_target_type text,
    p_target_id uuid,
    p_reason text
)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    uid uuid := auth.uid ();
    n int;
    reason_trunc text := substring(coalesce(trim(p_reason), ''), 1, 512);
    t text := lower(trim(coalesce(p_target_type, '')));
BEGIN
    IF uid IS NULL OR NOT public.auth_user_is_moderator () THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    IF t = 'message' THEN
        UPDATE
            public.messages
        SET
            status = 'flagged'
        WHERE
            id = p_target_id
            AND status = 'sent';
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n = 0 THEN
            RAISE EXCEPTION 'message not found or not flaggable';
        END IF;
        INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
            VALUES (uid, 'message_flagged', 'message', p_target_id, jsonb_build_object('reason', reason_trunc));
    ELSIF t = 'squad' THEN
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
            id = p_target_id
            AND archived_at IS NULL;
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n = 0 THEN
            RAISE EXCEPTION 'squad not found or already archived';
        END IF;
        INSERT INTO public.moderation_audit_log (actor_user_id, action, target_type, target_id, metadata)
            VALUES (uid, 'squad_archived', 'squad', p_target_id, jsonb_build_object('reason', reason_trunc, 'key_snapshot_written', true));
    ELSE
        RAISE EXCEPTION 'invalid target_type';
    END IF;
END;
$$;

COMMENT ON FUNCTION public.moderator_flag_and_archive (text, uuid, text) IS
    'Moderator: flag a message (status=flagged) or archive a squad (archived_at/status), then append moderation_audit_log. Reason stored in metadata.';

-- Align existing RPCs to use the helper (same authorization semantics).
CREATE OR REPLACE FUNCTION public.moderator_flag_message (p_message_id uuid, p_reason text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    PERFORM
        public.moderator_flag_and_archive ('message', p_message_id, p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.moderator_archive_squad (p_squad_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    PERFORM
        public.moderator_flag_and_archive ('squad', p_squad_id, '');
END;
$$;

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
    recent_count int;
BEGIN
    IF uid IS NULL OR NOT public.auth_user_is_moderator () THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    SELECT
        count(*)::int INTO recent_count
    FROM
        public.moderation_audit_log mal
    WHERE
        mal.actor_user_id = uid
        AND mal.action = 'message_plaintext_decrypt_review'
        AND mal.created_at >= timezone('utc'::text, now()) - interval '5 minutes';
    IF recent_count >= 10 THEN
        RAISE EXCEPTION 'decrypt_audit_rate_limit';
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

-- Privileges: anon must not call these; authenticated (moderator check inside) + service_role.
DO $$
DECLARE
    fn text;
BEGIN
    FOREACH fn IN ARRAY ARRAY[
        'auth_user_is_moderator()',
        'moderator_flag_and_archive(text, uuid, text)',
        'moderator_flag_message(uuid, text)',
        'moderator_archive_squad(uuid)',
        'moderator_record_decrypt_audit(uuid, text)'
    ]
    LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC', fn);
        EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM anon', fn);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
    END LOOP;
END;
$$;
