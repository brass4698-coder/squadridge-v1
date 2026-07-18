-- v2 session audit trail + workflow notifications (P1 #4, #5)

-- ─────────────────────────────────────────────
-- session_audit_events (append-only metadata)
-- ─────────────────────────────────────────────

create table if not exists public.session_audit_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  event_type text not null,
  actor_role text,
  actor_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint session_audit_events_type_check check (
    event_type in (
      'verification_submitted',
      'participant_verified',
      'participant_denied',
      'room_opened',
      'room_entered',
      'prompt_posted',
      'approval_given',
      'record_released'
    )
  )
);

comment on table public.session_audit_events is
  'Append-only v2 session lifecycle metadata. No message bodies.';

create index if not exists session_audit_events_session_created_idx
  on public.session_audit_events (session_id, created_at asc);

alter table public.session_audit_events enable row level security;

create policy "Session_audit_select_facilitator"
  on public.session_audit_events for select to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_audit_events.session_id
        and s.facilitator_id = auth.uid()
    )
  );

create policy "Session_audit_select_super_admin"
  on public.session_audit_events for select to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_key = 'super_admin'
    )
  );

revoke insert, update, delete on public.session_audit_events from authenticated;
grant select on public.session_audit_events to authenticated;
grant all on public.session_audit_events to service_role;

-- ─────────────────────────────────────────────
-- workflow_notifications (in-app facilitator alerts)
-- ─────────────────────────────────────────────

create table if not exists public.workflow_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.workflow_notifications is
  'In-app workflow alerts for facilitators. Email delivery is a future enhancement.';

create index if not exists workflow_notifications_user_unread_idx
  on public.workflow_notifications (user_id, created_at desc)
  where read_at is null;

alter table public.workflow_notifications enable row level security;

create policy "Workflow_notif_select_self"
  on public.workflow_notifications for select to authenticated
  using (user_id = auth.uid());

create policy "Workflow_notif_update_self"
  on public.workflow_notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke insert, delete on public.workflow_notifications from authenticated;
grant select, update on public.workflow_notifications to authenticated;
grant all on public.workflow_notifications to service_role;

-- ─────────────────────────────────────────────
-- Internal helpers (security definer)
-- ─────────────────────────────────────────────

