-- Phase 0 institutional spine: FSM harden, private vs public ledger RLS,
-- content-only ledger_sha, verify_outcome_anchor, honest private-release notify.
-- Append-only; does not edit prior migrations.

-- ─────────────────────────────────────────────
-- 1) Expand audit event allowlist
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
      'record_released',
      'release_failed'
    )
  );

-- ─────────────────────────────────────────────
-- 2) Harden session status transitions
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
    -- Terminal: released only via release_outcome
    if NEW.status = 'released'
       and coalesce(current_setting('app.allow_session_release', true), '') <> 'true' then
      raise exception 'INVALID_TRANSITION'
        using errcode = 'P0001', message = 'released status requires release_outcome RPC';
    end if;

    -- No reopen / rewind after ended or released (break-glass is a future RPC)
    if OLD.status in ('ended', 'released')
       and NEW.status in ('setup', 'open', 'live', 'paused') then
      raise exception 'INVALID_TRANSITION'
        using errcode = 'P0001',
              message = 'cannot reopen or rewind a session after it has ended or been released';
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

    -- Pause only from active room
    if NEW.status = 'paused' and OLD.status not in ('live', 'open', 'paused') then
      raise exception 'INVALID_TRANSITION'
        using errcode = 'P0001', message = 'session must be live before pausing';
    end if;
  end if;

  return NEW;
end;
$$;

-- Prefer writing `live` for new opens; still accept `open` for compatibility
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
  v_status text := p_status;
begin
  if v_status = 'open' then
    v_status := 'live';
  end if;

  if v_status not in ('setup', 'live', 'paused', 'ended') then
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

  if v_session.status in ('ended', 'released') and v_status <> v_session.status then
    return jsonb_build_object('ok', false, 'error', 'INVALID_TRANSITION');
  end if;

  begin
    update public.sessions
    set status = v_status,
        updated_at = now()
    where id = p_session_id;
  exception
    when sqlstate 'P0001' then
      return jsonb_build_object('ok', false, 'error', sqlerrm);
  end;

  if v_status = 'live' then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'room_opened',
      'facilitator',
      auth.uid(),
      jsonb_build_object('status', v_status)
    );
    perform public.notify_facilitator_workflow(
      p_session_id,
      'room_opened',
      'Room opened',
      coalesce(v_session.title, 'Session') || ' is live for verified participants.'
    );
  elsif v_status = 'paused' then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'room_paused',
      'facilitator',
      auth.uid(),
      '{}'::jsonb
    );
  elsif v_status = 'ended' then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'room_ended',
      'facilitator',
      auth.uid(),
      '{}'::jsonb
    );
  end if;

  return jsonb_build_object('ok', true, 'session_id', p_session_id, 'status', v_status);
end;
$$;

revoke all on function public.transition_session_status(uuid, text) from public;
grant execute on function public.transition_session_status(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- 3) Public ledger RLS: only outcome_public sessions
-- ─────────────────────────────────────────────

drop policy if exists "Public can read published outcomes" on public.outcome_records;

create policy "Public can read published public outcomes"
  on public.outcome_records for select
  using (
    status = 'published'
    and exists (
      select 1
      from public.sessions s
      where s.id = outcome_records.session_id
        and s.outcome_public = true
        and s.status = 'released'
    )
  );

-- ─────────────────────────────────────────────
-- 4) Canonical content-only anchor + release honesty
-- ─────────────────────────────────────────────

create or replace function public.outcome_anchor_payload(p_outcome public.outcome_records)
returns text
language sql
immutable
as $$
  select jsonb_build_object(
    'v', 1,
    'session_id', p_outcome.session_id,
    'summary', coalesce(p_outcome.summary, ''),
    'agreed_terms', coalesce(p_outcome.agreed_terms, ''),
    'pending_items', coalesce(p_outcome.pending_items, '')
  )::text;
$$;

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
  v_approval_count int;
  v_sha text;
  v_payload text;
  v_notify_body text;
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
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'SESSION_NOT_ENDED')
    );
    return jsonb_build_object('ok', false, 'error', 'SESSION_NOT_ENDED');
  end if;

  if length(trim(coalesce(v_outcome.summary, ''))) < 8 then
    return jsonb_build_object('ok', false, 'error', 'SUMMARY_REQUIRED');
  end if;

  select count(*), count(*) filter (where status <> 'approved')
  into v_approval_count, v_pending
  from public.outcome_approvals
  where outcome_id = p_outcome_id;

  if v_approval_count = 0 then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'APPROVALS_REQUIRED')
    );
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_REQUIRED');
  end if;

  if v_pending > 0 then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'APPROVALS_PENDING')
    );
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_PENDING');
  end if;

  if public.outcome_contains_verbatim_room_content(p_outcome_id) then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'VERBATIM_ROOM_CONTENT')
    );
    return jsonb_build_object('ok', false, 'error', 'VERBATIM_ROOM_CONTENT');
  end if;

  v_payload := public.outcome_anchor_payload(v_outcome);
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

  perform public._log_session_audit_event_internal(
    v_outcome.session_id,
    'record_released',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'outcome_id', p_outcome_id,
      'ledger_sha', v_sha,
      'outcome_public', v_session.outcome_public
    )
  );

  if v_session.outcome_public then
    v_notify_body := coalesce(v_session.title, 'Session')
      || ' outcome is on the public ledger with a verification anchor.';
  else
    v_notify_body := coalesce(v_session.title, 'Session')
      || ' private anchored record was released (not listed on the public ledger).';
  end if;

  perform public.notify_facilitator_workflow(
    v_outcome.session_id,
    'record_released',
    'Record released',
    v_notify_body
  );

  return jsonb_build_object(
    'ok', true,
    'ledger_sha', v_sha,
    'outcome_id', p_outcome_id,
    'session_id', v_outcome.session_id,
    'outcome_public', v_session.outcome_public
  );
end;
$$;

revoke all on function public.release_outcome(uuid) from public;
grant execute on function public.release_outcome(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 5) Public / facilitator anchor verification
-- ─────────────────────────────────────────────

create or replace function public.verify_outcome_anchor(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_expected text;
  v_can_read boolean := false;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;

  if v_outcome.status = 'published'
     and v_session.outcome_public = true
     and v_session.status = 'released' then
    v_can_read := true;
  elsif auth.uid() is not null
        and v_session.facilitator_id = auth.uid() then
    v_can_read := true;
  end if;

  if not v_can_read then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_outcome.ledger_sha is null then
    return jsonb_build_object('ok', false, 'error', 'NO_ANCHOR');
  end if;

  v_expected := encode(digest(public.outcome_anchor_payload(v_outcome), 'sha256'), 'hex');

  return jsonb_build_object(
    'ok', true,
    'match', v_expected = v_outcome.ledger_sha,
    'ledger_sha', v_outcome.ledger_sha,
    'recomputed_sha', v_expected,
    'outcome_public', v_session.outcome_public,
    'algorithm', 'SHA-256',
    'canonical', 'outcome_anchor_payload_v1'
  );
end;
$$;

revoke all on function public.verify_outcome_anchor(uuid) from public;
grant execute on function public.verify_outcome_anchor(uuid) to anon, authenticated;

comment on function public.verify_outcome_anchor(uuid) is
  'Recomputes content-only SHA-256 for a released outcome. Public for outcome_public records; facilitator for private.';

comment on function public.outcome_anchor_payload(public.outcome_records) is
  'Canonical v1 serialization for ledger_sha: session_id + summary + agreed_terms + pending_items. Excludes published_at.';
