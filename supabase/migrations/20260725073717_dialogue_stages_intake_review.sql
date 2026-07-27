-- Dialogue stage machine (Facilitate spine), intake brief fields, and
-- participant-token outcome review before release.
-- Extends Configure → Verify → Facilitate → Release; does not replace lifecycle status.

-- ─────────────────────────────────────────────
-- Expand audit event allowlist for stage + review
-- ─────────────────────────────────────────────

alter table public.session_audit_events
  drop constraint if exists session_audit_events_type_check;

alter table public.session_audit_events
  add constraint session_audit_events_type_check check (
    event_type in (
      'verification_submitted',
      'participant_verified',
      'participant_denied',
      'room_opened',
      'room_entered',
      'room_paused',
      'room_ended',
      'prompt_posted',
      'approval_given',
      'approval_requested',
      'approval_disputed',
      'dialogue_stage_advanced',
      'record_released',
      'release_failed'
    )
  );

-- ─────────────────────────────────────────────
-- Intake brief on sessions
-- ─────────────────────────────────────────────

alter table public.sessions
  add column if not exists issue_goal text,
  add column if not exists risk_notes text,
  add column if not exists disclosure_boundaries text;

comment on column public.sessions.issue_goal is
  'Issue brief: what a successful outcome looks like for this room.';
comment on column public.sessions.risk_notes is
  'Issue brief: known risks, tension, or escalation factors (facilitator-facing).';
comment on column public.sessions.disclosure_boundaries is
  'Issue brief: what must stay private vs what may enter an approved record.';

-- ─────────────────────────────────────────────
-- Dialogue stage (within Facilitate)
-- ─────────────────────────────────────────────

alter table public.sessions
  add column if not exists dialogue_stage text not null default 'preparation';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sessions_dialogue_stage_check'
  ) then
    alter table public.sessions
      add constraint sessions_dialogue_stage_check
      check (
        dialogue_stage in (
          'preparation',
          'opening',
          'story',
          'framing',
          'options',
          'review',
          'outcome_ready'
        )
      );
  end if;
end $$;

comment on column public.sessions.dialogue_stage is
  'Facilitator-advanced dialogue process stage inside Facilitate. Lifecycle status remains separate.';

create index if not exists sessions_dialogue_stage_idx
  on public.sessions (dialogue_stage);

-- ─────────────────────────────────────────────
-- Outcome approvals: bind to participants + dispute note
-- ─────────────────────────────────────────────

alter table public.outcome_approvals
  add column if not exists participant_id uuid references public.participants(id) on delete set null,
  add column if not exists dispute_note text,
  add column if not exists approval_source text not null default 'facilitator';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'outcome_approvals_source_check'
  ) then
    alter table public.outcome_approvals
      add constraint outcome_approvals_source_check
      check (approval_source in ('facilitator', 'participant'));
  end if;
end $$;

create unique index if not exists outcome_approvals_outcome_participant_uidx
  on public.outcome_approvals (outcome_id, participant_id)
  where participant_id is not null;

comment on column public.outcome_approvals.participant_id is
  'When set, only that participant token may approve or dispute this row.';
comment on column public.outcome_approvals.dispute_note is
  'Optional note when status = rejected (dispute before release).';
comment on column public.outcome_approvals.approval_source is
  'facilitator = console-recorded; participant = token-gated self-review.';

-- ─────────────────────────────────────────────
-- Stage helpers
-- ─────────────────────────────────────────────

create or replace function public.dialogue_stage_rank(p_stage text)
returns int
language sql
immutable
as $$
  select case p_stage
    when 'preparation' then 1
    when 'opening' then 2
    when 'story' then 3
    when 'framing' then 4
    when 'options' then 5
    when 'review' then 6
    when 'outcome_ready' then 7
    else 0
  end;
$$;

create or replace function public.dialogue_stage_allows_participant_post(p_stage text)
returns boolean
language sql
immutable
as $$
  select p_stage in ('story', 'framing', 'options', 'review');
