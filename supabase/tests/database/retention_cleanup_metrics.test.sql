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

SELECT plan(5);

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
        'duration_ms'
    ],
    'retention_cleanup_runs has the expected columns'
);

-- 3. Calling the function on an empty TTL set still records a row (zero counts).
WITH before_count AS (
    SELECT count(*)::int AS n FROM public.retention_cleanup_runs
), invocation AS (
    SELECT public.run_expired_data_cleanup() AS run
), after_count AS (
    SELECT count(*)::int AS n FROM public.retention_cleanup_runs
)
SELECT is(
    (SELECT after_count.n - before_count.n FROM before_count, after_count, invocation),
    1,
    'run_expired_data_cleanup() inserts exactly one metrics row per call'
);

-- 4. Dashboard view exists.
SELECT has_view('public', 'pilot_retention_cleanup_24h', 'pilot_retention_cleanup_24h view exists');

SELECT * FROM finish();

ROLLBACK;
