-- Fix: SECURITY DEFINER on pilot observability views.
--
-- Supabase flags views as SECURITY DEFINER by default when created without
-- the security_invoker option. These views query aggregated data from
-- match_queue, moderation_audit_log, and retention_cleanup_runs — all
-- tables with RLS enabled. Running as security_invoker = true ensures the
-- view executes under the querying user's privileges and respects RLS,
-- eliminating the privilege escalation risk.
--
-- No column or query changes — identical SELECT bodies to the originals.
-- Grants re-applied unchanged.

-- 1. pilot_match_queue_depth (originally: 20260428270000_pilot_observability_views.sql)
CREATE OR REPLACE VIEW public.pilot_match_queue_depth
  WITH (security_invoker = true)
AS
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
    enqueued_at >= timezone('utc'::text, now()) - interval '60 minutes'
GROUP BY
    pool_key, side, status;

COMMENT ON VIEW public.pilot_match_queue_depth IS
    'Pilot dashboard: match-queue depth by pool/side/status over the last hour. No user_id leakage.';

-- 2. pilot_match_latency_24h (originally: 20260428270000_pilot_observability_views.sql)
CREATE OR REPLACE VIEW public.pilot_match_latency_24h
  WITH (security_invoker = true)
AS
SELECT
    pool_key,
    count(*)::int AS matched_count,
    EXTRACT(epoch FROM avg(matched_at - enqueued_at))::numeric(12, 3) AS avg_match_seconds,
    EXTRACT(epoch FROM max(matched_at - enqueued_at))::numeric(12, 3) AS max_match_seconds
FROM
    public.match_queue
WHERE
    status = 'matched'
    AND matched_at IS NOT NULL
    AND matched_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    pool_key;

COMMENT ON VIEW public.pilot_match_latency_24h IS
    'Pilot dashboard: average and worst-case match latency in the last 24h, per pool.';

-- 3. pilot_decrypt_audit_24h (originally: 20260428270000_pilot_observability_views.sql)
CREATE OR REPLACE VIEW public.pilot_decrypt_audit_24h
  WITH (security_invoker = true)
AS
SELECT
    date_trunc('hour', created_at) AS hour_bucket,
    count(*)::int                  AS decrypt_count,
    count(DISTINCT actor_user_id)::int AS distinct_moderators,
    count(DISTINCT (metadata ->> 'squad_id'))::int AS distinct_squads
FROM
    public.moderation_audit_log
WHERE
    action = 'message_plaintext_decrypt_review'
    AND created_at >= timezone('utc'::text, now()) - interval '24 hours'
GROUP BY
    date_trunc('hour', created_at)
ORDER BY
    hour_bucket DESC;

COMMENT ON VIEW public.pilot_decrypt_audit_24h IS
    'Pilot dashboard: moderator decrypt-for-review volume per hour. Alert on unusual spikes.';

-- 4. pilot_retention_cleanup_24h (originally: 20260429140000_retention_cleanup_metrics.sql)
CREATE OR REPLACE VIEW public.pilot_retention_cleanup_24h
  WITH (security_invoker = true)
AS
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

-- Re-apply grants (unchanged from original migrations)
REVOKE ALL ON public.pilot_match_queue_depth FROM PUBLIC;
REVOKE ALL ON public.pilot_match_latency_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_decrypt_audit_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_retention_cleanup_24h FROM PUBLIC;

GRANT SELECT ON public.pilot_match_queue_depth TO authenticated;
GRANT SELECT ON public.pilot_match_latency_24h TO authenticated;
GRANT SELECT ON public.pilot_decrypt_audit_24h TO authenticated;
GRANT SELECT ON public.pilot_retention_cleanup_24h TO authenticated;
