-- Sweep run history + queue stats for ops (service_role / SQL Editor only).

CREATE TABLE IF NOT EXISTS public.matchmaking_sweep_runs (
    id bigserial PRIMARY KEY,
    ran_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    pool_keys_swept int NOT NULL DEFAULT 0
);

ALTER TABLE public.matchmaking_sweep_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.matchmaking_sweep_runs FROM PUBLIC;

GRANT SELECT,
INSERT ON public.matchmaking_sweep_runs TO service_role;

COMMENT ON TABLE public.matchmaking_sweep_runs IS 'One row per matchmaking_sweep_active_pools() run; for ops metrics.';

CREATE OR REPLACE FUNCTION public.matchmaking_sweep_active_pools ()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    k text;

    n int := 0;
BEGIN
    FOR k IN
    SELECT DISTINCT
        mq.pool_key
    FROM
        public.match_queue mq
    WHERE
        mq.status = 'waiting'
        LOOP
            PERFORM
                private.matchmaking_try_form_pool (k);
            n := n + 1;
        END LOOP;
    INSERT INTO public.matchmaking_sweep_runs (pool_keys_swept)
        VALUES (n);
END;

$$;

REVOKE ALL ON FUNCTION public.matchmaking_sweep_active_pools () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.matchmaking_sweep_active_pools () TO service_role;

CREATE OR REPLACE FUNCTION public.matchmaking_queue_stats ()
    RETURNS jsonb
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    total int;

    pools jsonb;
BEGIN
    SELECT
        count(*)::int INTO total
    FROM
        public.match_queue
    WHERE
        status = 'waiting';
    SELECT
        coalesce((
            SELECT
                jsonb_agg(jsonb_build_object('pool_key', pool_key, 'waiting_a', waiting_a, 'waiting_b', waiting_b))
            FROM (
                SELECT
                    pool_key,
                    count(*) FILTER (WHERE side = 'A')::int AS waiting_a,
                    count(*) FILTER (WHERE side = 'B')::int AS waiting_b
                FROM
                    public.match_queue
                WHERE
                    status = 'waiting'
                GROUP BY
                    pool_key) s), '[]'::jsonb) INTO pools;
    RETURN jsonb_build_object('total_waiting', coalesce(total, 0), 'by_pool', coalesce(pools, '[]'::jsonb));
END;

$$;

REVOKE ALL ON FUNCTION public.matchmaking_queue_stats () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.matchmaking_queue_stats () TO service_role;
