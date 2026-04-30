-- pgTAP test: pilot observability views are moderator-gated in SQL.
--
-- A regular authenticated user must not be able to read pilot-wide operational
-- aggregates directly through PostgREST just because the views are granted to
-- `authenticated`. A moderator can read the same seeded data.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(6);

-- Seed two auth users and the mirrored public.users rows used by FKs.
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000000b1',
    'authenticated',
    'authenticated',
    'pgtap-observability-user@example.test',
    '',
    timezone('utc'::text, now()),
    '{}'::jsonb,
    '{}'::jsonb,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000000b2',
    'authenticated',
    'authenticated',
    'pgtap-observability-moderator@example.test',
    '',
    timezone('utc'::text, now()),
    '{}'::jsonb,
    '{}'::jsonb,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id)
VALUES
    ('00000000-0000-0000-0000-0000000000b1'),
    ('00000000-0000-0000-0000-0000000000b2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id)
VALUES ('00000000-0000-0000-0000-0000000000b2')
ON CONFLICT (user_id) DO NOTHING;

-- Seed rows that would be sensitive if exposed to every signed-in user.
INSERT INTO public.match_queue (user_id, pool_key, side, status, enqueued_at, matched_at)
VALUES
    (
        '00000000-0000-0000-0000-0000000000b1',
        'sensitive-pool',
        'A',
        'waiting',
        timezone('utc'::text, now()),
        NULL
    ),
    (
        '00000000-0000-0000-0000-0000000000b2',
        'sensitive-pool',
        'B',
        'matched',
        timezone('utc'::text, now()) - interval '5 minutes',
        timezone('utc'::text, now())
    );

INSERT INTO public.retention_cleanup_runs
    (messages_deleted, match_queue_deleted, squads_deleted, duration_ms)
VALUES (7, 3, 1, 42);

-- A non-moderator authenticated session can SELECT the views but receives no
-- operational rows, even for globally aggregated cleanup metrics.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}',
    true
);

SELECT is(
    (SELECT count(*)::int FROM public.pilot_match_queue_depth WHERE pool_key = 'sensitive-pool'),
    0,
    'non-moderator cannot read pilot_match_queue_depth rows'
);

SELECT is(
    (SELECT count(*)::int FROM public.pilot_retention_cleanup_24h WHERE messages_deleted >= 7),
    0,
    'non-moderator cannot read pilot_retention_cleanup_24h rows'
);

SELECT is(
    public.auth_user_is_moderator(),
    FALSE,
    'auth_user_is_moderator is false for a normal authenticated user'
);

-- A moderator session can read the same operational rows.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',
    true
);

SELECT ok(
    EXISTS (
        SELECT 1
        FROM public.pilot_match_queue_depth
        WHERE pool_key = 'sensitive-pool'
    ),
    'moderator can read pilot_match_queue_depth rows'
);

SELECT ok(
    EXISTS (
        SELECT 1
        FROM public.pilot_retention_cleanup_24h
        WHERE messages_deleted >= 7
    ),
    'moderator can read pilot_retention_cleanup_24h rows'
);

SELECT is(
    public.auth_user_is_moderator(),
    TRUE,
    'auth_user_is_moderator is true for a provisioned moderator'
);

SELECT * FROM finish();

ROLLBACK;
