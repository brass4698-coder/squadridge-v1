-- v2 participant token RPCs, release_outcome, session templates metadata

create extension if not exists pgcrypto;

-- Session template + setup config (Phase 3 adaptability)
alter table public.sessions
  add column if not exists template_id text,
  add column if not exists setup_config jsonb not null default '{}'::jsonb;

comment on column public.sessions.template_id is
  'Optional starter template: community_mediation | ngo_deliberation | track2_dialogue';
comment on column public.sessions.setup_config is
  'Facilitator configuration snapshot (approval rules, suggested outcome structure, etc.)';

-- ─────────────────────────────────────────────
-- Participant token helpers (anon-friendly)
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

revoke all on function public.validate_participant_token(text) from public;
grant execute on function public.validate_participant_token(text) to anon, authenticated;

create or replace function public.record_participant_consent(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;

  update public.participants
  set consented_at = coalesce(consented_at, now()),
      invite_used = true
  where id = v_participant_id;

  return public.validate_participant_token(p_token);
end;
$$;

revoke all on function public.record_participant_consent(text) from public;
grant execute on function public.record_participant_consent(text) to anon, authenticated;

create or replace function public.participant_mark_document_submitted(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;

  update public.participants
  set document_submitted = true,
      invite_used = true
  where id = v_participant_id;

  return public.validate_participant_token(p_token);
end;
$$;

revoke all on function public.participant_mark_document_submitted(text) from public;
grant execute on function public.participant_mark_document_submitted(text) to anon, authenticated;

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
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('valid', false, 'error', 'NOT_VERIFIED');
  end if;

  if (v_ctx->>'session_status') not in ('live', 'open') then
    return jsonb_build_object('valid', false, 'error', 'SESSION_NOT_LIVE');
  end if;

  if p_body is null or length(trim(p_body)) = 0 then
    return jsonb_build_object('valid', false, 'error', 'EMPTY_BODY');
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;
  v_codename := v_ctx->>'codename';

  insert into public.session_messages (session_id, sender_label, sender_role, body)
  values (v_session_id, v_codename, 'participant', left(trim(p_body), 8000))
  returning id into v_msg_id;

  return jsonb_build_object('valid', true, 'message_id', v_msg_id);
end;
$$;

revoke all on function public.participant_send_message(text, text) from public;
grant execute on function public.participant_send_message(text, text) to anon, authenticated;

create or replace function public.participant_list_messages(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_session_id uuid;
  v_rows jsonb;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('valid', false, 'error', 'NOT_VERIFIED');
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'sender_label', m.sender_label,
      'sender_role', m.sender_role,
      'body', m.body,
      'sent_at', m.sent_at
    ) order by m.sent_at
  ), '[]'::jsonb)
  into v_rows
  from public.session_messages m
  where m.session_id = v_session_id;

  return jsonb_build_object('valid', true, 'messages', v_rows);
end;
$$;

revoke all on function public.participant_list_messages(text) from public;
grant execute on function public.participant_list_messages(text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- Atomic outcome release
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

  select count(*) into v_pending
  from public.outcome_approvals
  where outcome_id = p_outcome_id and status <> 'approved';

  if v_pending > 0 then
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_PENDING');
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

revoke all on function public.release_outcome(uuid) from public;
grant execute on function public.release_outcome(uuid) to authenticated;
