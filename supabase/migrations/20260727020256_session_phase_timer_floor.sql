-- Per-session dialogue phase timers, floor control, and private tone signals.
-- Extends public.sessions / session_audit_events — does NOT create a parallel rooms schema.
-- Timer zero never auto-advances stages; facilitator must advance deliberately.
-- System feed notes at timer zero use the AES-GCM ciphertext path (client-authored).

-- ─────────────────────────────────────────────
-- 1) Audit event allowlist
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
      'approvals_reset',
      'authorship_attested',
      'dialogue_stage_advanced',
      'record_released',
      'release_failed',
      'phase_timer_started',
      'phase_timer_extended',
      'phase_timer_paused',
      'phase_timer_elapsed',
      'floor_granted',
      'floor_revoked',
      'recess_invoked',
      'tone_signal_recorded'
    )
  );

-- ─────────────────────────────────────────────
-- 2) Session phase timer + floor columns
-- ─────────────────────────────────────────────

alter table public.sessions
  add column if not exists phase_started_at timestamptz,
  add column if not exists phase_duration_seconds integer,
  add column if not exists phase_budgets jsonb not null default '{}'::jsonb,
  add column if not exists session_ends_at timestamptz,
  add column if not exists phase_timer_state text not null default 'idle',
  add column if not exists floor_holder_participant_id uuid
    references public.participants (id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_phase_timer_state_check'
  ) then
    alter table public.sessions
      add constraint sessions_phase_timer_state_check
      check (phase_timer_state in ('idle', 'running', 'paused', 'elapsed'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_phase_duration_nonneg_check'
  ) then
    alter table public.sessions
      add constraint sessions_phase_duration_nonneg_check
      check (phase_duration_seconds is null or phase_duration_seconds >= 0);
  end if;
end $$;

comment on column public.sessions.phase_started_at is
  'Wall-clock start of the current phase budget when phase_timer_state = running.';
comment on column public.sessions.phase_duration_seconds is
  'Current phase budget in seconds (remaining when paused).';
comment on column public.sessions.phase_budgets is
  'Per-session map of dialogue_stage → default seconds. Seeded from template; every room may differ.';
comment on column public.sessions.session_ends_at is
  'Optional hard wall-clock end for the whole session. Null = no hard end.';
comment on column public.sessions.phase_timer_state is
  'idle | running | paused | elapsed. Elapsed never auto-advances dialogue_stage.';
comment on column public.sessions.floor_holder_participant_id is
  'Optional speaking floor holder (participant id). Null = open floor.';

create index if not exists sessions_floor_holder_idx
  on public.sessions (floor_holder_participant_id)
  where floor_holder_participant_id is not null;

-- Private author→facilitator heat score only (no public shame labels).
alter table public.participants
  add column if not exists tone_signal numeric(4, 3),
  add column if not exists tone_signal_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'participants_tone_signal_range_check'
  ) then
    alter table public.participants
      add constraint participants_tone_signal_range_check
      check (tone_signal is null or (tone_signal >= 0 and tone_signal <= 1));
  end if;
end $$;

comment on column public.participants.tone_signal is
  'Latest local heuristic tension score (0–1). Facilitator-visible only; never shown as a public heat label.';
comment on column public.participants.tone_signal_at is
  'When tone_signal was last reported.';

-- Message draft/submitted/redacted status is intentionally NOT added:
-- session_messages bodies are immutable ciphertext (Update: never). Draft UX stays client-local.

-- ─────────────────────────────────────────────
-- 3) Template default budgets (every room can differ)
-- ─────────────────────────────────────────────

create or replace function public.default_phase_budgets_for_template(p_template_id text)
returns jsonb
language sql
immutable
as $$
  select case coalesce(p_template_id, 'ngo_deliberation')
    when 'ngo_deliberation' then jsonb_build_object(
      'preparation', 300,
      'opening', 600,
      'story', 1800,
      'framing', 1200,
      'options', 1500,
      'review', 1200,
      'outcome_ready', 0
    )
    when 'community_mediation' then jsonb_build_object(
      'preparation', 240,
      'opening', 480,
      'story', 1200,
      'framing', 900,
      'options', 1200,
      'review', 900,
      'outcome_ready', 0
    )
    when 'city_community_safety' then jsonb_build_object(
      'preparation', 300,
      'opening', 420,
      'story', 900,
      'framing', 900,
      'options', 1500,
      'review', 900,
      'outcome_ready', 0
    )
    when 'track2_dialogue' then jsonb_build_object(
      'preparation', 360,
      'opening', 600,
      'story', 1500,
      'framing', 1200,
      'options', 1200,
      'review', 1200,
      'outcome_ready', 0
    )
    else jsonb_build_object(
      'preparation', 300,
      'opening', 600,
      'story', 1200,
      'framing', 900,
      'options', 1200,
      'review', 900,
      'outcome_ready', 0
    )
  end;
