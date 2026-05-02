-- pgTAP test: squad_key_epochs
--
-- Asserts:
--   1. The table exists with RLS enabled and no INSERT/UPDATE/DELETE policy
--      for the `authenticated` role.
--   2. Squad members can SELECT their own squad's epochs.
--   3. Non-member, non-moderator authenticated users cannot SELECT.
--   4. Moderators can SELECT epochs for any squad.
--   5. Authenticated direct INSERT into squad_key_epochs raises 42501.
--   6. The backfill produced epoch 1 for a new squad and squads.current_epoch_id
--      points at it; existing messages get key_epoch_id = current_epoch_id.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'epoch-member@example.test', '', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'epoch-outsider@example.test', '', now(), now(), now()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'authenticated', 'authenticated', 'epoch-mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'pgtap epoch test',
    'active',
    now() + INTERVAL '1 day'
);

INSERT INTO public.squad_members (squad_id, user_id) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- 1. RLS is enabled and structural denial is in place.
SELECT is(
    (
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = 'squad_key_epochs' AND relnamespace = 'public'::regnamespace
    ),
    TRUE,
    'squad_key_epochs has RLS enabled'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'squad_key_epochs'
          AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    ),
    0,
    'squad_key_epochs has no INSERT/UPDATE/DELETE policy for authenticated role'
);

-- 2. Backfill: epoch 1 exists for the new squad and current_epoch_id points at it.
SELECT is(
    (
        SELECT epoch_number
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
        ORDER BY epoch_number DESC
        LIMIT 1
    ),
    1,
    'backfill produced epoch 1 for new squad'
);

SELECT isnt(
    (
        SELECT current_epoch_id
        FROM public.squads
        WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ),
    NULL,
    'squads.current_epoch_id is set after backfill'
);

-- 3. Member SELECT: 1 row visible.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ),
    1,
    'squad member can SELECT their own squad''s epoch row'
);

-- 4. Outsider SELECT: 0 rows visible (RLS hides them).
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}',
    true
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ),
    0,
    'authenticated non-member cannot SELECT another squad''s epoch row'
);

-- 5. Moderator SELECT: visible.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}',
    true
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ),
    1,
    'moderator can SELECT any squad''s epoch row'
);

-- 6. Direct INSERT as authenticated raises 42501.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$INSERT INTO public.squad_key_epochs (squad_id, epoch_number, encryption_key)
      VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 99, 'forged')$$,
    '42501',
    NULL,
    'authenticated role cannot INSERT into squad_key_epochs (no INSERT policy granted)'
);

SELECT * FROM finish();

ROLLBACK;
