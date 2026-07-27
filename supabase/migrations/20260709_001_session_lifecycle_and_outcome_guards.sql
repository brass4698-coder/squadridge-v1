-- Session lifecycle guards, participant invite expiry, outcome verbatim rejection

-- Participant invite expiry (default 72h)
alter table public.participants
  add column if not exists invite_expires_at timestamptz not null default (now() + interval '72 hours');

comment on column public.participants.invite_expires_at is
  'Invite link expiry; validated by validate_participant_token.';

-- ─────────────────────────────────────────────
-- Participant token validation (expiry + declined)
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
    'session_title', v_session.title,
    'session_status', v_session.status,
    'session_language', v_session.language
  );
end;
$$;

-- ─────────────────────────────────────────────
-- Session status transition guard (trigger)
-- ─────────────────────────────────────────────

create or replace function public.guard_sessions_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_unverified int;
  v_participant_count int;
begin
  if TG_OP = 'UPDATE' and NEW.status is distinct from OLD.status then
    -- released only via release_outcome (sets app.allow_session_release)
    if NEW.status = 'released'
       and coalesce(current_setting('app.allow_session_release', true), '') <> 'true' then
      raise exception 'INVALID_TRANSITION'
        using errcode = 'P0001', message = 'released status requires release_outcome RPC';
    end if;

    -- Facilitate: live/open requires all participants verified
    if NEW.status in ('live', 'open') then
      select count(*), count(*) filter (where verification_status <> 'verified')
      into v_participant_count, v_unverified
      from public.participants
      where session_id = NEW.id;

      if v_participant_count = 0 then
        raise exception 'NO_PARTICIPANTS'
          using errcode = 'P0001', message = 'at least one participant required before opening room';
      end if;

      if v_unverified > 0 then
        raise exception 'PARTICIPANTS_NOT_VERIFIED'
          using errcode = 'P0001', message = 'all participants must be verified before facilitating';
      end if;

      if OLD.status not in ('setup', 'paused', 'open', 'live') then
        raise exception 'INVALID_TRANSITION'
          using errcode = 'P0001', message = 'cannot open room from current status';
      end if;
    end if;

    -- End session only after facilitation started
    if NEW.status = 'ended' and OLD.status not in ('live', 'paused', 'open') then
      raise exception 'INVALID_TRANSITION'
        using errcode = 'P0001', message = 'session must be live or paused before ending';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists guard_sessions_status_transition on public.sessions;
create trigger guard_sessions_status_transition
  before update of status on public.sessions
  for each row
  execute function public.guard_sessions_status_transition();

-- ─────────────────────────────────────────────
-- Facilitator RPC for status transitions (structured errors)
-- ─────────────────────────────────────────────

create or replace function public.transition_session_status(
  p_session_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
begin
  if p_status not in ('setup', 'open', 'live', 'paused', 'ended') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
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

  begin
    update public.sessions
    set status = p_status,
        updated_at = now()
    where id = p_session_id;
  exception
    when sqlstate 'P0001' then
      return jsonb_build_object(
        'ok', false,
        'error', sqlerrm
      );
  end;

  return jsonb_build_object('ok', true, 'session_id', p_session_id, 'status', p_status);
end;
$$;

revoke all on function public.transition_session_status(uuid, text) from public;
grant execute on function public.transition_session_status(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- Outcome verbatim room-content guard
-- ─────────────────────────────────────────────

create or replace function public.outcome_contains_verbatim_room_content(p_outcome_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return false;
  end if;

  return exists (
    select 1
    from public.session_messages m
    where m.session_id = v_outcome.session_id
      and length(trim(m.body)) >= 20
      and (
        position(lower(trim(m.body)) in lower(coalesce(v_outcome.summary, ''))) > 0
        or position(lower(trim(m.body)) in lower(coalesce(v_outcome.agreed_terms, ''))) > 0
        or position(lower(trim(m.body)) in lower(coalesce(v_outcome.pending_items, ''))) > 0
      )
  );
end;
$$;

revoke all on function public.outcome_contains_verbatim_room_content(uuid) from public;
grant execute on function public.outcome_contains_verbatim_room_content(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- release_outcome: approvals + verbatim guard
-- ─────────────────────────────────────────────

create or replace function public.release_outcome(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_pending int;
  v_sha text;
  v_payload text;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_session.status <> 'ended' then
    return jsonb_build_object('ok', false, 'error', 'SESSION_NOT_ENDED');
  end if;

  select count(*) into v_pending
  from public.outcome_approvals
  where outcome_id = p_outcome_id and status <> 'approved';

  if v_pending > 0 then
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_PENDING');
  end if;

  if public.outcome_contains_verbatim_room_content(p_outcome_id) then
    return jsonb_build_object('ok', false, 'error', 'VERBATIM_ROOM_CONTENT');
  end if;

  v_payload := jsonb_build_object(
    'session_id', v_outcome.session_id,
    'summary', v_outcome.summary,
    'agreed_terms', v_outcome.agreed_terms,
    'pending_items', v_outcome.pending_items,
    'published_at', now()
  )::text;

  v_sha := encode(digest(v_payload, 'sha256'), 'hex');

  update public.outcome_records
  set status = 'published',
      published_at = now(),
      ledger_sha = v_sha,
      updated_at = now()
  where id = p_outcome_id;

  perform set_config('app.allow_session_release', 'true', true);

  update public.sessions
  set status = 'released',
      updated_at = now()
  where id = v_outcome.session_id;

  return jsonb_build_object(
    'ok', true,
    'ledger_sha', v_sha,
    'outcome_id', p_outcome_id,
    'session_id', v_outcome.session_id
  );
end;
$$;
