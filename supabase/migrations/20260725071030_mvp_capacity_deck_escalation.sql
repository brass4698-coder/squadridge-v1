-- MVP excellence: room capacity ≤12, participation reason, deck access grants,
-- and facilitator-led pacing / de-escalation consequences for v2 sessions.

-- ─────────────────────────────────────────────
-- Room capacity (hard ceiling: 12)
-- ─────────────────────────────────────────────

alter table public.sessions
  drop constraint if exists sessions_max_participants_range;

alter table public.sessions
  add constraint sessions_max_participants_range
  check (max_participants >= 2 and max_participants <= 12);

update public.sessions
set max_participants = 12
where max_participants > 12;

create or replace function public.enforce_session_participant_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max int;
  v_count int;
begin
  select max_participants into v_max
  from public.sessions
  where id = new.session_id;

  if v_max is null then
    raise exception 'SESSION_NOT_FOUND';
  end if;

  select count(*)::int into v_count
  from public.participants
  where session_id = new.session_id
    and (tg_op = 'INSERT' or id <> new.id);

  if v_count >= v_max then
    raise exception 'ROOM_FULL: this room is limited to % participants.', v_max;
  end if;

  if v_count >= 12 then
    raise exception 'ROOM_FULL: rooms cannot exceed 12 participants.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_participants_capacity on public.participants;
create trigger trg_participants_capacity
  before insert on public.participants
  for each row execute function public.enforce_session_participant_capacity();

-- ─────────────────────────────────────────────
-- Participation reason (invite + matter context)
-- ─────────────────────────────────────────────

alter table public.participants
  add column if not exists participation_reason text;

comment on column public.participants.participation_reason is
  'Short statement of why the person is in this room / relationship to the matter.';

-- ─────────────────────────────────────────────
-- Deck access (invite-only briefings)
-- ─────────────────────────────────────────────

create table if not exists public.deck_access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references public.profiles(id) on delete set null,
  invite_token text unique not null,
  audience_scopes text[] not null default array['investors']::text[],
  label text,
  issued_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint deck_access_grants_audience_nonempty check (cardinality(audience_scopes) > 0)
);

create index if not exists deck_access_grants_user_id_idx
  on public.deck_access_grants (user_id)
  where revoked_at is null;

create index if not exists deck_access_grants_email_idx
  on public.deck_access_grants (lower(email))
  where revoked_at is null;

alter table public.deck_access_grants enable row level security;

drop policy if exists deck_access_grants_select_own on public.deck_access_grants;
create policy deck_access_grants_select_own
  on public.deck_access_grants for select
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce((select email from public.profiles where id = auth.uid()), ''))
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );

drop policy if exists deck_access_grants_admin_all on public.deck_access_grants;
create policy deck_access_grants_admin_all
  on public.deck_access_grants for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );

create or replace function public.has_deck_access()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key = 'super_admin'
  ) then
    return true;
  end if;

  return exists (
    select 1
    from public.deck_access_grants g
    where g.revoked_at is null
      and g.expires_at > now()
      and (
        g.user_id = auth.uid()
        or (
          g.redeemed_at is not null
          and lower(g.email) = lower(coalesce((select email from public.profiles where id = auth.uid()), ''))
        )
      )
  );
end;
$$;

revoke all on function public.has_deck_access() from public;
grant execute on function public.has_deck_access() to authenticated;

create or replace function public.issue_deck_invite(
  p_email text,
  p_audience_scopes text[] default array['investors']::text[],
  p_label text default null,
  p_expires_hours int default 168
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_id uuid;
  v_email text := lower(trim(p_email));
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role_key = 'super_admin'
  ) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_email is null or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_EMAIL');
  end if;

  if p_audience_scopes is null or cardinality(p_audience_scopes) = 0 then
    return jsonb_build_object('ok', false, 'error', 'SCOPES_REQUIRED');
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');

  insert into public.deck_access_grants (
    email,
    invite_token,
    audience_scopes,
    label,
    issued_by,
    expires_at
  )
  values (
    v_email,
    v_token,
    p_audience_scopes,
    nullif(left(trim(coalesce(p_label, '')), 120), ''),
    auth.uid(),
    now() + make_interval(hours => greatest(coalesce(p_expires_hours, 168), 1))
  )
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'grant_id', v_id,
    'token', v_token,
    'expires_at', now() + make_interval(hours => greatest(coalesce(p_expires_hours, 168), 1))
  );
end;
$$;

revoke all on function public.issue_deck_invite(text, text[], text, int) from public;
grant execute on function public.issue_deck_invite(text, text[], text, int) to authenticated;

