-- pgTAP test: rotate_squad_key
--
-- Asserts:
--   1. Unauthenticated callers are denied (42501).
--   2. Authenticated non-moderators are denied (42501).
--   3. Empty / too-short reason is rejected (`rotation_reason_required`).
--   4. Moderator rotation creates a new epoch row with the next epoch_number,
--      retires the previous epoch, and updates squads.current_epoch_id +
--      squads.message_encryption_key to match.
--   5. A moderation_audit_log row with action='squad_key_rotated' is written.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'rot-member@example.test', '', now(), now(), now()),
    ('cccccccc-1111-1111-1111-cccccccccccc', 'authenticated', 'authenticated', 'rot-mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id) VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa'),
    ('cccccccc-1111-1111-1111-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES
    ('cccccccc-1111-1111-1111-cccccccccccc')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
    'dddddddd-1111-1111-1111-dddddddddddd',
    'pgtap rotate test',
    'active',
    now() + INTERVAL '1 day'
);

-- 1. Unauthenticated.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', NULL, true);
SELECT throws_ok(
    $$SELECT public.rotate_squad_key('dddddddd-1111-1111-1111-dddddddddddd'::uuid, 'cron rotate')$$,
    '42501',
    NULL,
    'unauthenticated caller is denied'
);

-- 2. Authenticated non-moderator.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa","role":"authenticated"}',
    true
);
SELECT throws_ok(
    $$SELECT public.rotate_squad_key('dddddddd-1111-1111-1111-dddddddddddd'::uuid, 'cron rotate')$$,
    '42501',
    NULL,
    'authenticated non-moderator is denied'
);

-- 3. Moderator with too-short reason.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-1111-1111-1111-cccccccccccc","role":"authenticated"}',
    true
);
SELECT throws_ok(
    $$SELECT public.rotate_squad_key('dddddddd-1111-1111-1111-dddddddddddd'::uuid, '')$$,
    'P0001',
    'rotation_reason_required',
    'empty reason is rejected'
);

-- 4. Happy path: rotation creates epoch 2 and retires epoch 1.
SELECT lives_ok(
    $$SELECT public.rotate_squad_key('dddddddd-1111-1111-1111-dddddddddddd'::uuid, 'pgtap rotate')$$,
    'moderator rotation succeeds'
);

SELECT is(
    (
        SELECT max(epoch_number)
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-1111-1111-1111-dddddddddddd'
    ),
    2,
    'rotation produced epoch_number=2'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'dddddddd-1111-1111-1111-dddddddddddd'
          AND epoch_number = 1
          AND retired_at IS NOT NULL
          AND retired_reason = 'pgtap rotate'
    ),
    1,
    'previous epoch is retired with reason'
);

SELECT is(
    (
        SELECT s.message_encryption_key = ke.encryption_key
        FROM public.squads s
        JOIN public.squad_key_epochs ke ON ke.id = s.current_epoch_id
        WHERE s.id = 'dddddddd-1111-1111-1111-dddddddddddd'
    ),
    TRUE,
    'squads.message_encryption_key mirrors current epoch key'
);

-- 5. Audit row written.
SELECT is(
    (
        SELECT count(*)::int
        FROM public.moderation_audit_log mal
        WHERE mal.action = 'squad_key_rotated'
          AND mal.target_id = 'dddddddd-1111-1111-1111-dddddddddddd'
          AND mal.metadata ->> 'reason' = 'pgtap rotate'
    ),
    1,
    'moderation_audit_log row recorded for rotation'
);

SELECT * FROM finish();

ROLLBACK;
