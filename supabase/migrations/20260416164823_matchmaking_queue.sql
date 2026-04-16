-- Ephemeral matchmaking queue: pair opposing perspectives (A/B) into squads of 4 (2+2).
-- Matcher runs inside SECURITY DEFINER RPCs; internal helper lives in schema "private".

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE TABLE public.match_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    pool_key TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('A', 'B')),
    status TEXT NOT NULL CHECK (status IN ('waiting', 'matched', 'cancelled')),
    squad_id UUID REFERENCES public.squads (id) ON DELETE SET NULL,
    enqueued_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    matched_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX match_queue_one_waiting_per_user_pool ON public.match_queue (user_id, pool_key)
WHERE
    status = 'waiting';

CREATE INDEX match_queue_pool_waiting_side_enqueued ON public.match_queue (pool_key, status, side, enqueued_at);

ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;

-- Clients read only their own rows (e.g. Realtime). Inserts/updates go through RPCs.
CREATE POLICY "Match_queue_select_own" ON public.match_queue FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Match_queue_update_own_waiting" ON public.match_queue FOR
UPDATE USING (user_id = auth.uid ()
    AND status = 'waiting')
WITH CHECK (user_id = auth.uid ()
    AND status = 'waiting');

ALTER PUBLICATION supabase_realtime
    ADD TABLE public.match_queue;

-- Forms 2+2 squads from the oldest waiting rows in a pool; repeats until insufficient depth.
CREATE OR REPLACE FUNCTION private.matchmaking_try_form_pool (p_pool_key text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    row_ids_a uuid[];

    row_ids_b uuid[];

    v_squad_id uuid;

BEGIN
    LOOP
        WITH locked_a AS (
            SELECT
                id
            FROM
                public.match_queue
            WHERE
                pool_key = p_pool_key
                AND status = 'waiting'
                AND side = 'A'
            ORDER BY
                enqueued_at ASC
            LIMIT 2
            FOR UPDATE SKIP LOCKED
        )
        SELECT
            ARRAY ( SELECT
                    id
                FROM
                    locked_a) INTO row_ids_a;

        WITH locked_b AS (
            SELECT
                id
            FROM
                public.match_queue
            WHERE
                pool_key = p_pool_key
                AND status = 'waiting'
                AND side = 'B'
            ORDER BY
                enqueued_at ASC
            LIMIT 2
            FOR UPDATE SKIP LOCKED
        )
        SELECT
            ARRAY ( SELECT
                    id
                FROM
                    locked_b) INTO row_ids_b;

        IF coalesce(array_length(row_ids_a, 1), 0) < 2
            OR coalesce(array_length(row_ids_b, 1), 0) < 2 THEN
            EXIT;
        END IF;

        v_squad_id := gen_random_uuid();

        INSERT INTO public.squads (id, topic, status, expires_at)
        VALUES (v_squad_id, 'Matched dialogue', 'active', timezone('utc'::text, now()) + interval '1 day');

        INSERT INTO public.squad_members (squad_id, user_id)
        SELECT
            v_squad_id,
            mq.user_id
        FROM
            public.match_queue mq
        WHERE
            mq.id = ANY (row_ids_a || row_ids_b);

        UPDATE
            public.match_queue
        SET
            status = 'matched',
            squad_id = v_squad_id,
            matched_at = timezone('utc'::text, now())
        WHERE
            id = ANY (row_ids_a || row_ids_b);

    END LOOP;

END;

$$;

REVOKE ALL ON FUNCTION private.matchmaking_try_form_pool (text) FROM PUBLIC;

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
    SET search_path = public
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
