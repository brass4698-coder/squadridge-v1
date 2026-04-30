-- Lock down pilot observability views to moderators at the SQL boundary.
--
-- The original dashboard views were granted to `authenticated` because the app
-- shell performs moderator gating. Supabase/PostgREST still exposes public
-- views directly, and regular Postgres views run with the owner privileges by
-- default, so relying on app-only gating can leak global pilot aggregates to any
-- signed-in user. Keep the views callable by authenticated clients, but make
-- every view definition return rows only when auth.uid() belongs to the
-- moderators roster.

CREATE OR REPLACE FUNCTION public.auth_user_is_moderator ()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.moderators m
        WHERE m.user_id = auth.uid ()
    );
$$;

REVOKE ALL ON FUNCTION public.auth_user_is_moderator () FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_is_moderator () TO authenticated;

COMMENT ON FUNCTION public.auth_user_is_moderator () IS
    'Returns true when the current JWT subject is provisioned in public.moderators. Used by pilot dashboard views so direct Data API access cannot bypass app-level moderator gating.';

CREATE OR REPLACE VIEW public.pilot_match_queue_depth
WITH (security_barrier = true) AS
SELECT
    pool_key,
    side,
    status,
    count(*)::int           AS row_count,
    min(enqueued_at)        AS oldest_enqueued_at,
    max(enqueued_at)        AS newest_enqueued_at
FROM
    public.match_queue
WHERE
    public.auth_user_is_moderator ()
    AND enqueued_at >= timezone('utc'::text, now()) - interval '60 minutes'
GROUP BY
    pool_key, side, status;

CREATE OR REPLACE VIEW public.pilot_match_latency_24h
WITH (security_barrier = true) AS
SELECT
    pool_key,
    count(*)::int AS matched_count,
    EXTRACT(epoch FROM avg(matched_at - enqueued_at))::numeric(12, 3) AS avg_match_seconds,
    EXTRACT(epoch FROM max(matched_at - enqueued_at))::numeric(12, 3) AS max_match_seconds
FROM
    public.match_queue
WHERE
    public.auth_user_is_moderator ()
    AND status = 'matched'
    AND matched_at IS NOT NULL
    AND matched_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    pool_key;

CREATE OR REPLACE VIEW public.pilot_decrypt_audit_24h
WITH (security_barrier = true) AS
SELECT
    date_trunc('hour', created_at) AS hour_bucket,
    count(*)::int                  AS decrypt_count,
    count(DISTINCT actor_user_id)::int AS distinct_moderators,
    count(DISTINCT (metadata ->> 'squad_id'))::int AS distinct_squads
FROM
    public.moderation_audit_log
WHERE
    public.auth_user_is_moderator ()
    AND action = 'message_plaintext_decrypt_review'
    AND created_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    date_trunc('hour', created_at)
ORDER BY
    hour_bucket DESC;

CREATE OR REPLACE VIEW public.pilot_claim_finalize_24h
WITH (security_barrier = true) AS
SELECT
    count(*) FILTER (WHERE consumed_at IS NOT NULL)::int AS finalized_count,
    count(*) FILTER (WHERE consumed_at IS NULL AND created_at >= timezone('utc'::text, now()) - interval '24 hours')::int AS pending_count,
    count(*) FILTER (WHERE consumed_at IS NOT NULL AND verified_user_id IS NULL)::int AS finalized_without_verified_user
FROM
    public.demo_session_claims
WHERE
    public.auth_user_is_moderator ()
    AND created_at >= timezone('utc'::text, now()) - interval '24 hours';

CREATE OR REPLACE VIEW public.pilot_key_creation_events_24h
WITH (security_barrier = true) AS
SELECT
    date_trunc('hour', created_at) AS hour_bucket,
    count(*)::int                  AS squads_created
FROM
    public.squads
WHERE
    public.auth_user_is_moderator ()
    AND created_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    date_trunc('hour', created_at)
ORDER BY
    hour_bucket DESC;

CREATE OR REPLACE VIEW public.pilot_crisis_alerts_open
WITH (security_barrier = true) AS
SELECT
    id,
    squad_id,
    reason_code,
    created_at,
    EXTRACT(epoch FROM (timezone('utc'::text, now()) - created_at))::numeric(12, 0) AS open_seconds
FROM
    public.crisis_alerts
WHERE
    public.auth_user_is_moderator ()
    AND acknowledged_at IS NULL
ORDER BY
    created_at DESC;

CREATE OR REPLACE VIEW public.pilot_retention_cleanup_24h
WITH (security_barrier = true) AS
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
    public.auth_user_is_moderator ()
    AND ran_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    date_trunc('hour', ran_at)
ORDER BY
    hour_bucket DESC;

COMMENT ON VIEW public.pilot_match_queue_depth IS
    'Pilot dashboard: match-queue depth by pool/side/status over the last hour. Moderator-gated in SQL; no user_id leakage.';
COMMENT ON VIEW public.pilot_match_latency_24h IS
    'Pilot dashboard: average and worst-case match latency in the last 24h, per pool. Moderator-gated in SQL.';
COMMENT ON VIEW public.pilot_decrypt_audit_24h IS
    'Pilot dashboard: moderator decrypt-for-review volume per hour. Moderator-gated in SQL; alert on unusual spikes.';
COMMENT ON VIEW public.pilot_claim_finalize_24h IS
    'Pilot dashboard: 24h demo-claim finalize stats. Moderator-gated in SQL; `finalized_without_verified_user > 0` is a data-integrity alert.';
COMMENT ON VIEW public.pilot_key_creation_events_24h IS
    'Pilot dashboard: rate of new squads (approximately rate of squad encryption keys generated by the BEFORE INSERT trigger). Moderator-gated in SQL.';
COMMENT ON VIEW public.pilot_crisis_alerts_open IS
    'Pilot dashboard: unacknowledged crisis alerts with age in seconds. Moderator-gated in SQL; page the on-call when reason_code = ''immediate_danger''.';
COMMENT ON VIEW public.pilot_retention_cleanup_24h IS
    'Pilot dashboard: TTL cleanup activity per hour over the last 24h. Moderator-gated in SQL. Alert if no rows in the last 90 minutes or if active-pilot deletes stay at zero unexpectedly.';

REVOKE ALL ON public.pilot_match_queue_depth FROM PUBLIC;
REVOKE ALL ON public.pilot_match_latency_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_decrypt_audit_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_claim_finalize_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_key_creation_events_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_crisis_alerts_open FROM PUBLIC;
REVOKE ALL ON public.pilot_retention_cleanup_24h FROM PUBLIC;

GRANT SELECT ON public.pilot_match_queue_depth TO authenticated;
GRANT SELECT ON public.pilot_match_latency_24h TO authenticated;
GRANT SELECT ON public.pilot_decrypt_audit_24h TO authenticated;
GRANT SELECT ON public.pilot_claim_finalize_24h TO authenticated;
GRANT SELECT ON public.pilot_key_creation_events_24h TO authenticated;
GRANT SELECT ON public.pilot_crisis_alerts_open TO authenticated;
GRANT SELECT ON public.pilot_retention_cleanup_24h TO authenticated;
