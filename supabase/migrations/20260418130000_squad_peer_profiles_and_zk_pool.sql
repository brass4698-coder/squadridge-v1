-- Slim in-squad profile visibility (pseudonymous) + optional ZK scope binding in pool_key.

-- When pool_key contains "|zk:<scope>", the caller must have a matching verified_attributes.attribute_value row.
CREATE OR REPLACE FUNCTION private.matchmaking_assert_pool_key_zk (p_uid uuid, p_key text)
    RETURNS void
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    zk_pos int;

    zk_scope text;

BEGIN
    zk_pos := strpos(p_key, '|zk:');

    IF zk_pos = 0 THEN
        RETURN;

    END IF;

    zk_scope := trim(substring(p_key FROM zk_pos + 4));

    IF zk_scope = '' THEN
        RAISE EXCEPTION 'Invalid pool key: empty zk scope';

    END IF;

    IF NOT EXISTS (
        SELECT
            1
        FROM
            public.verified_attributes va
        WHERE
            va.user_id = p_uid
            AND va.attribute_value = zk_scope) THEN
    RAISE EXCEPTION 'Pool key requires a matching verified attribute';

END IF;

END;

$$;

REVOKE ALL ON FUNCTION private.matchmaking_assert_pool_key_zk (uuid, text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_squad_peer_profiles (p_squad_id uuid)
    RETURNS TABLE (
        user_id uuid,
        callsign text,
        role_archetype text,
        role_other_detail varchar(100),
        tags text[],
        region_hint text)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT
        p.id,
        p.callsign,
        p.role_archetype,
        p.role_other_detail,
        p.tags,
        p.region_hint
    FROM
        public.profiles p
        INNER JOIN public.squad_members sm ON sm.user_id = p.id
            AND sm.squad_id = p_squad_id
    WHERE
        EXISTS (
            SELECT
                1
            FROM
                public.squad_members me
            WHERE
                me.squad_id = p_squad_id
                AND me.user_id = auth.uid ());

$$;

REVOKE ALL ON FUNCTION public.get_squad_peer_profiles (uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_squad_peer_profiles (uuid) TO anon;

GRANT EXECUTE ON FUNCTION public.get_squad_peer_profiles (uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.matchmaking_enqueue_and_try (p_pool_key text, p_side text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid uuid := auth.uid ();

    v_key text;

    v_waiting_a int;

    v_waiting_b int;

    v_pos int;

    v_squad_id uuid;

    v_my_side text := p_side;

BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';

    END IF;

    IF p_side NOT IN ('A', 'B') THEN
        RAISE EXCEPTION 'Invalid side';

    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';

    END IF;

    PERFORM
        private.matchmaking_assert_pool_key_zk (v_uid, v_key);

    IF EXISTS (
        SELECT
            1
        FROM
            public.match_queue
        WHERE
            user_id = v_uid
            AND pool_key = v_key
            AND status = 'waiting') THEN
    UPDATE
        public.match_queue
    SET
        side = p_side
    WHERE
        user_id = v_uid
        AND pool_key = v_key
        AND status = 'waiting';

ELSE
    INSERT INTO public.match_queue (user_id, pool_key, side, status)
    VALUES (v_uid, v_key, p_side, 'waiting');

END IF;

    PERFORM
        private.matchmaking_try_form_pool (v_key);

    SELECT
        squad_id INTO v_squad_id
    FROM
        public.match_queue
    WHERE
        user_id = v_uid
        AND pool_key = v_key
        AND status = 'matched'
    ORDER BY
        matched_at DESC NULLS LAST
    LIMIT 1;

    SELECT
        COUNT(*)::int INTO v_waiting_a
    FROM
        public.match_queue
    WHERE
        pool_key = v_key
        AND status = 'waiting'
        AND side = 'A';

    SELECT
        COUNT(*)::int INTO v_waiting_b
    FROM
        public.match_queue
    WHERE
        pool_key = v_key
        AND status = 'waiting'
        AND side = 'B';

    IF v_squad_id IS NOT NULL THEN
        RETURN jsonb_build_object('outcome', 'matched', 'squad_id', v_squad_id, 'pool_key', v_key, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', NULL);

    END IF;

    SELECT
        1 + COUNT(*)::int INTO v_pos
    FROM
        public.match_queue mq
    WHERE
        mq.pool_key = v_key
        AND mq.status = 'waiting'
        AND mq.side = v_my_side
        AND mq.enqueued_at < (
            SELECT
                enqueued_at
            FROM
                public.match_queue
            WHERE
                user_id = v_uid
                AND pool_key = v_key
                AND status = 'waiting');

    RETURN jsonb_build_object('outcome', 'queued', 'squad_id', NULL, 'pool_key', v_key, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', coalesce(v_pos, 1));

END;

$$;

CREATE OR REPLACE FUNCTION public.matchmaking_pool_snapshot (p_pool_key text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid uuid := auth.uid ();

    v_key text;

    v_waiting_a int;

    v_waiting_b int;

    v_pos int;

    v_side text;

    v_squad_id uuid;

BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';

    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';

    END IF;

    PERFORM
        private.matchmaking_assert_pool_key_zk (v_uid, v_key);

    PERFORM
        private.matchmaking_try_form_pool (v_key);

    SELECT
        squad_id INTO v_squad_id
    FROM
        public.match_queue
    WHERE
        user_id = v_uid
        AND pool_key = v_key
        AND status = 'matched'
    ORDER BY
        matched_at DESC NULLS LAST
    LIMIT 1;

    IF v_squad_id IS NOT NULL THEN
        RETURN jsonb_build_object('outcome', 'matched', 'squad_id', v_squad_id, 'pool_key', v_key);

    END IF;

    IF NOT EXISTS (
        SELECT
            1
        FROM
            public.match_queue
        WHERE
            user_id = v_uid
            AND pool_key = v_key
            AND status = 'waiting') THEN
    RETURN jsonb_build_object('outcome', 'idle', 'pool_key', v_key);

END IF;

    SELECT
        side INTO v_side
    FROM
        public.match_queue
    WHERE
        user_id = v_uid
        AND pool_key = v_key
        AND status = 'waiting'
    LIMIT 1;

    SELECT
        COUNT(*)::int INTO v_waiting_a
    FROM
        public.match_queue
    WHERE
        pool_key = v_key
        AND status = 'waiting'
        AND side = 'A';

    SELECT
        COUNT(*)::int INTO v_waiting_b
    FROM
        public.match_queue
    WHERE
        pool_key = v_key
        AND status = 'waiting'
        AND side = 'B';

    SELECT
        1 + COUNT(*)::int INTO v_pos
    FROM
        public.match_queue mq
    WHERE
        mq.pool_key = v_key
        AND mq.status = 'waiting'
        AND mq.side = v_side
        AND mq.enqueued_at < (
            SELECT
                enqueued_at
            FROM
                public.match_queue
            WHERE
                user_id = v_uid
                AND pool_key = v_key
                AND status = 'waiting');

    RETURN jsonb_build_object('outcome', 'queued', 'pool_key', v_key, 'side', v_side, 'waiting_a', v_waiting_a, 'waiting_b', v_waiting_b, 'queue_position', coalesce(v_pos, 1));

END;

$$;

CREATE OR REPLACE FUNCTION public.matchmaking_cancel_waiting (p_pool_key text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    v_uid uuid := auth.uid ();

    v_key text;

BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';

    END IF;

    v_key := left(trim(p_pool_key), 128);

    IF v_key = '' THEN
        v_key := 'default';

    END IF;

    PERFORM
        private.matchmaking_assert_pool_key_zk (v_uid, v_key);

    UPDATE
        public.match_queue
    SET
        status = 'cancelled'
    WHERE
        user_id = v_uid
        AND pool_key = v_key
        AND status = 'waiting';

END;

$$;

REVOKE ALL ON FUNCTION public.matchmaking_enqueue_and_try (text, text) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.matchmaking_pool_snapshot (text) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.matchmaking_cancel_waiting (text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (text, text) TO anon;

GRANT EXECUTE ON FUNCTION public.matchmaking_enqueue_and_try (text, text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.matchmaking_pool_snapshot (text) TO anon;

GRANT EXECUTE ON FUNCTION public.matchmaking_pool_snapshot (text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.matchmaking_cancel_waiting (text) TO anon;

GRANT EXECUTE ON FUNCTION public.matchmaking_cancel_waiting (text) TO authenticated;