create or replace function public._log_session_audit_event_internal(
  p_session_id uuid,
  p_event_type text,
  p_actor_role text default null,
  p_actor_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.session_audit_events (
    session_id,
    event_type,
    actor_role,
    actor_id,
    metadata
  ) values (
    p_session_id,
    p_event_type,
    p_actor_role,
    p_actor_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public._log_session_audit_event_internal(uuid, text, text, uuid, jsonb) from public;

create or replace function public.log_session_audit_event(
  p_session_id uuid,
  p_event_type text,
  p_actor_role text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facilitator_id uuid;
begin
  select facilitator_id into v_facilitator_id
  from public.sessions
  where id = p_session_id;

  if v_facilitator_id is distinct from auth.uid()
     and not exists (
       select 1 from public.user_roles ur
       where ur.user_id = auth.uid() and ur.role_key = 'super_admin'
     ) then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  perform public._log_session_audit_event_internal(
    p_session_id,
    p_event_type,
    p_actor_role,
    auth.uid(),
    p_metadata
  );
end;
$$;

revoke all on function public.log_session_audit_event(uuid, text, text, jsonb) from public;
grant execute on function public.log_session_audit_event(uuid, text, text, jsonb) to authenticated, service_role;

create or replace function public.notify_facilitator_workflow(
  p_session_id uuid,
  p_event_type text,
  p_title text,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_facilitator_id uuid;
  v_prefs public.user_notification_prefs%rowtype;
begin
  select facilitator_id into v_facilitator_id
  from public.sessions
  where id = p_session_id;

  if v_facilitator_id is null then
    return;
  end if;

  if auth.uid() is not null and auth.uid() is distinct from v_facilitator_id then
    return;
  end if;

  select * into v_prefs
  from public.user_notification_prefs
  where user_id = v_facilitator_id;

  if found and v_prefs.in_app_session_alerts = false then
    return;
  end if;

  insert into public.workflow_notifications (user_id, session_id, event_type, title, body)
  values (v_facilitator_id, p_session_id, p_event_type, p_title, p_body);
end;
$$;

revoke all on function public.notify_facilitator_workflow(uuid, text, text, text) from public;
grant execute on function public.notify_facilitator_workflow(uuid, text, text, text) to authenticated, service_role;

alter publication supabase_realtime add table public.workflow_notifications;

-- ─────────────────────────────────────────────
-- Facilitator RPC: verify participant + audit
-- ─────────────────────────────────────────────

create or replace function public.facilitator_set_participant_verification(
  p_participant_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
begin
  if p_status not in ('pending', 'verified', 'denied') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  end if;

  select * into v_participant from public.participants where id = p_participant_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if not exists (
    select 1 from public.sessions s
    where s.id = v_participant.session_id and s.facilitator_id = auth.uid()
  ) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  update public.participants
  set verification_status = p_status,
      admitted_at = case when p_status = 'verified' then now() else admitted_at end,
      updated_at = now()
  where id = p_participant_id;

  if p_status = 'verified' then
    perform public._log_session_audit_event_internal(
      v_participant.session_id,
      'participant_verified',
      'facilitator',
      auth.uid(),
      jsonb_build_object('participant_id', p_participant_id, 'codename', v_participant.codename)
    );
  elsif p_status = 'denied' then
    perform public._log_session_audit_event_internal(
      v_participant.session_id,
      'participant_denied',
      'facilitator',
      auth.uid(),
      jsonb_build_object('participant_id', p_participant_id, 'codename', v_participant.codename)
    );
  end if;

  return jsonb_build_object('ok', true, 'participant_id', p_participant_id, 'status', p_status);
end;
$$;

revoke all on function public.facilitator_set_participant_verification(uuid, text) from public;
grant execute on function public.facilitator_set_participant_verification(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- Patch transition_session_status: audit + notify on room open
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
  v_title text;
begin
  if p_status not in ('setup', 'open', 'live', 'paused', 'ended') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  end if;

  select * into v_session from public.sessions where id = p_session_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  v_title := coalesce(v_session.title, 'Session');

  begin
    update public.sessions
    set status = p_status,
        updated_at = now()
    where id = p_session_id;
  exception
    when sqlstate 'P0001' then
      return jsonb_build_object('ok', false, 'error', sqlerrm);
  end;

  if p_status in ('live', 'open') then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'room_opened',
      'facilitator',
      auth.uid(),
      jsonb_build_object('status', p_status)
    );
    perform public.notify_facilitator_workflow(
      p_session_id,
      'room_opened',
      'Session room opened',
      v_title || ' is now open for verified participants.'
    );
  end if;

  return jsonb_build_object('ok', true, 'session_id', p_session_id, 'status', p_status);
end;
$$;

-- ─────────────────────────────────────────────
-- Patch release_outcome: audit + notify
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

  perform public._log_session_audit_event_internal(
    v_outcome.session_id,
    'record_released',
    'facilitator',
    auth.uid(),
    jsonb_build_object('outcome_id', p_outcome_id, 'ledger_sha', v_sha)
  );

  perform public.notify_facilitator_workflow(
    v_outcome.session_id,
    'record_released',
    'Record released',
    coalesce(v_session.title, 'Session') || ' outcome is now on the public ledger.'
  );

  return jsonb_build_object(
    'ok', true,
    'ledger_sha', v_sha,
    'outcome_id', p_outcome_id,
    'session_id', v_outcome.session_id
  );
end;
$$;

-- ─────────────────────────────────────────────
-- Export audit trail for diligence
-- ─────────────────────────────────────────────

create or replace function public.export_session_audit_trail(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_events jsonb;
begin
  select * into v_session from public.sessions where id = p_session_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if v_session.facilitator_id is distinct from auth.uid()
     and not exists (
       select 1 from public.user_roles ur
       where ur.user_id = auth.uid() and ur.role_key = 'super_admin'
     ) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'event_type', e.event_type,
      'actor_role', e.actor_role,
      'metadata', e.metadata,
      'created_at', e.created_at
    ) order by e.created_at asc
  ), '[]'::jsonb)
  into v_events
  from public.session_audit_events e
  where e.session_id = p_session_id;

  return jsonb_build_object(
    'ok', true,
    'session_id', p_session_id,
    'session_title', v_session.title,
    'events', v_events
  );
end;
$$;

revoke all on function public.export_session_audit_trail(uuid) from public;
grant execute on function public.export_session_audit_trail(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- Participant RPC patches: verification + room entry audit
-- ─────────────────────────────────────────────

create or replace function public.participant_mark_document_submitted(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
begin
  select * into v_participant
  from public.participants
  where invite_token = trim(p_token);

  if not found then
    return jsonb_build_object('valid', false, 'error', 'NOT_FOUND');
  end if;

  if v_participant.invite_expires_at is not null
     and v_participant.invite_expires_at < now() then
    return jsonb_build_object('valid', false, 'error', 'EXPIRED');
  end if;

  update public.participants
  set document_submitted = true,
      updated_at = now()
  where id = v_participant.id;

  perform public._log_session_audit_event_internal(
    v_participant.session_id,
    'verification_submitted',
    'participant',
    null,
    jsonb_build_object('participant_id', v_participant.id, 'codename', v_participant.codename)
  );

  perform public.notify_facilitator_workflow(
    v_participant.session_id,
    'verification_submitted',
    'Verification submitted',
    coalesce(v_participant.codename, 'A participant') || ' submitted materials for review.'
  );

  return public.validate_participant_token(p_token);
end;
$$;

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
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('valid', false, 'error', 'NOT_VERIFIED');
  end if;

  if (v_ctx->>'session_status') not in ('live', 'open', 'paused') then
    return jsonb_build_object('valid', false, 'error', 'SESSION_NOT_LIVE');
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
