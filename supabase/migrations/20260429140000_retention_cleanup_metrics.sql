-- Retention cleanup metrics + monitoring view.
--
-- The TTL cleanup installed in 20260418090000_ttl_cleanup.sql runs hourly via
-- pg_cron, but produced no record of when it ran or how many rows it removed.
-- That left operators relying on side effects ("messages disappeared") to
-- confirm retention is enforced, and made the Phase 1 production checklist
-- ("retention job ran in the last hour") impossible to evidence without
-- platform-level cron logs.
--
-- This migration:
--   1. Adds public.retention_cleanup_runs to capture one row per cleanup pass
--      with row counts per table and a duration_ms.
--   2. Adds public.run_expired_data_cleanup() (SECURITY DEFINER) that performs
--      the same deletes as the prior inline cron body, captures GET DIAGNOSTICS
--      row counts, and inserts a metrics row.
--   3. Re-schedules the existing 'cleanup-expired-data' cron job to call the
--      new function so behavior is unchanged but observable.
--   4. Adds public.pilot_retention_cleanup_24h as the dashboard surface.
--
-- See DATA_RETENTION.md for the policy this enforces and
-- docs/operations/pilot-runbook.md (Observability) for alert thresholds.

CREATE TABLE IF NOT EXISTS public.retention_cleanup_runs (
    id bigserial PRIMARY KEY,
    ran_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    messages_deleted int NOT NULL DEFAULT 0,
    match_queue_deleted int NOT NULL DEFAULT 0,
    squads_deleted int NOT NULL DEFAULT 0,
    duration_ms int NOT NULL DEFAULT 0
);

ALTER TABLE public.retention_cleanup_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.retention_cleanup_runs FROM PUBLIC;

GRANT SELECT,
INSERT ON public.retention_cleanup_runs TO service_role;

GRANT USAGE,
SELECT
    ON SEQUENCE public.retention_cleanup_runs_id_seq TO service_role;

COMMENT ON TABLE public.retention_cleanup_runs IS
    'One row per public.run_expired_data_cleanup() pass. Drives the retention dashboard and the Phase 1 production checklist evidence requirement.';

CREATE INDEX IF NOT EXISTS idx_retention_cleanup_runs_ran_at
    ON public.retention_cleanup_runs (ran_at DESC);

CREATE OR REPLACE FUNCTION public.run_expired_data_cleanup ()
    RETURNS public.retention_cleanup_runs
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    started_at timestamptz := clock_timestamp();
    msgs int := 0;
    queue_rows int := 0;
    squad_rows int := 0;
    run_row public.retention_cleanup_runs;
BEGIN
    DELETE FROM public.messages
    WHERE expires_at IS NOT NULL
        AND expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS msgs = ROW_COUNT;

    DELETE FROM public.match_queue
    WHERE expires_at IS NOT NULL
        AND expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS queue_rows = ROW_COUNT;

    DELETE FROM public.squads
    WHERE expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS squad_rows = ROW_COUNT;

    INSERT INTO public.retention_cleanup_runs
        (messages_deleted, match_queue_deleted, squads_deleted, duration_ms)
    VALUES (
        msgs,
        queue_rows,
        squad_rows,
        GREATEST(
            0,
            (EXTRACT(epoch FROM (clock_timestamp() - started_at)) * 1000)::int
        )
    )
    RETURNING * INTO run_row;

    RETURN run_row;
END;
$$;

REVOKE ALL ON FUNCTION public.run_expired_data_cleanup () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.run_expired_data_cleanup () TO service_role;

COMMENT ON FUNCTION public.run_expired_data_cleanup () IS
    'Runs the TTL deletes from 20260418090000_ttl_cleanup.sql and records row counts in public.retention_cleanup_runs. Called hourly by the cleanup-expired-data pg_cron job.';

-- Re-schedule the existing cron job to call the metrics-capturing function.
-- We unschedule by name first so re-running this migration on an environment
-- that already installed the inline cron stays idempotent.
DO $$
DECLARE
    jid bigint;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        SELECT jobid INTO jid
        FROM cron.job
        WHERE jobname = 'cleanup-expired-data';
        IF jid IS NOT NULL THEN
            PERFORM cron.unschedule(jid);
        END IF;
        PERFORM cron.schedule(
            'cleanup-expired-data',
            '0 * * * *',
            $cmd$ SELECT public.run_expired_data_cleanup(); $cmd$
        );
    END IF;
END;
$$;

-- Dashboard surface. Mirrors the pattern from
-- 20260428270000_pilot_observability_views.sql: aggregated, no PII, granted to
-- authenticated (the moderators table membership check happens in the app).
CREATE OR REPLACE VIEW public.pilot_retention_cleanup_24h AS
SELECT
    date_trunc('hour', ran_at) AS hour_bucket,
    count(*)::int AS run_count,
    sum(messages_deleted)::int AS messages_deleted,
    sum(match_queue_deleted)::int AS match_queue_deleted,
    sum(squads_deleted)::int AS squads_deleted,
    max(ran_at) AS last_run_at,
    max(duration_ms)::int AS slowest_duration_ms
FROM
    public.retention_cleanup_runs
WHERE
    ran_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    date_trunc('hour', ran_at)
ORDER BY
    hour_bucket DESC;

COMMENT ON VIEW public.pilot_retention_cleanup_24h IS
    'Pilot dashboard: TTL cleanup activity per hour over the last 24h. Alert if no rows in the last 90 minutes (cron stalled) or messages_deleted = 0 every hour during pilot use (TTL not enforcing).';

REVOKE ALL ON public.pilot_retention_cleanup_24h FROM PUBLIC;

GRANT SELECT ON public.pilot_retention_cleanup_24h TO authenticated;