$$;

comment on function public.default_phase_budgets_for_template(text) is
  'Default phase_budgets jsonb keyed by dialogue_stage. Per-session overrides allowed.';

revoke all on function public.default_phase_budgets_for_template(text) from public;
grant execute on function public.default_phase_budgets_for_template(text) to authenticated;
grant execute on function public.default_phase_budgets_for_template(text) to service_role;

create or replace function public.sessions_seed_phase_budgets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.phase_budgets is null
     or NEW.phase_budgets = '{}'::jsonb
     or jsonb_typeof(NEW.phase_budgets) <> 'object' then
    NEW.phase_budgets := public.default_phase_budgets_for_template(NEW.template_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists sessions_seed_phase_budgets on public.sessions;
create trigger sessions_seed_phase_budgets
  before insert on public.sessions
  for each row
  execute function public.sessions_seed_phase_budgets();

-- Backfill empty budgets on existing sessions
update public.sessions
set phase_budgets = public.default_phase_budgets_for_template(template_id)
where phase_budgets is null
   or phase_budgets = '{}'::jsonb;

-- ─────────────────────────────────────────────
-- 4) Helpers
-- ─────────────────────────────────────────────

create or replace function public.session_phase_remaining_seconds(
  p_started_at timestamptz,
  p_duration_seconds integer,
  p_timer_state text,
  p_now timestamptz default now()
)
returns integer
language plpgsql
immutable
as $$
declare
  v_elapsed int;
  v_remaining int;
begin
  if p_duration_seconds is null or p_duration_seconds < 0 then
    return null;
  end if;

  if p_timer_state = 'paused' then
    return p_duration_seconds;
  end if;

  if p_timer_state = 'elapsed' then
    return 0;
  end if;

  if p_timer_state <> 'running' or p_started_at is null then
    return null;
  end if;

  v_elapsed := greatest(0, floor(extract(epoch from (p_now - p_started_at)))::int);
  v_remaining := greatest(0, p_duration_seconds - v_elapsed);
  return v_remaining;
end;
$$;

create or replace function public.session_phase_budget_seconds(
  p_budgets jsonb,
  p_stage text
)
returns integer
language sql
immutable
as $$
  select coalesce(
    nullif((p_budgets ->> p_stage)::int, null),
    0
  );
$$;

create or replace function public._assert_session_facilitator(p_session_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_session from public.sessions where id = p_session_id;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_session.facilitator_id is distinct from auth.uid() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  return v_session;
end;
$$;

revoke all on function public._assert_session_facilitator(uuid) from public;

-- ─────────────────────────────────────────────
-- 5) Timer RPCs
-- ─────────────────────────────────────────────

create or replace function public.facilitator_start_phase_timer(
  p_session_id uuid,
  p_duration_seconds integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_duration int;
begin
  begin
    v_session := public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  if v_session.status in ('ended', 'released') then
    return jsonb_build_object('ok', false, 'error', 'SESSION_CLOSED');
  end if;

  v_duration := coalesce(
    p_duration_seconds,
    public.session_phase_budget_seconds(v_session.phase_budgets, v_session.dialogue_stage)
  );

  if v_duration is null or v_duration <= 0 then
    return jsonb_build_object('ok', false, 'error', 'NO_BUDGET');
  end if;

  update public.sessions
  set phase_started_at = now(),
      phase_duration_seconds = v_duration,
      phase_timer_state = 'running',
      updated_at = now()
  where id = p_session_id;

  perform public._log_session_audit_event_internal(
    p_session_id,
    'phase_timer_started',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'stage', v_session.dialogue_stage,
      'duration_seconds', v_duration
    )
  );

  return jsonb_build_object(
    'ok', true,
    'phase_timer_state', 'running',
    'phase_started_at', now(),
    'phase_duration_seconds', v_duration,
    'dialogue_stage', v_session.dialogue_stage
  );
