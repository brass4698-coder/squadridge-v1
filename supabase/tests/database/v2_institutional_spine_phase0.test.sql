-- pgTAP: institutional spine phase 0 — private ledger RLS, content-only anchor, FSM

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(7);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'fac-phase0@example.test',
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
    outcome_public,
    identity_verification_required
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Phase0 private release',
    'Community & civic',
    'English',
    2,
    'ended',
    false,
    false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (
    id, session_id, codename, invite_token, verification_status, invite_expires_at
)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Staff A',
    'phase0tok00000000000000001',
    'verified',
    now() + interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.outcome_records (
    id, session_id, status, summary, agreed_terms, pending_items
)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'pending_approval',
    'Decision memo: proceed with partner briefing next quarter.',
    'Agreed: internal only.',
    'Pending: funder share after legal review.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.outcome_approvals (outcome_id, approver_label, status, approved_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Facilitator', 'approved', now()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Staff A', 'approved', now());

SELECT has_function(
    'public',
    'verify_outcome_anchor',
    ARRAY['uuid'],
    'verify_outcome_anchor(uuid) exists'
);

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}',
    true
);

SELECT is(
    public.transition_session_status(
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'live'
    )->>'error',
    'INVALID_TRANSITION',
    'ended session cannot reopen to live'
);

SELECT is(
    (public.release_outcome('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)->>'ok')::boolean,
    TRUE,
    'release_outcome succeeds for private NGO session'
);

SELECT ok(
    (SELECT ledger_sha IS NOT NULL FROM public.outcome_records WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    'ledger_sha set after release'
);

SELECT is(
    (public.verify_outcome_anchor('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)->>'match')::boolean,
    TRUE,
    'verify_outcome_anchor matches content-only hash for facilitator'
);

SELECT is(
    (
      SELECT count(*)::int
      FROM public.outcome_records o
      JOIN public.sessions s ON s.id = o.session_id
      WHERE o.id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
        AND o.status = 'published'
        AND s.outcome_public = true
        AND s.status = 'released'
    ),
    0,
    'private release is not a public ledger candidate'
);

SELECT is(
    (SELECT status FROM public.sessions WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    'released',
    'session status is released after release_outcome'
);

SELECT * FROM finish();
ROLLBACK;
