-- pgTAP: participant security gates + profile self-update guard

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

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
    status,
    identity_verification_required
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Security gate test',
    'Community & civic',
    'English',
    2,
    'live',
    true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (
    id,
    session_id,
    codename,
    invite_token,
    verification_status,
    document_submitted,
    invite_expires_at
)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Participant A',
    'securtok000000000000000001',
    'verified',
    false,
    now() + interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- 1. Messaging blocked without consent
SELECT is(
    public.participant_send_message('securtok000000000000000001', 'hello')->>'error',
    'CONSENT_REQUIRED',
    'participant_send_message requires consent'
);

-- 2. Consent blocked without document when identity required
SELECT is(
    public.record_participant_consent('securtok000000000000000001')->>'error',
    'DOCUMENT_REQUIRED',
    'record_participant_consent requires document when identity verification required'
);

-- 3. Register document via RPC
SELECT is(
    (public.participant_register_verification_document(
        'securtok000000000000000001',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/cccccccc-cccc-cccc-cccc-cccccccccccc/test.pdf',
        'passport',
        1024
    )->>'valid')::boolean,
    TRUE,
    'participant_register_verification_document succeeds with valid path'
);

-- 4. Consent succeeds after document
SELECT is(
    (public.record_participant_consent('securtok000000000000000001')->>'valid')::boolean,
    TRUE,
    'record_participant_consent succeeds after document submitted'
);

-- 5. Messaging succeeds after consent
SELECT is(
    (public.participant_send_message('securtok000000000000000001', 'hello')->>'valid')::boolean,
    TRUE,
    'participant_send_message succeeds when verified and consented'
);

-- 6. Profile status self-update blocked
INSERT INTO public.profiles (id, email, status, onboarding_completed)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'self@example.test',
    'pending',
    false
)
ON CONFLICT (id) DO NOTHING;

SELECT throws_ok(
    $$UPDATE public.profiles SET status = 'active' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'$$,
    'P0001',
    NULL,
    'profile status self-update is blocked'
);

-- 7. Facilitator cannot verify without materials when identity required
UPDATE public.participants
SET document_submitted = false,
    verification_status = 'pending',
    consented_at = null
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

DELETE FROM public.verification_requests
WHERE participant_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    public.facilitator_set_participant_verification(
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
        'verified'
    )->>'error',
    'NO_VERIFICATION_MATERIAL',
    'facilitator verify blocked without stored verification material'
);

-- 8. submit_access_request rate limit structure exists
RESET ROLE;
SELECT has_function(
    'public',
    'submit_access_request',
    ARRAY['text', 'text', 'text', 'text', 'text'],
    'submit_access_request RPC exists'
);

SELECT * FROM finish();

ROLLBACK;
