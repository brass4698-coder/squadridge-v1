-- pgTAP: v2 session lifecycle, participant token validation, release_outcome guards
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(14);

-- Seed facilitator auth user
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'facilitator@example.test',
    '',
    now(),
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sessions (
    id,
    facilitator_id,
    title,
    conflict_type,
    language,
    max_participants,
    status
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'pgTAP lifecycle test',
    'Community & civic',
    'English',
    2,
    'setup'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (
    id,
    session_id,
    codename,
    invite_token,
    verification_status,
    invite_expires_at
)
VALUES
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Participant A',
        'validtoken000000000000000001',
        'pending',
        now() + interval '1 day'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Participant B',
        'validtoken000000000000000002',
        'verified',
        now() + interval '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 1. validate_participant_token exists
SELECT has_function(
    'public',
    'validate_participant_token',
    ARRAY['text'],
    'validate_participant_token(text) exists'
);

-- 2. Valid participant token
SELECT is(
    (public.validate_participant_token('validtoken000000000000000001')->>'valid')::boolean,
    TRUE,
    'valid participant token returns valid=true'
);

-- 3. Expired token
UPDATE public.participants
SET invite_expires_at = now() - interval '1 hour'
WHERE invite_token = 'validtoken000000000000000001';

SELECT is(
    public.validate_participant_token('validtoken000000000000000001')->>'error',
    'EXPIRED',
    'expired participant token returns EXPIRED'
);

-- Reset expiry for later tests
UPDATE public.participants
SET invite_expires_at = now() + interval '1 day'
WHERE invite_token = 'validtoken000000000000000001';

-- 4. Declined token
UPDATE public.participants
SET verification_status = 'denied'
WHERE invite_token = 'validtoken000000000000000001';

SELECT is(
    public.validate_participant_token('validtoken000000000000000001')->>'error',
    'DECLINED',
    'declined participant returns DECLINED'
);

UPDATE public.participants
SET verification_status = 'pending'
WHERE invite_token = 'validtoken000000000000000001';

-- 5. transition_session_status exists
SELECT has_function(
    'public',
    'transition_session_status',
    ARRAY['uuid', 'text'],
    'transition_session_status(uuid, text) exists'
);

-- 6. Cannot go live with unverified participants
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (public.transition_session_status(
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'live'
    )->>'ok')::boolean,
    FALSE,
    'transition to live blocked when participants unverified'
);

-- 7. Verify all participants then allow live
RESET ROLE;
UPDATE public.participants
SET verification_status = 'verified'
WHERE session_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (public.transition_session_status(
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'live'
    )->>'ok')::boolean,
    TRUE,
    'transition to live succeeds when all participants verified'
);

-- 8. End session
SELECT is(
    (public.transition_session_status(
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'ended'
    )->>'ok')::boolean,
    TRUE,
    'transition to ended succeeds from live'
);

-- Outcome + release_outcome fixtures
RESET ROLE;

INSERT INTO public.outcome_records (
    id,
    session_id,
    summary,
    agreed_terms,
    status
)
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Facilitator-authored summary of agreed principles.',
    'Term one agreed in good faith.',
    'draft'
)
ON CONFLICT (id) DO NOTHING;

-- 9. release_outcome rejects verbatim room content
-- Approvals are seeded after the text is final: any later edit resets them by design.
-- Drop the room key so this fixture can store legacy plaintext (verbatim guard only
-- substring-matches non-ciphertext rows; see 20260726093000_v2_session_room_encryption).
DELETE FROM public.session_room_keys
WHERE session_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

INSERT INTO public.session_messages (session_id, sender_label, sender_role, body)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Participant A',
    'participant',
    'This exact message must never appear in the public record verbatim.'
);

UPDATE public.outcome_records
SET summary = 'This exact message must never appear in the public record verbatim.'
WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

INSERT INTO public.outcome_approvals (outcome_id, approver_label, status)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Participant A', 'approved'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Participant B', 'approved');

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (public.facilitator_attest_outcome_authorship(
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
        'Facilitator-authored for pgTAP.'
    )->>'ok')::boolean,
    TRUE,
    'authorship attestation recorded before release attempt'
);

SELECT is(
    (public.release_outcome('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid)->>'error'),
    'VERBATIM_ROOM_CONTENT',
    'release_outcome rejects verbatim session message in outcome'
);

-- 10. release_outcome succeeds with facilitator-authored content
-- Rewriting the summary resets approvals and clears the attestation, so both are redone.
RESET ROLE;
UPDATE public.outcome_records
SET summary = 'Parties agreed to reconvene within ninety days for implementation review.'
WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

UPDATE public.outcome_approvals
SET status = 'approved'
WHERE outcome_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    (public.facilitator_attest_outcome_authorship(
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
        'Facilitator-authored for pgTAP.'
    )->>'ok')::boolean,
    TRUE,
    'authorship attestation re-recorded after the instrument was revised'
);

SELECT is(
    (public.release_outcome('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid)->>'ok')::boolean,
    TRUE,
    'release_outcome succeeds with facilitator-authored summary'
);

-- 11. Session marked released
SELECT is(
    (SELECT status FROM public.sessions WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    'released',
    'session status is released after successful release_outcome'
);

-- 12. Direct session release blocked without RPC flag
-- release_outcome sets the transaction-local app.allow_session_release flag, which
-- persists for the remainder of this pgTAP transaction — clear it, and use a fresh
-- ended session (the released one above is a no-op for the transition guard).
RESET ROLE;
SELECT set_config('app.allow_session_release', '', true);

INSERT INTO public.sessions (
    id,
    facilitator_id,
    title,
    conflict_type,
    language,
    max_participants,
    status
)
VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'pgTAP guard test',
    'Community & civic',
    'English',
    2,
    'ended'
)
ON CONFLICT (id) DO NOTHING;

SELECT throws_ok(
    $$UPDATE public.sessions SET status = 'released' WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'$$,
    'P0001',
    NULL,
    'direct update to released status is blocked by trigger'
);

SELECT * FROM finish();

ROLLBACK;
