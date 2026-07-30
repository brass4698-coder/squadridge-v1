-- pgTAP test: create_demo_squad RPC atomicity
--
-- Asserts that migration 20260428220000_create_demo_squad_rpc.sql:
--   1. Defines public.create_demo_squad as SECURITY DEFINER returning uuid.
--   2. Rejects callers without a JWT session (auth.uid() IS NULL).
--   3. On success, both squads + squad_members rows exist for the same id.
--   4. The squad row carries a server-generated message_encryption_key (BEFORE INSERT
--      trigger from 20260417150000), proving the trigger fired and we did NOT supply
--      one client-side.
--   5. EXECUTE is granted to authenticated only (not anon / public).
--
-- Atomicity itself is enforced by Postgres transaction semantics inside the function
-- body — there is no client-visible window where a squads row exists without its
-- squad_members row. We assert the structural pre-conditions plus a happy-path round-trip.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(7);

-- 1. Function exists with the expected return type.
SELECT has_function(
    'public',
    'create_demo_squad',
    ARRAY[]::text[],
    'create_demo_squad() exists'
);
SELECT function_returns(
    'public',
    'create_demo_squad',
    ARRAY[]::text[],
    'uuid',
    'create_demo_squad returns uuid'
);

-- 2. Function is SECURITY DEFINER (prosecdef = true).
SELECT is(
    (
        SELECT prosecdef
        FROM pg_proc
        WHERE proname = 'create_demo_squad'
          AND pronamespace = 'public'::regnamespace
    ),
    TRUE,
    'create_demo_squad is SECURITY DEFINER'
);

-- 3. EXECUTE is granted to `authenticated` role only.
SELECT ok(
    has_function_privilege('authenticated', 'public.create_demo_squad()', 'EXECUTE'),
    'authenticated role can EXECUTE create_demo_squad'
);
SELECT ok(
    NOT has_function_privilege('anon', 'public.create_demo_squad()', 'EXECUTE'),
    'anon role cannot EXECUTE create_demo_squad'
);

-- 4. No JWT → must raise (auth.uid() IS NULL path).
SET LOCAL ROLE authenticated;
SELECT throws_ok(
    $$SELECT public.create_demo_squad()$$,
    NULL,
    'authentication required',
    'create_demo_squad raises when auth.uid() is null (no JWT claims set)'
);

-- 5. Happy path: with a JWT, both rows are visible and the squad has a server-generated key.
-- We seed a real auth.users row (the FK target) and pin the JWT sub to it.
RESET ROLE;
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000000aa',
    'authenticated',
    'authenticated',
    'pgtap-create-demo-squad@example.test',
    '',
    timezone('utc'::text, now()),
    '{}'::jsonb,
    '{}'::jsonb,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000000aa","role":"authenticated"}',
    true
);

DO $$
DECLARE
    sid uuid;
    has_member boolean;
    has_key boolean;
BEGIN
    SELECT public.create_demo_squad() INTO sid;
    SELECT EXISTS (
        SELECT 1 FROM public.squad_members
        WHERE squad_id = sid
          AND user_id = '00000000-0000-0000-0000-0000000000aa'::uuid
    ) INTO has_member;
    SELECT (message_encryption_key IS NOT NULL AND length(btrim(message_encryption_key)) > 0)
    FROM public.squads WHERE id = sid INTO has_key;
    PERFORM set_config('mendguild.test.last_squad_id', sid::text, true);
    PERFORM set_config('mendguild.test.has_member', has_member::text, true);
    PERFORM set_config('mendguild.test.has_key', has_key::text, true);
END
$$;

SELECT is(
    current_setting('mendguild.test.has_member')::boolean,
    TRUE,
    'happy path: squad_members row inserted alongside squads row'
);

SELECT is(
    current_setting('mendguild.test.has_key')::boolean,
    TRUE,
    'happy path: server trigger populated message_encryption_key (no client-side key required)'
);

SELECT * FROM finish();

ROLLBACK;
