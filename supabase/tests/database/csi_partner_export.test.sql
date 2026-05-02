-- pgTAP test: csi_partners + csi_partner_grants + csi_export_audit_log RLS.
--
-- Asserts the table-layer guarantees the Edge function depends on:
--   1. Authenticated (even moderator) cannot INSERT/UPDATE/DELETE on
--      csi_partners or csi_partner_grants — provisioning is service-role only.
--   2. Moderators can SELECT (for diligence reads in admin UI).
--   3. Non-moderator authenticated users cannot SELECT.
--   4. csi_export_audit_log: same read posture; no client write surface.
--   5. hash_partner_api_key returns hex SHA-256.
--
-- Run with: supabase test db.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(7);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'partner-outsider@example.test', '', now(), now(), now()),
    ('cccccccc-3333-3333-3333-cccccccccccc', 'authenticated', 'authenticated', 'partner-mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id) VALUES
    ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa'),
    ('cccccccc-3333-3333-3333-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES ('cccccccc-3333-3333-3333-cccccccccccc')
ON CONFLICT (user_id) DO NOTHING;

-- Service-role-equivalent insert (test runs as superuser).
INSERT INTO public.csi_partners (id, name, contact_email, api_key_hash)
VALUES (
    'aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb',
    'pgtap partner',
    'pgtap@example.test',
    public.hash_partner_api_key('pgtap-secret-pgtap-secret-pgtap-secret')
);

INSERT INTO public.csi_partner_grants (partner_id, region_key)
VALUES ('aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb', 'region-a');

-- 1. Moderator CAN select partners + grants + audit.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-3333-3333-3333-cccccccccccc","role":"authenticated"}',
    true
);

SELECT is(
    (SELECT count(*)::int FROM public.csi_partners WHERE id = 'aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb'),
    1,
    'moderator can SELECT csi_partners'
);

SELECT is(
    (SELECT count(*)::int FROM public.csi_partner_grants WHERE partner_id = 'aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb'),
    1,
    'moderator can SELECT csi_partner_grants'
);

-- 2. Outsider CANNOT select (returns 0 rows; no FK error).
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (SELECT count(*)::int FROM public.csi_partners),
    0,
    'authenticated non-moderator cannot SELECT csi_partners'
);

-- 3. Moderator cannot INSERT into csi_partners (no INSERT policy).
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-3333-3333-3333-cccccccccccc","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$INSERT INTO public.csi_partners (name, contact_email, api_key_hash)
      VALUES ('forged', 'a@b.c', public.hash_partner_api_key('forged-secret'))$$,
    '42501',
    NULL,
    'moderator cannot INSERT into csi_partners (provisioning is service_role only)'
);

SELECT throws_ok(
    $$INSERT INTO public.csi_partner_grants (partner_id, region_key)
      VALUES ('aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb', 'region-b')$$,
    '42501',
    NULL,
    'moderator cannot INSERT into csi_partner_grants'
);

-- 4. Moderator cannot INSERT into the audit log (service role writes only).
SELECT throws_ok(
    $$INSERT INTO public.csi_export_audit_log (partner_id, region_keys, response_status)
      VALUES ('aaaaaaaa-3333-3333-3333-bbbbbbbbbbbb', ARRAY['region-a'], 200)$$,
    '42501',
    NULL,
    'moderator cannot INSERT into csi_export_audit_log'
);

-- 5. hash_partner_api_key shape: 64 hex chars.
RESET ROLE;
SELECT is(
    length(public.hash_partner_api_key('any-key')),
    64,
    'hash_partner_api_key returns 64-char hex SHA-256'
);

SELECT * FROM finish();

ROLLBACK;