$$;

-- ─────────────────────────────────────────────
-- Facilitator advance dialogue stage
-- ─────────────────────────────────────────────

create or replace function public.facilitator_advance_dialogue_stage(
  p_session_id uuid,
  p_stage text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_stage text := lower(trim(coalesce(p_stage, '')));
  v_from_rank int;
  v_to_rank int;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_session
  from public.sessions
  where id = p_session_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if public.dialogue_stage_rank(v_stage) = 0 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STAGE');
  end if;

  if v_session.status in ('ended', 'released')
     and v_stage is distinct from 'outcome_ready' then
    return jsonb_build_object('ok', false, 'error', 'SESSION_CLOSED');
  end if;

  v_from_rank := public.dialogue_stage_rank(v_session.dialogue_stage);
  v_to_rank := public.dialogue_stage_rank(v_stage);

  -- Allow same stage (idempotent), forward/back one step, or jump to outcome_ready when closing.
  if v_to_rank <> v_from_rank
     and abs(v_to_rank - v_from_rank) > 1
     and not (v_stage = 'outcome_ready' and v_to_rank > v_from_rank) then
    return jsonb_build_object(
      'ok', false,
      'error', 'STAGE_SKIP_BLOCKED',
      'current', v_session.dialogue_stage
    );
  end if;

  update public.sessions
  set dialogue_stage = v_stage,
      updated_at = now()
  where id = p_session_id;

  perform public._log_session_audit_event_internal(
    p_session_id,
    'dialogue_stage_advanced',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'from', v_session.dialogue_stage,
      'to', v_stage
    )
  );

  return jsonb_build_object(
    'ok', true,
    'session_id', p_session_id,
    'dialogue_stage', v_stage
  );
end;
$$;