end;
$$;

revoke all on function public.facilitator_start_phase_timer(uuid, integer) from public;
grant execute on function public.facilitator_start_phase_timer(uuid, integer) to authenticated;

create or replace function public.facilitator_extend_phase_timer(
  p_session_id uuid,
  p_extra_seconds integer,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_remaining int;
  v_next_duration int;
begin
  begin
    v_session := public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  if p_extra_seconds is null or p_extra_seconds <= 0 or p_extra_seconds > 7200 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_EXTRA');
  end if;

  if v_session.phase_timer_state = 'paused' then
    v_next_duration := coalesce(v_session.phase_duration_seconds, 0) + p_extra_seconds;
    update public.sessions
    set phase_duration_seconds = v_next_duration,
        phase_timer_state = 'paused',
        updated_at = now()
    where id = p_session_id;

    perform public._log_session_audit_event_internal(
      p_session_id,
      'phase_timer_extended',
      'facilitator',
      auth.uid(),
      jsonb_build_object(
        'extra_seconds', p_extra_seconds,
        'reason', left(coalesce(p_reason, ''), 280),
        'stage', v_session.dialogue_stage,
        'timer_state', 'paused'
      )
    );

    return jsonb_build_object(
      'ok', true,
      'phase_timer_state', 'paused',
      'phase_duration_seconds', v_next_duration
    );
  elsif v_session.phase_timer_state in ('running', 'elapsed', 'idle') then
    v_remaining := coalesce(
      public.session_phase_remaining_seconds(
        v_session.phase_started_at,
        v_session.phase_duration_seconds,
        case when v_session.phase_timer_state = 'elapsed' then 'elapsed' else 'running' end
      ),
      coalesce(v_session.phase_duration_seconds, 0)
    );
    if v_session.phase_timer_state = 'elapsed' then
      v_remaining := 0;
    end if;
    v_next_duration := v_remaining + p_extra_seconds;
    update public.sessions
    set phase_started_at = now(),
        phase_duration_seconds = v_next_duration,
        phase_timer_state = 'running',
        updated_at = now()
    where id = p_session_id;
  else
    return jsonb_build_object('ok', false, 'error', 'TIMER_NOT_ACTIVE');
  end if;

  perform public._log_session_audit_event_internal(
    p_session_id,
    'phase_timer_extended',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'extra_seconds', p_extra_seconds,
      'reason', left(coalesce(p_reason, ''), 280),
      'stage', v_session.dialogue_stage
    )
  );

  return jsonb_build_object(
    'ok', true,
    'phase_timer_state', 'running',
    'phase_duration_seconds', v_next_duration
  );
end;
$$;

revoke all on function public.facilitator_extend_phase_timer(uuid, integer, text) from public;
grant execute on function public.facilitator_extend_phase_timer(uuid, integer, text) to authenticated;

create or replace function public.facilitator_pause_phase_timer(
  p_session_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_remaining int;
begin
  begin
    v_session := public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  if v_session.phase_timer_state <> 'running' then
    return jsonb_build_object('ok', false, 'error', 'TIMER_NOT_RUNNING');
  end if;

  v_remaining := coalesce(
    public.session_phase_remaining_seconds(
      v_session.phase_started_at,
      v_session.phase_duration_seconds,
      'running'
    ),
    0
  );

  update public.sessions
  set phase_duration_seconds = v_remaining,
      phase_started_at = null,
      phase_timer_state = 'paused',
      updated_at = now()
  where id = p_session_id;

  perform public._log_session_audit_event_internal(
    p_session_id,
    'phase_timer_paused',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'remaining_seconds', v_remaining,
      'reason', left(coalesce(p_reason, ''), 280),
      'stage', v_session.dialogue_stage
    )
  );

  return jsonb_build_object(
    'ok', true,
    'phase_timer_state', 'paused',
    'phase_duration_seconds', v_remaining
  );
end;
$$;

revoke all on function public.facilitator_pause_phase_timer(uuid, text) from public;
grant execute on function public.facilitator_pause_phase_timer(uuid, text) to authenticated;

