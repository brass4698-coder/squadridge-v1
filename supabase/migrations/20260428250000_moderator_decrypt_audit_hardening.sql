-- Phase 2.2 (audit remediation): three hardenings around moderator decrypt-for-review.
--
-- 1. Rate-limit: a moderator may log at most 10 `message_plaintext_decrypt_review`
--    rows in any rolling 5-minute window. Above the cap, the audit RPC raises
--    `decrypt_audit_rate_limit`. This is the SQL-level equivalent of the Edge
--    rate-limit; the audit step happens *before* the moderator decrypts client-side,
--    so blocking it here prevents bulk extraction even if the Edge layer is bypassed.
--
-- 2. Immutable rows: any audit row whose `action` matches `message_plaintext_%` is
--    forbidden from UPDATE / DELETE — even by service_role. Operators who need to
--    purge a row for compliance must SET session_replication_role = 'replica' and
--    document the reason in the operations log.
--
-- 3. Author-visible review status: a SECURITY DEFINER RPC the message author can
--    call to learn whether their own message was decrypted by a moderator and at
--    what time, **without** exposing moderator identity or justification. Powers
--    the per-message "Reviewed by moderator" pill in `src/pages/SessionPage.tsx`.
--
-- Note: ALTER FUNCTION OR REPLACE here is intentional; we extend the function body
-- from migration `20260428120000_moderator_decrypt_audit_rpc.sql`.

-- 1. Rate-limited moderator_record_decrypt_audit.
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
    IF uid IS NULL OR NOT EXISTS (
        SELECT
            1
        FROM
            public.moderators m
        WHERE
            m.user_id = uid) THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    -- Phase 2.2: cap moderator decrypt-for-review volume per rolling 5 minutes.
    -- This applies *before* the moderator's client decrypts the squad ciphertext;
    -- exceeding the cap halts further audits (and downstream decryption) entirely.
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

REVOKE ALL ON FUNCTION public.moderator_record_decrypt_audit (uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderator_record_decrypt_audit (uuid, text) TO authenticated;

-- 2. Immutable trigger on plaintext-review rows.
CREATE OR REPLACE FUNCTION public.moderation_audit_log_block_review_mutations ()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.action LIKE 'message_plaintext_%' THEN
            RAISE EXCEPTION
                'moderation_audit_log: row with action % is immutable',
                OLD.action;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.action LIKE 'message_plaintext_%' THEN
            RAISE EXCEPTION
                'moderation_audit_log: row with action % is immutable',
                OLD.action;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS moderation_audit_log_block_review_mutations
    ON public.moderation_audit_log;

CREATE TRIGGER moderation_audit_log_block_review_mutations
    BEFORE UPDATE OR DELETE ON public.moderation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION public.moderation_audit_log_block_review_mutations ();

COMMENT ON TRIGGER moderation_audit_log_block_review_mutations ON public.moderation_audit_log IS
    'Plaintext-review rows are append-only — even service_role cannot UPDATE/DELETE without setting session_replication_role = replica.';

-- 3. Author-visible review status RPC.
CREATE OR REPLACE FUNCTION public.get_my_messages_review_status (p_message_ids uuid[])
    RETURNS TABLE (message_id uuid, reviewed_at timestamptz)
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        mal.target_id AS message_id,
        min(mal.created_at) AS reviewed_at
    FROM
        public.moderation_audit_log mal
        JOIN public.messages m ON m.id = mal.target_id
    WHERE
        mal.action = 'message_plaintext_decrypt_review'
        AND mal.target_type = 'message'
        AND mal.target_id = ANY (p_message_ids)
        AND m.sender_id = auth.uid ()
    GROUP BY
        mal.target_id;
$$;

COMMENT ON FUNCTION public.get_my_messages_review_status (uuid[]) IS
    'Returns {message_id, reviewed_at} ONLY for messages the caller authored. Reveals neither moderator identity nor justification — used by SessionPage to render a "reviewed by moderator" pill to the message author.';

REVOKE ALL ON FUNCTION public.get_my_messages_review_status (uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_messages_review_status (uuid[]) TO authenticated;
