-- Periodic sweep: re-run matchmaking_try_form_pool for every pool_key with waiting rows.
-- Complements synchronous matching on enqueue/snapshot (edge case: no new RPC for a while).
-- Invoked by pg_cron when available; not granted to anon/authenticated.

CREATE OR REPLACE FUNCTION public.matchmaking_sweep_active_pools ()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, private
    AS $$
DECLARE
    k text;
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
        END LOOP;
END;

$$;

REVOKE ALL ON FUNCTION public.matchmaking_sweep_active_pools () FROM PUBLIC;

-- Service role may invoke manually from SQL / ops; not exposed to PostgREST clients without a grant.
GRANT EXECUTE ON FUNCTION public.matchmaking_sweep_active_pools () TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE
    jid bigint;
BEGIN
    IF EXISTS (
        SELECT
            1
        FROM
            pg_extension
        WHERE
            extname = 'pg_cron') THEN
    SELECT
        jobid INTO jid
    FROM
        cron.job
    WHERE
        jobname = 'matchmaking-sweep-active-pools';
    IF jid IS NOT NULL THEN
        PERFORM
            cron.unschedule (jid);
    END IF;
    PERFORM
        cron.schedule (
            'matchmaking-sweep-active-pools',
            '*/3 * * * *',
            $cmd$
            SELECT
                public.matchmaking_sweep_active_pools ();

$cmd$);
END IF;
END;
$$;
