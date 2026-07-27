-- pgTAP: release provenance binding — approvals and attestation follow the instrument text.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(12);

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'authenticated',
    'authenticated',
    'fac-provenance@example.test',
    '',
    now(),
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sessions (
    id, facilitator_id, title, conflict_type, language, max_participants, status, outcome_public
)
VALUES (
    'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'Provenance binding',
    'Community & civic',
    'English',
    2,
    'ended',
    false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.outcome_records (id, session_id, status, summary, agreed_terms)
VALUES (
    'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
    'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
    'pending_approval',
    'Facilitator-authored decision memo for the provenance test.',
    'Agreed: reconvene in ninety days.'
)
ON CONFLICT (id) DO NOTHING;

-- 1-3. Provenance surface exists
SELECT has_function(
    'public',
    'outcome_content_sha',
    ARRAY['outcome_records'],
    'outcome_content_sha(outcome_records) exists'
);

SELECT has_function(
    'public',
    'facilitator_attest_outcome_authorship',
    ARRAY['uuid', 'text'],
    'facilitator_attest_outcome_authorship(uuid, text) exists'
);

SELECT has_function(
    'public',
    'facilitator_get_release_readiness',
    ARRAY['uuid'],
    'facilitator_get_release_readiness(uuid) exists'
);

-- 4. Approving stamps the reviewed content hash
INSERT INTO public.outcome_approvals (outcome_id, approver_label, status)
VALUES ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Facilitator', 'approved');

SELECT is(
    (
      SELECT a.reviewed_content_sha
      FROM public.outcome_approvals a
      WHERE a.outcome_id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'
      LIMIT 1
    ),
    (
      SELECT public.outcome_content_sha(o)
      FROM public.outcome_records o
      WHERE o.id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'
    ),
    'approval is stamped with the hash of the text it approved'
);

-- 5. Attestation is recorded against the current text
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1","role":"authenticated"}',
    true
);

SELECT is(
    (public.facilitator_attest_outcome_authorship(
        'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
        'Authored by the facilitator for pgTAP.'
    )->>'ok')::boolean,
    TRUE,
    'facilitator can attest authorship of the current instrument'
);

-- 6-7. Revising the text resets approvals and clears the attestation
RESET ROLE;
UPDATE public.outcome_records
SET summary = 'Revised decision memo after the approval round.'
WHERE id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';

SELECT is(
    (
      SELECT count(*)::int
      FROM public.outcome_approvals
      WHERE outcome_id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'
        AND status = 'approved'
    ),
    0,
    'editing the instrument resets prior approvals to pending'
);

SELECT ok(
    (
      SELECT authorship_attested_at IS NULL AND attested_content_sha IS NULL
      FROM public.outcome_records
      WHERE id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'
    ),
    'editing the instrument clears the authorship attestation'
);

-- 8. Release is blocked while attestation is missing
UPDATE public.outcome_approvals
SET status = 'approved'
WHERE outcome_id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1","role":"authenticated"}',
    true
);

SELECT is(
    public.release_outcome('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid)->>'error',
    'AUTHORSHIP_ATTESTATION_REQUIRED',
    'release refuses an instrument with no authorship attestation'
);

-- 9. Release is blocked when an approval is bound to different text
SELECT is(
    (public.facilitator_attest_outcome_authorship(
        'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,
        'Authored by the facilitator for pgTAP.'
    )->>'ok')::boolean,
    TRUE,
    're-attestation succeeds after revision'
);

RESET ROLE;
UPDATE public.outcome_approvals
SET reviewed_content_sha = repeat('0', 64)
WHERE outcome_id = 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';

SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1","role":"authenticated"}',
    true
);

SELECT is(
    public.release_outcome('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid)->>'error',
    'CONTENT_CHANGED_AFTER_APPROVAL',
    'release refuses when an approval hash does not match the release hash'
);

-- 10-11. Facilitator-only columns are not readable through the API roles
RESET ROLE;

SELECT ok(
    NOT has_column_privilege('anon', 'public.outcome_records', 'facilitator_notes', 'SELECT'),
    'anon cannot select facilitator_notes'
);

SELECT ok(
    NOT has_column_privilege('authenticated', 'public.outcome_records', 'facilitator_notes', 'SELECT'),
    'authenticated cannot select facilitator_notes'
);

SELECT * FROM finish();

ROLLBACK;
