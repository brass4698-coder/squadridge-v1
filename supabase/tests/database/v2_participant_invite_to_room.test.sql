-- pgTAP: facilitator-generated invite_token → validate → consent → room messaging
-- Mirrors ROADMAP P0 #2 acceptance (DB side of ParticipantInvitePage → /p/room).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'facilitator-invite@example.test',
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
    identity_verification_required,
    template_id
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'NGO deliberation invite path',
    'Community & civic',
    'English',
    4,
    'setup',
    false,
    'ngo_deliberation'
)
ON CONFLICT (id) DO NOTHING;

-- Facilitator invite: insert participant with generated-style token (ParticipantInvitePage)
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
    'Staff A',
    'invitetoroom0000000000000001',
    'pending',
    false,
    now() + interval '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 1. Invite link validates (not staff invites table)
SELECT is(
    (public.validate_participant_token('invitetoroom0000000000000001')->>'valid')::boolean,
    TRUE,
    'facilitator-generated participant invite_token validates'
);

-- 2. Contact hash (verify step)
SELECT is(
    (public.participant_record_contact_hash(
        'invitetoroom0000000000000001',
        'staff.a@ngo.example'
    )->>'valid')::boolean,
    TRUE,
    'participant_record_contact_hash succeeds on invite token'
);

-- 3. Consent without document when identity_verification_required = false
SELECT is(
    (public.record_participant_consent('invitetoroom0000000000000001')->>'valid')::boolean,
    TRUE,
    'record_participant_consent succeeds when document not required'
);

-- 4. Messaging blocked until verified + live
SELECT is(
    public.participant_send_message('invitetoroom0000000000000001', 'hello')->>'error',
    'NOT_VERIFIED',
    'room messaging blocked until facilitator verifies'
);

-- 5. Facilitator verifies participant
UPDATE public.participants
SET verification_status = 'verified'
WHERE invite_token = 'invitetoroom0000000000000001';

SELECT is(
    public.validate_participant_token('invitetoroom0000000000000001')->>'verification_status',
    'verified',
    'participant is verified after facilitator approval'
);

-- 6. Still blocked until session is live
SELECT is(
    public.participant_send_message('invitetoroom0000000000000001', 'hello')->>'error',
    'SESSION_NOT_LIVE',
    'room messaging blocked until facilitator opens session'
);

-- 7. Open room and advance to a posting stage
-- (sessions default to dialogue_stage 'preparation', which keeps participant posting closed).
UPDATE public.sessions
SET status = 'live',
    dialogue_stage = 'story'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT is(
    (public.participant_send_message('invitetoroom0000000000000001', 'Position ready.')->>'valid')::boolean,
    TRUE,
    'participant can send message in live verified room'
);

-- 8. List messages returns the send
SELECT ok(
    (
        SELECT jsonb_array_length(
            public.participant_list_messages('invitetoroom0000000000000001')->'messages'
        ) >= 1
    ),
    'participant_list_messages returns room messages after send'
);

SELECT * FROM finish();
ROLLBACK;
