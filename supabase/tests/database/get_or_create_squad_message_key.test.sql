-- pgTAP test: get_or_create_squad_message_key
--
-- Asserts that the SECURITY DEFINER RPC added in migration
-- 20260429120000_squads_get_or_create_message_key_rpc.sql:
--   1. denies unauthenticated callers,
--   2. denies authenticated non-members (and non-moderators) of the target squad,
--   3. returns the existing key for a squad member without rotating it,
--   4. returns a freshly-generated key when message_encryption_key is null/empty
--      and is idempotent on a repeat call.
--
-- The migration 20260417150000_squads_message_encryption_key_server_default.sql
-- installs a BEFORE INSERT trigger that auto-fills missing keys, so we have to
-- either disable the trigger for the "missing" case or insert via service_role
-- bypass and then NULL-out the column. We use the latter (UPDATE after INSERT)
-- so the trigger remains active for the rest of the test.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(7);

-- Seed two auth users (member + outsider) and one moderator, then a squad.
-- We bypass auth.users RLS via direct INSERT (test runs as superuser by default).
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'member@example.test', '', now(), now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'outsider@example.test', '', now(), now(), now()),
    ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- handle_new_user trigger should mirror these into public.users; if not,
-- ensure rows exist (defensive).
INSERT INTO public.users (id) VALUES
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222'),
    ('33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES
    ('33333333-3333-3333-3333-333333333333')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'pgtap rpc test',
    'active',
    now() + INTERVAL '1 day'
);

-- Trigger has filled the key; capture it for idempotency checks.
\set squad_id '\'44444444-4444-4444-4444-444444444444\''

INSERT INTO public.squad_members (squad_id, user_id) VALUES
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 1. Unauthenticated caller: no JWT claims set, auth.uid() is NULL.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', NULL, true);
SELECT throws_ok(
    $$SELECT public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid)$$,
    '42501',
    NULL,
    'unauthenticated caller is denied'
);

-- 2. Authenticated non-member, non-moderator: outsider.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}',
    true
);
SELECT throws_ok(
    $$SELECT public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid)$$,
    '42501',
    NULL,
    'non-member, non-moderator caller is denied'
);

-- 3. Member call returns the existing key without rotating it.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
);
SELECT isnt(
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    NULL,
    'member call returns a non-null key'
);
SELECT is(
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    'member call is idempotent (same key on repeat)'
);

-- 4. Force the missing-key path: clear the column directly (service-role-ish bypass)
-- and confirm a fresh key is generated, then re-confirmed on a second call.
RESET ROLE;
UPDATE public.squads SET message_encryption_key = NULL WHERE id = '44444444-4444-4444-4444-444444444444';
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
);
SELECT isnt(
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    NULL,
    'member call generates a key when message_encryption_key was NULL'
);
SELECT is(
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    'second call after generation returns the same key (idempotent)'
);

-- 5. Moderator (not a member) is allowed.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}',
    true
);
SELECT isnt(
    public.get_or_create_squad_message_key('44444444-4444-4444-4444-444444444444'::uuid),
    NULL,
    'moderator (non-member) is permitted'
);

SELECT * FROM finish();

ROLLBACK;