create or replace function public.redeem_deck_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grant public.deck_access_grants%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select email into v_email from public.profiles where id = auth.uid();

  select * into v_grant
  from public.deck_access_grants
  where invite_token = trim(p_token);

  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if v_grant.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'REVOKED');
  end if;

  if v_grant.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'EXPIRED');
  end if;

  if v_email is null or lower(v_grant.email) <> lower(v_email) then
    return jsonb_build_object('ok', false, 'error', 'EMAIL_MISMATCH');
  end if;

  update public.deck_access_grants
  set user_id = auth.uid(),
      redeemed_at = coalesce(redeemed_at, now())
  where id = v_grant.id;

  return jsonb_build_object(
    'ok', true,
    'audience_scopes', v_grant.audience_scopes,
    'label', v_grant.label
  );
end;
$$;

revoke all on function public.redeem_deck_invite(text) from public;
grant execute on function public.redeem_deck_invite(text) to authenticated;

-- ─────────────────────────────────────────────
-- Session pacing / de-escalation state
-- ─────────────────────────────────────────────

create table if not exists public.session_room_pacing (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  pacing_mode text not null default 'normal'
    check (pacing_mode in ('normal', 'slow', 'paused', 'pull_back')),
  warning_message text,
  posting_restricted_until timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.session_room_pacing enable row level security;

drop policy if exists session_room_pacing_facilitator on public.session_room_pacing;
create policy session_room_pacing_facilitator
  on public.session_room_pacing for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
  );

