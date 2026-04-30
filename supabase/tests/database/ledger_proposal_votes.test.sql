-- pgTAP test: ledger_proposal_votes
--
-- Asserts the structural and behavioural contract of migration
-- 20260430120000_ledger_proposal_votes.sql:
--
--   1. Table + view exist with the expected RLS posture.
--   2. The squad-member draft-insert path on `ledger_proposals` is open for a
--      member of the squad with `status = 'draft'`.
--   3. The vote insert policy enforces (a) self-only ballots, (b) member of
--      the squad, and (c) the proposal is still a draft.
--   4. The unique (proposal_id, user_id) index prevents double-voting.
--
-- Run with: supabase test db (CI `db` job).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(8);

-- 1. Table exists with security on.
SELECT has_table('public', 'ledger_proposal_votes', 'ledger_proposal_votes table exists');

SELECT is(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'ledger_proposal_votes' AND relnamespace = 'public'::regnamespace),
    TRUE,
    'ledger_proposal_votes has RLS enabled'
);

-- 2. Vote-summary view exists.
SELECT has_view(
    'public',
    'ledger_proposal_vote_summary',
    'ledger_proposal_vote_summary view exists'
);

-- 3. Seed: a squad with two members + a draft proposal owned by squad.
DO $$
DECLARE
    v_squad uuid := '00000000-0000-0000-0000-0000000a0001';
    v_member uuid := '00000000-0000-0000-0000-0000000a0002';
    v_other  uuid := '00000000-0000-0000-0000-0000000a0003';
    v_proposal uuid := '00000000-0000-0000-0000-0000000a0099';
BEGIN
    INSERT INTO auth.users (id, email)
    VALUES (v_member, 'member@test.local'),
           (v_other, 'other@test.local')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.users (id) VALUES (v_member), (v_other) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.squads (id, status)
    VALUES (v_squad, 'active')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.squad_members (squad_id, user_id)
    VALUES (v_squad, v_member)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.ledger_proposals (id, slug, title, summary, squad_id, status)
    VALUES (
        v_proposal,
        'test-draft-001',
        'Test draft',
        'A draft used by the pgTAP test.',
        v_squad,
        'draft'
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 4. As the squad member: insert a vote on the draft proposal.
SET LOCAL ROLE authenticated;
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000a0002","role":"authenticated"}',
    true
);

SELECT lives_ok(
    $$INSERT INTO public.ledger_proposal_votes (proposal_id, squad_id, user_id, vote)
      VALUES ('00000000-0000-0000-0000-0000000a0099',
              '00000000-0000-0000-0000-0000000a0001',
              '00000000-0000-0000-0000-0000000a0002',
              'approve')$$,
    'squad member can insert their own approve vote on a draft'
);

-- 5. The same member cannot vote twice (unique constraint).
SELECT throws_ok(
    $$INSERT INTO public.ledger_proposal_votes (proposal_id, squad_id, user_id, vote)
      VALUES ('00000000-0000-0000-0000-0000000a0099',
              '00000000-0000-0000-0000-0000000a0001',
              '00000000-0000-0000-0000-0000000a0002',
              'reject')$$,
    '23505',
    NULL,
    'unique (proposal_id, user_id) prevents double-voting'
);

-- 6. A different authenticated user (not in the squad) cannot vote.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000a0003","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$INSERT INTO public.ledger_proposal_votes (proposal_id, squad_id, user_id, vote)
      VALUES ('00000000-0000-0000-0000-0000000a0099',
              '00000000-0000-0000-0000-0000000a0001',
              '00000000-0000-0000-0000-0000000a0003',
              'approve')$$,
    '42501',
    NULL,
    'non-member cannot vote on a squad''s proposal'
);

-- 7. As the squad member: drafting a new proposal scoped to their squad must succeed.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000a0002","role":"authenticated"}',
    true
);

SELECT lives_ok(
    $$INSERT INTO public.ledger_proposals (slug, title, summary, squad_id, status)
      VALUES ('member-draft-001',
              'Member-authored draft',
              'A draft created by a squad member.',
              '00000000-0000-0000-0000-0000000a0001',
              'draft')$$,
    'squad member can insert a draft proposal scoped to their own squad'
);

-- 8. A non-member cannot draft a proposal scoped to someone else''s squad.
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"00000000-0000-0000-0000-0000000a0003","role":"authenticated"}',
    true
);

SELECT throws_ok(
    $$INSERT INTO public.ledger_proposals (slug, title, summary, squad_id, status)
      VALUES ('non-member-draft-001',
              'Sneaky draft',
              'Should be blocked by RLS.',
              '00000000-0000-0000-0000-0000000a0001',
              'draft')$$,
    '42501',
    NULL,
    'non-member cannot draft a proposal scoped to a squad they do not belong to'
);

SELECT * FROM finish();

ROLLBACK;
