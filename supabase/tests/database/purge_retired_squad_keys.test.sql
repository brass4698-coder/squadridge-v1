-- pgTAP test: purge_retired_squad_key_material + archive purge integration.
--
-- Asserts:
--   1. purge_retired_squad_key_material is service-role only (REVOKEd from
--      authenticated).
--   2. A retired epoch on a LIVE squad whose retired_at is older than the
--      cutoff has its encryption_key cleared and encryption_key_purged_at
--      set; the audit row is written.
--   3. The current (non-retired) epoch on a live squad is NOT purged.
--   4. moderator_archive_squad now snapshots the live key AND purges all
--      epoch keys for the squad.
--   5. After archive, the archive snapshot column still holds recoverable
--      key material; the moderator audit row carries purged_epoch_keys.
--
-- Run with: supabase test db.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
    ('cccccccc-1111-2222-3333-cccccccccccc', 'authenticated', 'authenticated', 'purge-mod@example.test', '', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id) VALUES ('cccccccc-1111-2222-3333-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.moderators (user_id) VALUES ('cccccccc-1111-2222-3333-cccccccccccc')
ON CONFLICT (user_id) DO NOTHING;

-- Live squad with two epochs: epoch 1 retired 60 days ago, epoch 2 current.
INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
    'eeeeeeee-1111-2222-3333-eeeeeeeeeeee',
    'live two-epoch squad',
    'active',
    now() + INTERVAL '1 day'
);

UPDATE public.squad_key_epochs
SET retired_at = now() - INTERVAL '60 days', retired_reason = 'pgtap stale'
WHERE squad_id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee'
  AND epoch_number = 1;

INSERT INTO public.squad_key_epochs (squad_id, epoch_number, encryption_key)
VALUES ('eeeeeeee-1111-2222-3333-eeeeeeeeeeee', 2, encode(gen_random_bytes(32), 'base64'));

UPDATE public.squads
SET current_epoch_id = (SELECT id FROM public.squad_key_epochs WHERE squad_id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee' AND epoch_number = 2),
    message_encryption_key = (SELECT encryption_key FROM public.squad_key_epochs WHERE squad_id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee' AND epoch_number = 2)
WHERE id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee';

-- 1. purge function denied for authenticated role.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-1111-2222-3333-cccccccccccc","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$SELECT public.purge_retired_squad_key_material(30)$$,
    '42501',
    NULL,
    'authenticated (even moderator) cannot call purge_retired_squad_key_material directly'
);

-- 2. Service-role purge: epoch 1 should be purged, epoch 2 should not.
RESET ROLE;

SELECT lives_ok(
    $$SELECT public.purge_retired_squad_key_material(30)$$,
    'service-role caller can run purge'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee'
          AND epoch_number = 1
          AND encryption_key IS NULL
          AND encryption_key_purged_at IS NOT NULL
    ),
    1,
    'retired epoch older than cutoff is purged'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'eeeeeeee-1111-2222-3333-eeeeeeeeeeee'
          AND epoch_number = 2
          AND encryption_key IS NOT NULL
          AND encryption_key_purged_at IS NULL
    ),
    1,
    'current (non-retired) epoch is preserved'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM public.moderation_audit_log
        WHERE action = 'squad_key_epoch_purge_run'
    ),
    1,
    'purge run audit row written'
);

-- 3. Archive flow: a separate live squad with a populated key snapshot.
INSERT INTO public.squads (id, topic, status, expires_at)
VALUES (
    'ffffffff-1111-2222-3333-ffffffffffff',
    'archive purge squad',
    'active',
    now() + INTERVAL '1 day'
);

-- Confirm precondition: epoch 1 has a non-null key.
SELECT is(
    (
        SELECT count(*)::int
        FROM public.squad_key_epochs
        WHERE squad_id = 'ffffffff-1111-2222-3333-ffffffffffff'
          AND encryption_key IS NOT NULL
    ),
    1,
    'pre-archive: epoch row has a key'
);

-- Moderator archives the squad — this should snapshot + purge in one step.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"cccccccc-1111-2222-3333-cccccccccccc","role":"authenticated"}',
    true
);

SELECT lives_ok(
    $$SELECT public.moderator_archive_squad('ffffffff-1111-2222-3333-ffffffffffff'::uuid)$$,
    'moderator can archive squad'
);

-- After archive: snapshot column populated, all epoch keys purged.
RESET ROLE;
SELECT is(
    (
        SELECT
            archived_encryption_key_snapshot IS NOT NULL
            AND (
                SELECT count(*) FROM public.squad_key_epochs ke
                WHERE ke.squad_id = 'ffffffff-1111-2222-3333-ffffffffffff'
                  AND ke.encryption_key IS NOT NULL
            ) = 0
        FROM public.squads
        WHERE id = 'ffffffff-1111-2222-3333-ffffffffffff'
    ),
    TRUE,
    'after archive: snapshot retained, epoch keys cleared'
);

SELECT * FROM finish();

ROLLBACK;
