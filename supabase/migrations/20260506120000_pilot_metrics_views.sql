-- Track E (impact metrics): readonly views feeding /admin/metrics.
--
-- Builds on the pilot_* views in 20260428270000. Adds the four metrics
-- docs/business/impact-metrics.md called out as "not claimed as instrumented
-- in-app yet":
--
--   * pilot_verification_success_rate_30d — derived from zk_proof_submissions;
--     production builds reject VITE_ZK_STUB so a row in this table is a
--     successful Semaphore + Edge proof.
--   * pilot_user_return_rate_30d — users with ≥2 squad memberships.
--   * pilot_intervention_usage_30d — count of UX interventions ("slow_down",
--     "pull_back") per type. Requires client wiring of the `interventions`
--     table; surfaces zero until that lands.
--   * pilot_participant_report_rate_30d — counts of participant reports per
--     reason_code in the last 30 days.
--   * pilot_moderator_hours_per_squad_30d — heuristic: distinct hours during
--     which a moderator wrote any audit row, grouped by metadata->>squad_id.
--
-- All views revoke PUBLIC and grant SELECT to authenticated; RLS on the
-- underlying tables ensures non-moderators can't read more than they could
-- before. The /admin/metrics page additionally gates by RequireModerator.

SET search_path = public;

-- 1. Verification success rate (30d).
CREATE OR REPLACE VIEW public.pilot_verification_success_rate_30d AS
WITH window AS (
    SELECT timezone('utc'::text, now()) - interval '30 days' AS since
)
SELECT
    (SELECT count(*)::int FROM public.zk_proof_submissions z, window w
     WHERE z.created_at >= w.since) AS verified_in_30d,
    (SELECT count(DISTINCT z.user_id)::int FROM public.zk_proof_submissions z, window w
     WHERE z.created_at >= w.since) AS distinct_users_verified_in_30d;

COMMENT ON VIEW public.pilot_verification_success_rate_30d IS
'30-day rollup of successful Semaphore proof verifications. Production builds reject VITE_ZK_STUB; rows here represent real verifications. Distinct user count helps separate "many proofs by one user" from "many users".';

-- 2. Return rate (≥2 squad memberships in 30d).
CREATE OR REPLACE VIEW public.pilot_user_return_rate_30d AS
WITH window AS (
    SELECT timezone('utc'::text, now()) - interval '30 days' AS since
),
membership_counts AS (
    SELECT
        sm.user_id,
        count(*) AS squad_count
    FROM
        public.squad_members sm,
        window w
    WHERE
        sm.joined_at >= w.since
    GROUP BY
        sm.user_id
)
SELECT
    (SELECT count(*)::int FROM membership_counts) AS active_users_30d,
    (SELECT count(*)::int FROM membership_counts WHERE squad_count >= 2) AS returning_users_30d;

COMMENT ON VIEW public.pilot_user_return_rate_30d IS
'Active vs returning users in the last 30 days. "Returning" = joined ≥2 squads in the window. See docs/business/impact-metrics.md.';

-- 3. Intervention usage (30d).
CREATE OR REPLACE VIEW public.pilot_intervention_usage_30d AS
SELECT
    intervention_type,
    count(*)::int AS event_count,
    count(DISTINCT squad_id)::int AS distinct_squads
FROM
    public.interventions
WHERE
    triggered_at >= timezone('utc'::text, now()) - interval '30 days'
GROUP BY
    intervention_type
ORDER BY
    intervention_type;

COMMENT ON VIEW public.pilot_intervention_usage_30d IS
'Count of UX intervention events (slow_down, pull_back, …) per type in the last 30 days. Surfaces 0 rows until the client telemetry hooks publish into the interventions table.';

-- 4. Participant report rate (30d).
CREATE OR REPLACE VIEW public.pilot_participant_report_rate_30d AS
SELECT
    reason_code,
    count(*)::int AS report_count,
    count(*) FILTER (WHERE status = 'open')::int AS open_count,
    count(*) FILTER (WHERE status IN ('resolved', 'dismissed'))::int AS closed_count
FROM
    public.participant_reports
WHERE
    created_at >= timezone('utc'::text, now()) - interval '30 days'
GROUP BY
    reason_code
ORDER BY
    reason_code;

COMMENT ON VIEW public.pilot_participant_report_rate_30d IS
'30-day counts of participant_reports per reason_code, with open vs closed breakdown.';

-- 5. Moderator hours per squad (30d, heuristic).
-- We approximate "moderator hours" by counting distinct (actor_user_id, hour)
-- pairs that wrote an audit row mentioning the squad in metadata. This is a
-- coarse proxy — it overcounts if a mod fires multiple short audit actions in
-- different hours and undercounts when work happens without writing audit
-- rows. The metric is honest about being a starting point; the impact-metrics
-- doc spells this out.
CREATE OR REPLACE VIEW public.pilot_moderator_hours_per_squad_30d AS
SELECT
    coalesce(metadata ->> 'squad_id', target_id::text) AS squad_id_text,
    count(DISTINCT (actor_user_id, date_trunc('hour', created_at)))::int AS approx_moderator_hours,
    count(DISTINCT actor_user_id)::int AS distinct_moderators,
    count(*)::int AS audit_rows
FROM
    public.moderation_audit_log
WHERE
    created_at >= timezone('utc'::text, now()) - interval '30 days'
    AND (
        target_type = 'squad'
        OR (metadata ? 'squad_id')
    )
GROUP BY
    coalesce(metadata ->> 'squad_id', target_id::text);

COMMENT ON VIEW public.pilot_moderator_hours_per_squad_30d IS
'Approximate moderator hours per squad over the last 30 days (distinct hour buckets in which a mod wrote an audit row about the squad). Heuristic; see impact-metrics.md.';

REVOKE ALL ON public.pilot_verification_success_rate_30d FROM PUBLIC;
REVOKE ALL ON public.pilot_user_return_rate_30d FROM PUBLIC;
REVOKE ALL ON public.pilot_intervention_usage_30d FROM PUBLIC;
REVOKE ALL ON public.pilot_participant_report_rate_30d FROM PUBLIC;
REVOKE ALL ON public.pilot_moderator_hours_per_squad_30d FROM PUBLIC;

GRANT SELECT ON public.pilot_verification_success_rate_30d TO authenticated;
GRANT SELECT ON public.pilot_user_return_rate_30d TO authenticated;
GRANT SELECT ON public.pilot_intervention_usage_30d TO authenticated;
GRANT SELECT ON public.pilot_participant_report_rate_30d TO authenticated;
GRANT SELECT ON public.pilot_moderator_hours_per_squad_30d TO authenticated;
