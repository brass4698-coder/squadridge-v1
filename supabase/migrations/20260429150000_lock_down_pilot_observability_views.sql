-- Lock down pilot observability views.
--
-- The dashboard views live in the exposed `public` schema for service-role
-- tooling, but PostgREST exposes any SELECT grant on public views directly.
-- Do not rely on app-level moderator routing for these SQL objects: an
-- authenticated client can query granted public views without going through
-- the app. Service-role dashboards keep full visibility; end-user JWTs do not.

SET search_path = public;

ALTER VIEW public.pilot_match_queue_depth SET (security_invoker = true);
ALTER VIEW public.pilot_match_latency_24h SET (security_invoker = true);
ALTER VIEW public.pilot_decrypt_audit_24h SET (security_invoker = true);
ALTER VIEW public.pilot_claim_finalize_24h SET (security_invoker = true);
ALTER VIEW public.pilot_key_creation_events_24h SET (security_invoker = true);
ALTER VIEW public.pilot_crisis_alerts_open SET (security_invoker = true);
ALTER VIEW public.pilot_retention_cleanup_24h SET (security_invoker = true);

REVOKE ALL ON public.pilot_match_queue_depth FROM PUBLIC;
REVOKE ALL ON public.pilot_match_latency_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_decrypt_audit_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_claim_finalize_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_key_creation_events_24h FROM PUBLIC;
REVOKE ALL ON public.pilot_crisis_alerts_open FROM PUBLIC;
REVOKE ALL ON public.pilot_retention_cleanup_24h FROM PUBLIC;

REVOKE SELECT ON public.pilot_match_queue_depth FROM anon, authenticated;
REVOKE SELECT ON public.pilot_match_latency_24h FROM anon, authenticated;
REVOKE SELECT ON public.pilot_decrypt_audit_24h FROM anon, authenticated;
REVOKE SELECT ON public.pilot_claim_finalize_24h FROM anon, authenticated;
REVOKE SELECT ON public.pilot_key_creation_events_24h FROM anon, authenticated;
REVOKE SELECT ON public.pilot_crisis_alerts_open FROM anon, authenticated;
REVOKE SELECT ON public.pilot_retention_cleanup_24h FROM anon, authenticated;

GRANT SELECT ON public.pilot_match_queue_depth TO service_role;
GRANT SELECT ON public.pilot_match_latency_24h TO service_role;
GRANT SELECT ON public.pilot_decrypt_audit_24h TO service_role;
GRANT SELECT ON public.pilot_claim_finalize_24h TO service_role;
GRANT SELECT ON public.pilot_key_creation_events_24h TO service_role;
GRANT SELECT ON public.pilot_crisis_alerts_open TO service_role;
GRANT SELECT ON public.pilot_retention_cleanup_24h TO service_role;

COMMENT ON VIEW public.pilot_crisis_alerts_open IS
    'Pilot dashboard: unacknowledged crisis alerts with age in seconds. Service-role only; do not expose to end-user JWTs.';
