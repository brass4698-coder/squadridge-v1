-- pgTAP test: pilot observability view ACLs
--
-- These public-schema dashboard views are reachable through PostgREST when
-- granted to end-user roles. They must remain service-role only.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(28);

SELECT has_view('public', 'pilot_match_queue_depth', 'pilot_match_queue_depth exists');
SELECT has_view('public', 'pilot_match_latency_24h', 'pilot_match_latency_24h exists');
SELECT has_view('public', 'pilot_decrypt_audit_24h', 'pilot_decrypt_audit_24h exists');
SELECT has_view('public', 'pilot_claim_finalize_24h', 'pilot_claim_finalize_24h exists');
SELECT has_view('public', 'pilot_key_creation_events_24h', 'pilot_key_creation_events_24h exists');
SELECT has_view('public', 'pilot_crisis_alerts_open', 'pilot_crisis_alerts_open exists');
SELECT has_view('public', 'pilot_retention_cleanup_24h', 'pilot_retention_cleanup_24h exists');

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_match_queue_depth'::regclass
        ),
        FALSE
    ),
    'pilot_match_queue_depth is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_match_latency_24h'::regclass
        ),
        FALSE
    ),
    'pilot_match_latency_24h is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_decrypt_audit_24h'::regclass
        ),
        FALSE
    ),
    'pilot_decrypt_audit_24h is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_claim_finalize_24h'::regclass
        ),
        FALSE
    ),
    'pilot_claim_finalize_24h is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_key_creation_events_24h'::regclass
        ),
        FALSE
    ),
    'pilot_key_creation_events_24h is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_crisis_alerts_open'::regclass
        ),
        FALSE
    ),
    'pilot_crisis_alerts_open is security_invoker'
);

SELECT ok(
    coalesce(
        (
            SELECT reloptions @> ARRAY['security_invoker=true']
            FROM pg_class
            WHERE oid = 'public.pilot_retention_cleanup_24h'::regclass
        ),
        FALSE
    ),
    'pilot_retention_cleanup_24h is security_invoker'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_match_queue_depth', 'SELECT'),
    'authenticated cannot SELECT pilot_match_queue_depth'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_match_latency_24h', 'SELECT'),
    'authenticated cannot SELECT pilot_match_latency_24h'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_decrypt_audit_24h', 'SELECT'),
    'authenticated cannot SELECT pilot_decrypt_audit_24h'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_claim_finalize_24h', 'SELECT'),
    'authenticated cannot SELECT pilot_claim_finalize_24h'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_key_creation_events_24h', 'SELECT'),
    'authenticated cannot SELECT pilot_key_creation_events_24h'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_crisis_alerts_open', 'SELECT'),
    'authenticated cannot SELECT pilot_crisis_alerts_open'
);

SELECT ok(
    NOT has_table_privilege('authenticated', 'public.pilot_retention_cleanup_24h', 'SELECT'),
    'authenticated cannot SELECT pilot_retention_cleanup_24h'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_match_queue_depth', 'SELECT'),
    'service_role can SELECT pilot_match_queue_depth'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_match_latency_24h', 'SELECT'),
    'service_role can SELECT pilot_match_latency_24h'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_decrypt_audit_24h', 'SELECT'),
    'service_role can SELECT pilot_decrypt_audit_24h'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_claim_finalize_24h', 'SELECT'),
    'service_role can SELECT pilot_claim_finalize_24h'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_key_creation_events_24h', 'SELECT'),
    'service_role can SELECT pilot_key_creation_events_24h'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_crisis_alerts_open', 'SELECT'),
    'service_role can SELECT pilot_crisis_alerts_open'
);

SELECT ok(
    has_table_privilege('service_role', 'public.pilot_retention_cleanup_24h', 'SELECT'),
    'service_role can SELECT pilot_retention_cleanup_24h'
);

SELECT * FROM finish();

ROLLBACK;