revoke all on function public.facilitator_advance_dialogue_stage(uuid, text) from public;
grant execute on function public.facilitator_advance_dialogue_stage(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- Enrich validate_participant_token with stage + intake
-- ─────────────────────────────────────────────

create or replace function public.validate_participant_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
  v_session public.sessions%rowtype;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    return jsonb_build_object('valid', false, 'error', 'INVALID_TOKEN');
  end if;

  select * into v_participant
  from public.participants
  where invite_token = trim(p_token);

  if not found then
    return jsonb_build_object('valid', false, 'error', 'NOT_FOUND');
  end if;

  if v_participant.verification_status = 'denied' then
    return jsonb_build_object('valid', false, 'error', 'DECLINED');
  end if;

  if v_participant.invite_expires_at is not null
     and v_participant.invite_expires_at < now() then
    return jsonb_build_object('valid', false, 'error', 'EXPIRED');
  end if;

  select * into v_session
  from public.sessions
  where id = v_participant.session_id;

  return jsonb_build_object(
    'valid', true,
    'participant_id', v_participant.id,
    'session_id', v_session.id,
    'codename', v_participant.codename,
    'verification_status', v_participant.verification_status,
    'document_submitted', v_participant.document_submitted,
    'consented_at', v_participant.consented_at,
    'admitted_at', v_participant.admitted_at,
    'participation_reason', v_participant.participation_reason,
    'session_title', v_session.title,
    'session_status', v_session.status,
    'session_language', v_session.language,
    'conflict_type', v_session.conflict_type,
    'max_participants', v_session.max_participants,
    'outcome_public', v_session.outcome_public,
    'identity_verification_required', v_session.identity_verification_required,
    'dialogue_stage', coalesce(v_session.dialogue_stage, 'preparation'),
    'issue_goal', v_session.issue_goal,
    'disclosure_boundaries', v_session.disclosure_boundaries,
    'participant_posting_allowed', public.dialogue_stage_allows_participant_post(
      coalesce(v_session.dialogue_stage, 'preparation')
    )
  );
end;
$$;

-- ─────────────────────────────────────────────
-- Gate participant posting by dialogue stage
-- ─────────────────────────────────────────────

create or replace function public.participant_send_message(p_token text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_session_id uuid;
  v_codename text;
  v_msg_id uuid;
  v_first_message boolean;
  v_pacing jsonb;
  v_stage text;
begin
  v_ctx := public._participant_room_gate(p_token, true);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'session_status') = 'paused' then
    return jsonb_build_object('valid', false, 'error', 'ROOM_PAUSED');
  end if;

  select coalesce(dialogue_stage, 'preparation') into v_stage
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  if not public.dialogue_stage_allows_participant_post(v_stage) then
    return jsonb_build_object(
      'valid', false,
      'error', 'STAGE_POSTING_CLOSED',
      'dialogue_stage', v_stage
    );
  end if;

  v_pacing := public.participant_get_pacing(p_token);
  if coalesce((v_pacing->>'posting_blocked')::boolean, false) then
    if coalesce((v_pacing->>'acknowledge_required')::boolean, false) then
      return jsonb_build_object('valid', false, 'error', 'PAUSE_ACK_REQUIRED');
    end if;
    return jsonb_build_object('valid', false, 'error', 'POSTING_RESTRICTED');
  end if;

  if p_body is null or length(trim(p_body)) = 0 then
    return jsonb_build_object('valid', false, 'error', 'EMPTY_BODY');
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;
  v_codename := v_ctx->>'codename';

  select not exists (
    select 1 from public.session_messages m
    where m.session_id = v_session_id
      and m.sender_role = 'participant'
      and m.sender_label = v_codename
  ) into v_first_message;

  insert into public.session_messages (session_id, sender_label, sender_role, body)
  values (v_session_id, v_codename, 'participant', left(trim(p_body), 8000))
  returning id into v_msg_id;

  if v_first_message then
    perform public._log_session_audit_event_internal(
      v_session_id,
      'room_entered',
      'participant',
      null,
      jsonb_build_object('participant_codename', v_codename)
    );
  end if;

  return jsonb_build_object('valid', true, 'message_id', v_msg_id);
end;
$$;

-- Include dialogue_stage on pacing payload for client stage map
create or replace function public.participant_get_pacing(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_room public.session_room_pacing%rowtype;
  v_pp public.participant_pacing%rowtype;
  v_blocked boolean := false;
  v_stage text;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_room
  from public.session_room_pacing
  where session_id = (v_ctx->>'session_id')::uuid;

  select * into v_pp
  from public.participant_pacing
  where participant_id = (v_ctx->>'participant_id')::uuid;

  v_stage := coalesce(v_ctx->>'dialogue_stage', 'preparation');

  v_blocked :=
    (v_ctx->>'session_status') = 'paused'
    or (
      v_room.pacing_mode is not null
      and v_room.pacing_mode in ('paused', 'slow', 'pull_back')
      and (v_room.posting_restricted_until is null or v_room.posting_restricted_until > now())
    )
    or (
      v_pp.posting_blocked_until is not null
      and v_pp.posting_blocked_until > now()
    )
    or coalesce(v_pp.acknowledge_required, false)
    or not public.dialogue_stage_allows_participant_post(v_stage);

  return jsonb_build_object(
    'valid', true,
    'pacing_mode', coalesce(v_room.pacing_mode, 'normal'),
    'warning_level', coalesce(v_pp.warning_level, 'none'),
    'warning_message', coalesce(v_pp.warning_message, v_room.warning_message),
    'acknowledge_required', coalesce(v_pp.acknowledge_required, false),
    'posting_blocked', v_blocked,
    'posting_blocked_until', coalesce(v_pp.posting_blocked_until, v_room.posting_restricted_until),
    'session_status', v_ctx->>'session_status',
    'dialogue_stage', v_stage,
    'participant_posting_allowed', public.dialogue_stage_allows_participant_post(v_stage)
  );
end;
$$;

-- ─────────────────────────────────────────────
-- Seed participant-linked approvals when submitting for release
-- ─────────────────────────────────────────────

create or replace function public.facilitator_seed_outcome_approvals(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_inserted int := 0;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  -- Facilitator approval row (console can mark)
  insert into public.outcome_approvals (
    outcome_id, approver_label, status, approval_source, participant_id
  )
  select p_outcome_id, 'Facilitator', 'pending', 'facilitator', null
  where not exists (
    select 1 from public.outcome_approvals a
    where a.outcome_id = p_outcome_id
      and a.approval_source = 'facilitator'
      and a.participant_id is null
      and a.approver_label = 'Facilitator'
  );
  get diagnostics v_inserted = row_count;

  -- Participant-bound rows (self-review via token)
  insert into public.outcome_approvals (
    outcome_id, approver_label, status, approval_source, participant_id
  )
  select
    p_outcome_id,
    p.codename,
    'pending',
    'participant',
    p.id
  from public.participants p
  where p.session_id = v_session.id
    and p.verification_status = 'verified'
    and not exists (
      select 1 from public.outcome_approvals a
      where a.outcome_id = p_outcome_id and a.participant_id = p.id
    );

  get diagnostics v_inserted = row_count;

  update public.outcome_records
  set status = 'pending_approval',
      updated_at = now()
  where id = p_outcome_id
    and status in ('draft', 'pending_approval');

  perform public._log_session_audit_event_internal(
    v_session.id,
    'approval_requested',
    'facilitator',
    auth.uid(),
    jsonb_build_object('outcome_id', p_outcome_id)
  );

  return jsonb_build_object('ok', true, 'seeded', v_inserted);
end;
$$;

revoke all on function public.facilitator_seed_outcome_approvals(uuid) from public;
grant execute on function public.facilitator_seed_outcome_approvals(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- Participant outcome review (approve / dispute)
-- ─────────────────────────────────────────────

create or replace function public.participant_get_outcome_review(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_outcome public.outcome_records%rowtype;
  v_approval public.outcome_approvals%rowtype;
  v_session public.sessions%rowtype;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_session
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  select * into v_outcome
  from public.outcome_records
  where session_id = v_session.id
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'valid', true,
      'available', false,
      'error', 'NO_OUTCOME'
    );
  end if;

  if v_outcome.status not in ('pending_approval', 'approved', 'published') then
    return jsonb_build_object(
      'valid', true,
      'available', false,
      'outcome_status', v_outcome.status,
      'message', 'The facilitator has not opened review yet.'
    );
  end if;

  select * into v_approval
  from public.outcome_approvals
  where outcome_id = v_outcome.id
    and participant_id = (v_ctx->>'participant_id')::uuid;

  return jsonb_build_object(
    'valid', true,
    'available', true,
    'outcome_id', v_outcome.id,
    'outcome_status', v_outcome.status,
    'summary', v_outcome.summary,
    'agreed_terms', v_outcome.agreed_terms,
    'pending_items', v_outcome.pending_items,
    'outcome_public', v_session.outcome_public,
    'session_title', v_session.title,
    'approval_id', v_approval.id,
    'approval_status', coalesce(v_approval.status, 'pending'),
    'dispute_note', v_approval.dispute_note,
    'can_decide', v_outcome.status = 'pending_approval'
      and coalesce(v_approval.status, 'pending') = 'pending'
  );
end;
$$;

revoke all on function public.participant_get_outcome_review(text) from public;
grant execute on function public.participant_get_outcome_review(text) to anon, authenticated;

create or replace function public.participant_review_outcome(
  p_token text,
  p_decision text,
  p_dispute_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_decision text := lower(trim(coalesce(p_decision, '')));
  v_note text := nullif(left(trim(coalesce(p_dispute_note, '')), 800), '');
  v_outcome public.outcome_records%rowtype;
  v_approval_id uuid;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if v_decision not in ('approved', 'rejected') then
    return jsonb_build_object('valid', false, 'error', 'INVALID_DECISION');
  end if;

  if v_decision = 'rejected' and (v_note is null or length(v_note) < 8) then
    return jsonb_build_object('valid', false, 'error', 'DISPUTE_NOTE_REQUIRED');
  end if;

  select * into v_outcome
  from public.outcome_records
  where session_id = (v_ctx->>'session_id')::uuid
  order by created_at desc
  limit 1;

  if not found or v_outcome.status <> 'pending_approval' then
    return jsonb_build_object('valid', false, 'error', 'REVIEW_NOT_OPEN');
  end if;

  select id into v_approval_id
  from public.outcome_approvals
  where outcome_id = v_outcome.id
    and participant_id = (v_ctx->>'participant_id')::uuid;

  if v_approval_id is null then
    insert into public.outcome_approvals (
      outcome_id,
      approver_label,
      status,
      approval_source,
      participant_id,
      dispute_note,
      approved_at
    )
    values (
      v_outcome.id,
      v_ctx->>'codename',
      v_decision,
      'participant',
      (v_ctx->>'participant_id')::uuid,
      case when v_decision = 'rejected' then v_note else null end,
      case when v_decision = 'approved' then now() else null end
    )
    returning id into v_approval_id;
  else
    update public.outcome_approvals
    set status = v_decision,
        dispute_note = case when v_decision = 'rejected' then v_note else null end,
        approved_at = case when v_decision = 'approved' then now() else null end
    where id = v_approval_id
      and status = 'pending';

    if not found then
      return jsonb_build_object('valid', false, 'error', 'ALREADY_DECIDED');
    end if;
  end if;

  perform public._log_session_audit_event_internal(
    (v_ctx->>'session_id')::uuid,
    case when v_decision = 'approved' then 'approval_given' else 'approval_disputed' end,
    'participant',
    null,
    jsonb_build_object(
      'outcome_id', v_outcome.id,
      'approval_id', v_approval_id,
      'codename', v_ctx->>'codename'
    )
  );

  perform public.notify_facilitator_workflow(
    (v_ctx->>'session_id')::uuid,
    case when v_decision = 'approved' then 'approval_given' else 'approval_disputed' end,
    case when v_decision = 'approved' then 'Participant approved outcome' else 'Participant disputed outcome' end,
    coalesce(v_ctx->>'codename', 'A participant')
      || case when v_decision = 'approved'
           then ' approved the draft outcome.'
           else ' disputed the draft outcome.'
         end
  );

  return public.participant_get_outcome_review(p_token);
end;
$$;

revoke all on function public.participant_review_outcome(text, text, text) from public;
grant execute on function public.participant_review_outcome(text, text, text) to anon, authenticated;

-- Facilitator may only console-approve facilitator-source rows (not participant-bound)
create or replace function public.facilitator_set_approval_status(
  p_approval_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_approval public.outcome_approvals%rowtype;
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_status text := lower(trim(coalesce(p_status, '')));
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  if v_status not in ('pending', 'approved', 'rejected') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  end if;

  select * into v_approval from public.outcome_approvals where id = p_approval_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_outcome from public.outcome_records where id = v_approval.outcome_id;
  select * into v_session from public.sessions where id = v_outcome.session_id;

  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_approval.participant_id is not null
     or v_approval.approval_source = 'participant' then
    return jsonb_build_object(
      'ok', false,
      'error', 'PARTICIPANT_MUST_SELF_REVIEW',
      'message', 'Participants must approve or dispute via their review link.'
    );
  end if;

  update public.outcome_approvals
  set status = v_status,
      approved_at = case when v_status = 'approved' then now() else null end,
      dispute_note = case when v_status = 'rejected' then dispute_note else null end
  where id = p_approval_id;

  perform public._log_session_audit_event_internal(
    v_session.id,
    'approval_given',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'approval_id', p_approval_id,
      'status', v_status,
      'approver_label', v_approval.approver_label
    )
  );

  return jsonb_build_object('ok', true, 'status', v_status);
end;
$$;

revoke all on function public.facilitator_set_approval_status(uuid, text) from public;
grant execute on function public.facilitator_set_approval_status(uuid, text) to authenticated;
