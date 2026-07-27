-- Matchmaking queue expire hardening (append-only follow-up).
--
-- Reality check vs early design notes:
--   * Table is public.match_queue (not matchmaking_queue).
--   * Columns are pool_key/side/status/enqueued_at (+ expires_at from TTL migration),
--     not location_hash/skill_tags/inserted_at.
--   * Forming sweep is matchmaking_sweep_active_pools (every 3 min).
--   * Expiry deletes live in run_expired_data_cleanup (hourly), now delegated to
--     public.sweep_matchmaking_queue() for a clear, testable surface.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  -- postgres owns cron jobs; USAGE is required on hosts that lock down the cron schema.
  GRANT USAGE ON SCHEMA cron TO postgres;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- schema absent when extension failed to install
  WHEN insufficient_privilege THEN
    NULL;
END;
$$;

-- Alias index name requested by ops checklist (idx_match_queue_expires_at already exists).
CREATE INDEX IF NOT EXISTS idx_mq_expires ON public.match_queue (expires_at);

CREATE OR REPLACE FUNCTION public.sweep_matchmaking_queue ()
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    deleted int := 0;
BEGIN
    DELETE FROM public.match_queue
    WHERE expires_at IS NOT NULL
        AND expires_at < timezone('utc'::text, now());
    GET DIAGNOSTICS deleted = ROW_COUNT;
    RETURN deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.sweep_matchmaking_queue () FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.sweep_matchmaking_queue () TO service_role;

COMMENT ON FUNCTION public.sweep_matchmaking_queue () IS
    'Deletes expired match_queue rows (expires_at < now()). Invoked by run_expired_data_cleanup / hourly pg_cron.';

-- Route the metrics-capturing cleanup through the named sweep helper.
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

    queue_rows := public.sweep_matchmaking_queue ();

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

-- Anon must not touch the queue table (RPC enqueue already revoked in 20260418100000;
-- explicit_role_grants later re-granted table DML to anon — claw that back here).
REVOKE ALL ON TABLE public.match_queue FROM anon;

-- Clients enqueue/cancel via SECURITY DEFINER RPCs; keep SELECT (+ UPDATE for legacy policy).
REVOKE INSERT, DELETE ON TABLE public.match_queue FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.matchmaking_pool_snapshot (text) FROM anon;

REVOKE EXECUTE ON FUNCTION public.matchmaking_cancel_waiting (text) FROM anon;