create table if not exists public.participant_pacing (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  warning_level text not null default 'none'
    check (warning_level in ('none', 'notice', 'slow', 'pause')),
  warning_message text,
  acknowledge_required boolean not null default false,
  acknowledged_at timestamptz,
  posting_blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.participant_pacing enable row level security;

drop policy if exists participant_pacing_facilitator on public.participant_pacing;
create policy participant_pacing_facilitator
  on public.participant_pacing for all
  using (
    exists (
      select 1
      from public.participants p
      join public.sessions s on s.id = p.session_id
      where p.id = participant_id and s.facilitator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.participants p
      join public.sessions s on s.id = p.session_id
      where p.id = participant_id and s.facilitator_id = auth.uid()
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.session_room_pacing;
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────
-- Token context + reason + pacing RPCs
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
    'identity_verification_required', v_session.identity_verification_required
  );
end;
$$;

create or replace function public.record_participant_reason(
  p_token text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_reason text := left(trim(coalesce(p_reason, '')), 500);
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if length(v_reason) < 8 then
    return jsonb_build_object('valid', false, 'error', 'REASON_REQUIRED');
  end if;

  update public.participants
  set participation_reason = v_reason,
      invite_used = true
  where id = (v_ctx->>'participant_id')::uuid;

  return public.validate_participant_token(p_token);
end;
$$;

revoke all on function public.record_participant_reason(text, text) from public;
grant execute on function public.record_participant_reason(text, text) to anon, authenticated;

create or replace function public.facilitator_set_room_pacing(
  p_session_id uuid,
  p_mode text,
  p_message text default null,
  p_restrict_minutes int default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode text := lower(trim(coalesce(p_mode, 'normal')));
  v_message text := nullif(left(trim(coalesce(p_message, '')), 400), '');
  v_until timestamptz;
  v_participant record;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  if not exists (
    select 1 from public.sessions s
    where s.id = p_session_id and s.facilitator_id = auth.uid()
  ) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_mode not in ('normal', 'slow', 'paused', 'pull_back') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_MODE');
  end if;

  if v_mode = 'normal' then
    v_message := null;
    v_until := null;
  elsif v_mode = 'slow' then
    v_message := coalesce(
      v_message,
      'Please slow down. Shorter contributions help the room stay workable.'
    );
    v_until := now() + make_interval(mins => greatest(coalesce(p_restrict_minutes, 2), 1));
  elsif v_mode = 'paused' then
    v_message := coalesce(
      v_message,
      'The facilitator has paused posting. Take a moment, then acknowledge when you are ready to continue.'
    );
    v_until := now() + make_interval(mins => greatest(coalesce(p_restrict_minutes, 5), 1));
  else
    v_message := coalesce(
      v_message,
      'Please pull back from intensifying language. Reframe the concern without targeting people.'
    );
    v_until := now() + make_interval(mins => greatest(coalesce(p_restrict_minutes, 3), 1));
  end if;

  insert into public.session_room_pacing as srp (
    session_id,
    pacing_mode,
    warning_message,
    posting_restricted_until,
    updated_by,
    updated_at
  )
  values (p_session_id, v_mode, v_message, v_until, auth.uid(), now())
  on conflict (session_id) do update
    set pacing_mode = excluded.pacing_mode,
        warning_message = excluded.warning_message,
        posting_restricted_until = excluded.posting_restricted_until,
        updated_by = excluded.updated_by,
        updated_at = now();

  -- Mirror room pacing onto each verified participant so warnings are personal.
  for v_participant in
    select id from public.participants
    where session_id = p_session_id
      and verification_status = 'verified'
  loop
    insert into public.participant_pacing as pp (
      participant_id,
      warning_level,
      warning_message,
      acknowledge_required,
      acknowledged_at,
      posting_blocked_until,
      updated_at
    )
    values (
      v_participant.id,
      case v_mode
        when 'normal' then 'none'
        when 'slow' then 'slow'
        when 'paused' then 'pause'
        else 'notice'
      end,
      v_message,
      v_mode = 'paused',
      case when v_mode = 'paused' then null else now() end,
      v_until,
      now()
    )
    on conflict (participant_id) do update
      set warning_level = excluded.warning_level,
          warning_message = excluded.warning_message,
          acknowledge_required = excluded.acknowledge_required,
          acknowledged_at = excluded.acknowledged_at,
          posting_blocked_until = excluded.posting_blocked_until,
          updated_at = now();
  end loop;

  if v_mode = 'paused' then
    update public.sessions
    set status = 'paused', updated_at = now()
    where id = p_session_id
      and status in ('live', 'open');
  elsif v_mode = 'normal' then
    update public.sessions
    set status = 'live', updated_at = now()
    where id = p_session_id
      and status = 'paused';
  end if;

  return jsonb_build_object('ok', true, 'pacing_mode', v_mode);
end;
$$;

revoke all on function public.facilitator_set_room_pacing(uuid, text, text, int) from public;
grant execute on function public.facilitator_set_room_pacing(uuid, text, text, int) to authenticated;

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
    or coalesce(v_pp.acknowledge_required, false);

  return jsonb_build_object(
    'valid', true,
    'pacing_mode', coalesce(v_room.pacing_mode, 'normal'),
    'warning_level', coalesce(v_pp.warning_level, 'none'),
    'warning_message', coalesce(v_pp.warning_message, v_room.warning_message),
    'acknowledge_required', coalesce(v_pp.acknowledge_required, false),
    'posting_blocked', v_blocked,
    'posting_blocked_until', coalesce(v_pp.posting_blocked_until, v_room.posting_restricted_until),
    'session_status', v_ctx->>'session_status'
  );
end;
$$;

revoke all on function public.participant_get_pacing(text) from public;
grant execute on function public.participant_get_pacing(text) to anon, authenticated;

create or replace function public.participant_acknowledge_pause(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_pp public.participant_pacing%rowtype;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_pp
  from public.participant_pacing
  where participant_id = (v_ctx->>'participant_id')::uuid;

  if not found then
    return jsonb_build_object('valid', true, 'acknowledged', true);
  end if;

  update public.participant_pacing
  set acknowledge_required = false,
      acknowledged_at = now(),
      warning_level = case when warning_level = 'pause' then 'notice' else warning_level end,
      updated_at = now()
  where participant_id = v_pp.participant_id;

  return public.participant_get_pacing(p_token);
end;
$$;

revoke all on function public.participant_acknowledge_pause(text) from public;
grant execute on function public.participant_acknowledge_pause(text) to anon, authenticated;

create or replace function public.participant_request_slow_down(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_until timestamptz := now() + interval '90 seconds';
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  insert into public.participant_pacing as pp (
    participant_id,
    warning_level,
    warning_message,
    acknowledge_required,
    acknowledged_at,
    posting_blocked_until,
    updated_at
  )
  values (
    (v_ctx->>'participant_id')::uuid,
    'slow',
    'You chose to slow down. Take a short pause before sending your next contribution.',
    false,
    now(),
    v_until,
    now()
  )
  on conflict (participant_id) do update
    set warning_level = 'slow',
        warning_message = excluded.warning_message,
        posting_blocked_until = greatest(coalesce(pp.posting_blocked_until, now()), excluded.posting_blocked_until),
        updated_at = now();

  return public.participant_get_pacing(p_token);
end;
$$;

revoke all on function public.participant_request_slow_down(text) from public;
grant execute on function public.participant_request_slow_down(text) to anon, authenticated;

-- Enforce pacing on send (paused room / personal block / unacked pause)
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
begin
  v_ctx := public._participant_room_gate(p_token, true);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'session_status') = 'paused' then
    return jsonb_build_object('valid', false, 'error', 'ROOM_PAUSED');
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