-- Marks elapsed + accepts optional AES-GCM ciphertext for a system-style feed note.
-- Does NOT advance dialogue_stage.
create or replace function public.facilitator_mark_phase_elapsed(
  p_session_id uuid,
  p_system_body text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_msg_id uuid;
  v_has_key boolean;
begin
  begin
    v_session := public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  if v_session.phase_timer_state = 'elapsed' and p_system_body is null then
    return jsonb_build_object('ok', true, 'phase_timer_state', 'elapsed', 'already', true);
  end if;

  update public.sessions
  set phase_timer_state = 'elapsed',
      phase_duration_seconds = 0,
      updated_at = now()
  where id = p_session_id
    and phase_timer_state is distinct from 'elapsed';

  perform public._log_session_audit_event_internal(
    p_session_id,
    'phase_timer_elapsed',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'stage', v_session.dialogue_stage,
      'auto_advance', false
    )
  );

  if p_system_body is not null and length(trim(p_system_body)) > 0 then
    select exists (
      select 1 from public.session_room_keys k where k.session_id = p_session_id
    ) into v_has_key;

    if v_has_key and not public.is_aes_gcm_v3_payload(trim(p_system_body)) then
      return jsonb_build_object(
        'ok', true,
        'phase_timer_state', 'elapsed',
        'message_error', 'CIPHERTEXT_REQUIRED'
      );
    end if;

    insert into public.session_messages (session_id, sender_label, sender_role, body)
    values (
      p_session_id,
      'Room note',
      'facilitator',
      trim(p_system_body)
    )
    returning id into v_msg_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'phase_timer_state', 'elapsed',
    'message_id', v_msg_id,
    'requires_facilitator_advance', true
  );
end;
$$;

revoke all on function public.facilitator_mark_phase_elapsed(uuid, text) from public;
grant execute on function public.facilitator_mark_phase_elapsed(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- 6) Floor grant / revoke
-- ─────────────────────────────────────────────

create or replace function public.facilitator_set_floor(
  p_session_id uuid,
  p_participant_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions%rowtype;
  v_codename text;
begin
  begin
    v_session := public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  if p_participant_id is not null then
    select codename into v_codename
    from public.participants
    where id = p_participant_id
      and session_id = p_session_id;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'PARTICIPANT_NOT_FOUND');
    end if;
  end if;

  update public.sessions
  set floor_holder_participant_id = p_participant_id,
      updated_at = now()
  where id = p_session_id;

  perform public._log_session_audit_event_internal(
    p_session_id,
    case when p_participant_id is null then 'floor_revoked' else 'floor_granted' end,
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'participant_id', p_participant_id,
      'codename', v_codename
    )
  );

  return jsonb_build_object(
    'ok', true,
    'floor_holder_participant_id', p_participant_id,
    'floor_holder_codename', v_codename
  );
end;
$$;

revoke all on function public.facilitator_set_floor(uuid, uuid) from public;
grant execute on function public.facilitator_set_floor(uuid, uuid) to authenticated;

-- Thin recess wrapper: Power of Pause + audit (human-in-the-loop; UI shows 90s overlay).
create or replace function public.facilitator_invoke_recess(
  p_session_id uuid,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  begin
    perform public._assert_session_facilitator(p_session_id);
  exception
    when others then
      return jsonb_build_object('ok', false, 'error', SQLERRM);
  end;

  v_result := public.facilitator_set_room_pacing(
    p_session_id,
    'paused',
    coalesce(nullif(trim(p_message), ''), 'Pause — take ninety seconds to settle before continuing.'),
    2
  );

  if coalesce((v_result->>'ok')::boolean, false) then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'recess_invoked',
      'facilitator',
      auth.uid(),
      jsonb_build_object('seconds', 90)
    );
  end if;

  return v_result || jsonb_build_object('recess_seconds', 90);
end;
$$;

revoke all on function public.facilitator_invoke_recess(uuid, text) from public;
grant execute on function public.facilitator_invoke_recess(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- 7) Private tone signal (participant → facilitator roster)
-- ─────────────────────────────────────────────

