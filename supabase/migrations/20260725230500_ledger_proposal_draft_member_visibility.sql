-- Squad members could never actually vote on their own squad's draft proposal.
--
-- `Ledger_votes_insert_self_member` (20260430120000) checks
--   EXISTS (select 1 from public.ledger_proposals p where p.id = proposal_id
--           and p.squad_id = ... and p.status = 'draft')
-- and that subquery is evaluated under the caller's RLS. The only SELECT policy on
-- public.ledger_proposals is `ledger_proposals_select_published`, so a draft row is
-- invisible to the member, the EXISTS is false, and every ballot fails with 42501.
--
-- Fix the visibility gap rather than the vote policy: a member of the owning squad is
-- exactly who is supposed to read and vote on that squad's draft. Published proposals
-- stay world-readable; non-draft, non-published states (e.g. withdrawn) stay hidden.

drop policy if exists "ledger_proposals_select_member_draft" on public.ledger_proposals;

create policy "ledger_proposals_select_member_draft" on public.ledger_proposals for
select to authenticated
    using (
        status = 'draft'
        and squad_id is not null
        and public.auth_user_is_squad_member (squad_id)
    );

comment on policy "ledger_proposals_select_member_draft" on public.ledger_proposals is
  'Squad members can read their own squad''s draft proposals. Required for the vote insert policy''s draft check to resolve; published rows remain covered by ledger_proposals_select_published.';
