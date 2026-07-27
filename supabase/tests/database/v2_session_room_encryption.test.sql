-- pgTAP: v2 session room encryption (keys + ciphertext gate)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(6);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'authenticated',
    'authenticated',
    'room-crypto@example.test',
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
    dialogue_stage
)
VALUES (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'Room encryption test',
    'Community & civic',
    'English',
    2,
    'live',
    false,
    'story'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (
    id,
    session_id,
    codename,
    invite_token,
    verification_status,
    document_submitted,
    consented_at,
    invite_expires_at
)
VALUES (
    'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    'Participant A',
    'roomcryptok00000000000000001',
    'verified',
    true,
    now(),
    now() + interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

SELECT ok(
    exists (
        select 1 from public.session_room_keys
        where session_id = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
    ),
    'session insert creates session_room_keys row'
);

SELECT ok(
    public.is_aes_gcm_v3_payload(
        '{"v":3,"alg":"AES-256-GCM","iv":"YWFhYWFhYWFhYWFh","ct":"YmJiYmJiYmJiYmJiYmJiYg"}'
    ),
    'is_aes_gcm_v3_payload accepts well-formed envelope'
);

SELECT ok(
    not public.is_aes_gcm_v3_payload('hello plaintext'),
    'is_aes_gcm_v3_payload rejects plaintext'
);

SELECT is(
    public.participant_send_message('roomcryptok00000000000000001', 'plaintext leak')->>'error',
    'CIPHERTEXT_REQUIRED',
    'participant_send_message requires ciphertext'
);

SELECT ok(
    (public.participant_get_room_key('roomcryptok00000000000000001')->>'valid')::boolean,
    'participant_get_room_key returns key for admitted participant'
);

SELECT throws_ok(
    $$INSERT INTO public.session_messages (session_id, sender_label, sender_role, body)
      VALUES (
        'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
        'Facilitator',
        'facilitator',
        'raw plaintext should fail'
      )$$,
    '23514',
    NULL,
    'direct insert of plaintext raises SESSION_MESSAGE_CIPHERTEXT_REQUIRED'
);

SELECT * FROM finish();
ROLLBACK;