create or replace function public.participant_report_tone_signal(
  p_token text,
  p_tension_level numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_level numeric;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if p_tension_level is null then
    return jsonb_build_object('valid', false, 'error', 'INVALID_LEVEL');
  end if;

  v_level := greatest(0, least(1, p_tension_level));

  update public.participants
  set tone_signal = v_level,
      tone_signal_at = now()
  where id = (v_ctx->>'participant_id')::uuid;

  -- Metadata only — no message body.
  perform public._log_session_audit_event_internal(
    (v_ctx->>'session_id')::uuid,
    'tone_signal_recorded',
    'participant',
    null,
    jsonb_build_object(
      'participant_id', v_ctx->>'participant_id',
      'band', case
        when v_level >= 0.7 then 'elevated'
        when v_level >= 0.4 then 'notice'
        else 'calm'
      end
    )
  );

  return jsonb_build_object('valid', true, 'tone_signal', v_level);
end;
$$;

revoke all on function public.participant_report_tone_signal(text, numeric) from public;
grant execute on function public.participant_report_tone_signal(text, numeric) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 8) Patch stage advance to reset/start phase timer from budgets
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
  v_budget int;
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

  if v_to_rank <> v_from_rank
     and abs(v_to_rank - v_from_rank) > 1
     and not (v_stage = 'outcome_ready' and v_to_rank > v_from_rank) then
    return jsonb_build_object(
      'ok', false,
      'error', 'STAGE_SKIP_BLOCKED',
      'current', v_session.dialogue_stage
    );
  end if;

  v_budget := public.session_phase_budget_seconds(
    coalesce(v_session.phase_budgets, '{}'::jsonb),
    v_stage
  );

  update public.sessions
  set dialogue_stage = v_stage,
      phase_started_at = case when v_budget > 0 then now() else null end,
      phase_duration_seconds = case when v_budget > 0 then v_budget else null end,
      phase_timer_state = case when v_budget > 0 then 'running' else 'idle' end,
      floor_holder_participant_id = null,
      updated_at = now()
  where id = p_session_id;

  perform public._log_session_audit_event_internal(
    p_session_id,
    'dialogue_stage_advanced',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'from', v_session.dialogue_stage,
      'to', v_stage,
      'phase_duration_seconds', case when v_budget > 0 then v_budget else null end
    )
  );

  if v_budget > 0 then
    perform public._log_session_audit_event_internal(
      p_session_id,
      'phase_timer_started',
      'facilitator',
      auth.uid(),
      jsonb_build_object(
        'stage', v_stage,
        'duration_seconds', v_budget,
        'source', 'stage_advance'
      )
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'session_id', p_session_id,
    'dialogue_stage', v_stage,
    'phase_timer_state', case when v_budget > 0 then 'running' else 'idle' end,
    'phase_duration_seconds', case when v_budget > 0 then v_budget else null end
  );
end;
$$;

-- ─────────────────────────────────────────────
-- 9) Enrich participant pacing with timer + floor (read-only)
-- ─────────────────────────────────────────────

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
  v_session public.sessions%rowtype;
  v_blocked boolean := false;
  v_stage text;
  v_floor_codename text;
  v_remaining int;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_session
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  select * into v_room
  from public.session_room_pacing
  where session_id = v_session.id;

  select * into v_pp
  from public.participant_pacing
  where participant_id = (v_ctx->>'participant_id')::uuid;

  v_stage := coalesce(v_session.dialogue_stage, v_ctx->>'dialogue_stage', 'preparation');

  if v_session.floor_holder_participant_id is not null then
    select codename into v_floor_codename
    from public.participants
    where id = v_session.floor_holder_participant_id;
  end if;

  v_remaining := public.session_phase_remaining_seconds(
    v_session.phase_started_at,
    v_session.phase_duration_seconds,
    v_session.phase_timer_state
  );

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
    'participant_posting_allowed', public.dialogue_stage_allows_participant_post(v_stage),
    'phase_timer_state', coalesce(v_session.phase_timer_state, 'idle'),
    'phase_started_at', v_session.phase_started_at,
    'phase_duration_seconds', v_session.phase_duration_seconds,
    'phase_remaining_seconds', v_remaining,
    'session_ends_at', v_session.session_ends_at,
    'floor_holder_participant_id', v_session.floor_holder_participant_id,
    'floor_holder_codename', v_floor_codename,
    'server_now', now()
  );
end;
$$;
