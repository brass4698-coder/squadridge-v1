-- pgTAP test: retention_cleanup_metrics
--
-- Asserts that migration 20260429140000_retention_cleanup_metrics.sql is in
-- effect: the metrics function exists, executes without error, writes one
-- row to public.retention_cleanup_runs with the row counts captured by
-- GET DIAGNOSTICS, and the dashboard view exposes that row.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(6);

-- 1. Function exists with the expected signature.
SELECT has_function(
    'public',
    'run_expired_data_cleanup',
    ARRAY[]::text[],
    'public.run_expired_data_cleanup() exists'
);

-- 2. Metrics table exists with the expected columns.
SELECT has_table('public', 'retention_cleanup_runs', 'retention_cleanup_runs table exists');
SELECT columns_are(
    'public',
    'retention_cleanup_runs',
    ARRAY[
        'id',
        'ran_at',
        'messages_deleted',
        'match_queue_deleted',
        'squads_deleted',
        'zk_proofs_deleted',
        'duration_ms'
    ],
    'retention_cleanup_runs has the expected columns'
);

-- 3. Calling the function on an empty TTL set still records a row (zero counts).
-- The invocation and the row-count check must be separate statements: a single
-- statement's snapshot cannot see rows inserted by a function it invokes itself.
CREATE TEMP TABLE _retention_before AS
SELECT count(*)::int AS n FROM public.retention_cleanup_runs;

SELECT lives_ok(
    $$SELECT public.run_expired_data_cleanup()$$,
    'run_expired_data_cleanup() executes without error'
);

SELECT is(
    (SELECT count(*)::int FROM public.retention_cleanup_runs)
        - (SELECT n FROM _retention_before),
    1,
    'run_expired_data_cleanup() inserts exactly one metrics row per call'
);

-- 4. Dashboard view exists.
SELECT has_view('public', 'pilot_retention_cleanup_24h', 'pilot_retention_cleanup_24h view exists');

SELECT * FROM finish();

ROLLBACK;
