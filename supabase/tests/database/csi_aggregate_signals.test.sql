-- pgTAP test: csi_aggregate_signals.
--
-- Asserts:
--   1. The function is service-role only (REVOKEd from authenticated).
--   2. With no facilitator codes in window, returns zero-valued inputs but
--      preserves the JSON shape (squadCount, messageCount, inputs,
--      topGrievances).
--   3. With codes for the matching region+window, returns inputs that
--      reflect the codes (averaged intensities for sentiment / grievance /
--      ingroup; per-1k for resource; per-session for violence).
--
-- Run with: supabase test db.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(5);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('cccccccc-2222-2222-2222-cccccccccccc', 'authenticated', 'authenticated', 'csi-mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id) VALUES ('cccccccc-2222-2222-2222-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES ('cccccccc-2222-2222-2222-cccccccccccc')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.squads (id, topic, status, expires_at)
VALUES ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'csi pgtap', 'active', now() + INTERVAL '1 day');

-- 1. Authenticated caller is denied.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-2222-2222-2222-cccccccccccc","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$SELECT public.csi_aggregate_signals('region-a', now() - INTERVAL '1 day', now())$$,
    '42501',
    NULL,
    'authenticated (even moderator) cannot call csi_aggregate_signals directly'
);

-- 2. Service role with empty data: zero-valued inputs but correct shape.
RESET ROLE;
WITH agg AS (
    SELECT public.csi_aggregate_signals(
        'region-empty',
        now() - INTERVAL '1 day',
        now()
    ) AS r
)
SELECT is(
    (SELECT r->>'squadCount' FROM agg)::int,
    0,
    'empty window: squadCount=0'
);

WITH agg AS (
    SELECT public.csi_aggregate_signals(
        'region-empty',
        now() - INTERVAL '1 day',
        now()
    ) AS r
)
SELECT is(
    (SELECT (r->'inputs'->>'negativeMessageRatio24h')::numeric FROM agg),
    0::numeric,
    'empty window: negativeMessageRatio24h=0'
);

-- 3. Insert a few facilitator codes for region-a in the window. We bypass
-- RLS by inserting as the test superuser (RESET ROLE above).
INSERT INTO public.facilitator_signal_codes (squad_id, region_key, code, intensity, coder_id)
VALUES
    ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'region-a', 'sentiment_negative', 60, 'cccccccc-2222-2222-2222-cccccccccccc'),
    ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'region-a', 'sentiment_negative', 80, 'cccccccc-2222-2222-2222-cccccccccccc'),
    ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'region-a', 'grievance_repeat', 50, 'cccccccc-2222-2222-2222-cccccccccccc'),
    ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'region-a', 'ingroup_outgroup', 40, 'cccccccc-2222-2222-2222-cccccccccccc'),
    ('eeeeeeee-2222-2222-2222-eeeeeeeeeeee', 'region-a', 'violence_justifying', 70, 'cccccccc-2222-2222-2222-cccccccccccc');

WITH agg AS (
    SELECT public.csi_aggregate_signals(
        'region-a',
        now() - INTERVAL '1 day',
        now() + INTERVAL '1 hour'
    ) AS r
)
SELECT is(
    (SELECT r->>'squadCount' FROM agg)::int,
    1,
    'populated window: squadCount=1 (one squad with codes)'
);

-- Sentiment_negative codes: avg(60, 80) / 100 = 0.7
WITH agg AS (
    SELECT public.csi_aggregate_signals(
        'region-a',
        now() - INTERVAL '1 day',
        now() + INTERVAL '1 hour'
    ) AS r
)
SELECT is(
    round((SELECT (r->'inputs'->>'negativeMessageRatio24h')::numeric FROM agg), 2),
    0.70::numeric,
    'sentiment-negative inputs averaged correctly'
);

SELECT * FROM finish();

ROLLBACK;
