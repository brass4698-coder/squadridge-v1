-- Hot-path indexes for v2 facilitator / participant flows.
-- invite_token already has a UNIQUE constraint (implicit index).
-- These support session-scoped lists and outcome joins.

create index if not exists participants_session_id_idx
  on public.participants (session_id);

create index if not exists outcome_records_session_id_idx
  on public.outcome_records (session_id);

create index if not exists outcome_approvals_outcome_id_idx
  on public.outcome_approvals (outcome_id);

create index if not exists session_messages_session_id_sent_at_idx
  on public.session_messages (session_id, sent_at desc);
