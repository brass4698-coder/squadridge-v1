-- Auth / participant security hardening:
--   • Server-side consent + document gates on participant RPCs
--   • Profile self-update guard (status, role, email)
--   • Verification document registration + private storage bucket
--   • Rate-limited access-request RPC (replaces open INSERT)
--   • Facilitator verification requires stored materials when identity required

alter table public.participants
  add column if not exists updated_at timestamptz not null default now();

-- ─────────────────────────────────────────────
-- access_requests: reconcile columns + RPC-only insert
-- ─────────────────────────────────────────────

alter table public.access_requests
  add column if not exists description text,
  add column if not exists organisation text;

-- Backfill organisation from legacy column name when present
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'access_requests'
      and column_name = 'organization'
  ) then
    execute $sql$
      update public.access_requests
      set organisation = coalesce(organisation, organization)
      where organisation is null and organization is not null
    $sql$;
  end if;
end;
$$;

drop policy if exists "Anyone can submit access request" on public.access_requests;
drop policy if exists "access_requests_insert_public" on public.access_requests;

create or replace function public.submit_access_request(
  p_full_name text,
  p_email text,
  p_use_case text,
  p_description text,
  p_organisation text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_recent int;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_NAME');
  end if;

  if v_email is null or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_EMAIL');
  end if;

  if p_use_case is null or length(trim(p_use_case)) < 2 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_USE_CASE');
  end if;

  if p_description is null or length(trim(p_description)) < 8 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DESCRIPTION');
  end if;

  select count(*)::int into v_recent
  from public.access_requests
  where lower(email) = v_email
    and created_at > now() - interval '1 hour';

  if v_recent >= 3 then
    return jsonb_build_object('ok', false, 'error', 'RATE_LIMIT');
  end if;

  insert into public.access_requests (
    full_name,
    email,
    use_case,
    description,
    organisation
  )
  values (
    left(trim(p_full_name), 200),
    left(v_email, 320),
    left(trim(p_use_case), 200),
    left(trim(p_description), 8000),
    nullif(left(trim(coalesce(p_organisation, '')), 200), '')
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_access_request(text, text, text, text, text) from public;
grant execute on function public.submit_access_request(text, text, text, text, text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- Profile privileged-column guard
-- ─────────────────────────────────────────────

create or replace function public.guard_profiles_privileged_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(current_setting('app.allow_profile_privileged_update', true), '') = 'true' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status is not null and new.status is distinct from 'pending' then
      raise exception 'profile status cannot be self-assigned'
        using errcode = 'P0001';
    end if;
    if new.primary_role is not null then
      raise exception 'primary_role cannot be self-assigned'
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      raise exception 'profile status cannot be self-updated'
        using errcode = 'P0001';
    end if;
    if new.primary_role is distinct from old.primary_role then
      raise exception 'primary_role cannot be self-updated'
        using errcode = 'P0001';
    end if;
    if new.email is distinct from old.email then
      raise exception 'profile email cannot be self-updated'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_profiles_privileged_columns on public.profiles;
create trigger trg_guard_profiles_privileged_columns
  before insert or update on public.profiles
  for each row
  execute function public.guard_profiles_privileged_columns();

-- accept_invite must bypass profile guard for privileged columns
create or replace function public.accept_invite(
  p_token text,
  p_user_id uuid,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_validation jsonb;
  v_uid uuid := auth.uid();
  v_auth_email text;
begin
  if v_uid is null then
    return jsonb_build_object('valid', false, 'reason', 'not_authenticated');
  end if;

  if p_user_id is not null and p_user_id <> v_uid then
    return jsonb_build_object('valid', false, 'reason', 'user_mismatch');
  end if;

  select email into v_auth_email from auth.users where id = v_uid;

  v_validation := public.validate_invite_token(p_token);

  if not (v_validation->>'valid')::boolean then
    return v_validation;
  end if;

  select * into v_invite
  from public.invites
  where token = p_token
  limit 1;

  if lower(trim(v_auth_email)) <> lower(trim(v_invite.email)) then
    return jsonb_build_object('valid', false, 'reason', 'email_mismatch');
  end if;

  perform set_config('app.allow_profile_privileged_update', 'true', true);

  insert into public.profiles (id, email, display_name, status, primary_role, onboarding_completed)
  values (
    v_uid,
    v_invite.email,
    nullif(trim(p_display_name), ''),
    'active',
    v_invite.role_key,
    false
  )
  on conflict (id) do update set
    email = excluded.email,
    status = 'active',
    primary_role = coalesce(excluded.primary_role, public.profiles.primary_role),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();

  perform set_config('app.allow_profile_privileged_update', 'false', true);

  insert into public.user_roles (user_id, role_key, workspace_id, institution_id)
  values (v_uid, v_invite.role_key, v_invite.workspace_id, v_invite.institution_id)
  on conflict (user_id, role_key, workspace_id, institution_id) do nothing;

  update public.invites
  set used_at = now(), auth_user_id = v_uid
  where id = v_invite.id;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    v_uid, 'invite_accepted', 'invite', v_invite.id,
    jsonb_build_object('role_key', v_invite.role_key, 'invite_type', v_invite.invite_type)
  );

  return jsonb_build_object(
    'success', true,
    'dashboard', public.get_default_dashboard_for_user(v_uid),
    'role_key', v_invite.role_key
  );
end;
$$;

grant execute on function public.accept_invite to authenticated;

-- ─────────────────────────────────────────────
-- Participant token context + room gates
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
    'session_language', v_session.language,
    'identity_verification_required', v_session.identity_verification_required
  );
end;
$$;

create or replace function public._participant_room_gate(
  p_token text,
  p_require_live boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_session public.sessions%rowtype;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_session
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  if v_session.identity_verification_required
     and coalesce((v_ctx->>'document_submitted')::boolean, false) is not true then
    return jsonb_build_object('valid', false, 'error', 'DOCUMENT_REQUIRED');
  end if;

  if (v_ctx->>'consented_at') is null then
    return jsonb_build_object('valid', false, 'error', 'CONSENT_REQUIRED');
  end if;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('valid', false, 'error', 'NOT_VERIFIED');
  end if;

  if p_require_live
     and (v_ctx->>'session_status') not in ('live', 'open', 'paused') then
    return jsonb_build_object('valid', false, 'error', 'SESSION_NOT_LIVE');
  end if;

  return v_ctx;
end;
$$;

revoke all on function public._participant_room_gate(text, boolean) from public;

create or replace function public.participant_record_contact_hash(
  p_token text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
  v_email text := lower(trim(p_email));
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if v_email is null or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return jsonb_build_object('valid', false, 'error', 'INVALID_EMAIL');
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;

  update public.participants
  set email_hash = encode(digest(v_email, 'sha256'), 'hex'),
      updated_at = now()
  where id = v_participant_id;

  return jsonb_build_object('valid', true);
end;
$$;

revoke all on function public.participant_record_contact_hash(text, text) from public;
grant execute on function public.participant_record_contact_hash(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- Verification storage bucket (private)
-- ─────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'participant-verification',
  'participant-verification',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.participant_register_verification_document(
  p_token text,
  p_storage_path text,
  p_document_type text,
  p_byte_size int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant public.participants%rowtype;
  v_expected_prefix text;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_participant
  from public.participants
  where id = (v_ctx->>'participant_id')::uuid;

  v_expected_prefix := v_participant.session_id::text || '/' || v_participant.id::text || '/';

  if p_storage_path is null
     or not p_storage_path like v_expected_prefix || '%' then
    return jsonb_build_object('valid', false, 'error', 'INVALID_PATH');
  end if;

  if p_byte_size is null or p_byte_size < 1 or p_byte_size > 5242880 then
    return jsonb_build_object('valid', false, 'error', 'INVALID_SIZE');
  end if;

  insert into public.verification_requests (
    participant_id,
    document_type,
    storage_path
  )
  values (
    v_participant.id,
    nullif(left(trim(coalesce(p_document_type, 'identity')), 80), ''),
    p_storage_path
  );

  update public.participants
  set document_submitted = true,
      invite_used = true,
      updated_at = now()
  where id = v_participant.id;

  perform public._log_session_audit_event_internal(
    v_participant.session_id,
    'verification_submitted',
    'participant',
    null,
    jsonb_build_object(
      'participant_id', v_participant.id,
      'codename', v_participant.codename,
      'storage_path', p_storage_path
    )
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

revoke all on function public.participant_register_verification_document(text, text, text, int) from public;
grant execute on function public.participant_register_verification_document(text, text, text, int) to service_role;

-- Facilitator read access to verification objects in their sessions
drop policy if exists "Facilitator reads participant verification files" on storage.objects;
create policy "Facilitator reads participant verification files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'participant-verification'
    and exists (
      select 1
      from public.participants p
      join public.sessions s on s.id = p.session_id
      where s.facilitator_id = auth.uid()
        and (storage.foldername(name))[1] = p.session_id::text
        and (storage.foldername(name))[2] = p.id::text
    )
  );

-- ─────────────────────────────────────────────
-- Participant flow RPC patches
-- ─────────────────────────────────────────────

create or replace function public.record_participant_consent(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
  v_session public.sessions%rowtype;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_session
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  if v_session.identity_verification_required
     and coalesce((v_ctx->>'document_submitted')::boolean, false) is not true then
    return jsonb_build_object('valid', false, 'error', 'DOCUMENT_REQUIRED');
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;

  update public.participants
  set consented_at = coalesce(consented_at, now()),
      invite_used = true
  where id = v_participant_id;

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
  v_ctx := public._participant_room_gate(p_token, true);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
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
  v_ctx := public._participant_room_gate(p_token, false);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
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

create or replace function public.list_session_resolutions_for_participant(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_session_id uuid;
  v_participant_id uuid;
  v_items jsonb;
  v_supported uuid[];
begin
  v_ctx := public._participant_room_gate(p_token, false);
  if not (v_ctx->>'valid')::boolean then
    return jsonb_build_object('ok', false, 'error', coalesce(v_ctx->>'error', 'INVALID'));
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;
  v_participant_id := (v_ctx->>'participant_id')::uuid;

  select coalesce(array_agg(s.participant_id), '{}')
  into v_supported
  from public.session_resolution_supports s
  join public.session_resolution_items i on i.id = s.item_id
  where i.session_id = v_session_id and s.participant_id = v_participant_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'title', i.title,
        'description', i.description,
        'owner_org', i.owner_org,
        'target_days', i.target_days,
        'support_count', i.support_count,
        'rank_order', i.rank_order,
        'status', i.status,
        'supported', i.id = any(v_supported)
      )
      order by i.support_count desc, i.created_at asc
    ),
    '[]'::jsonb
  )
  into v_items
  from public.session_resolution_items i
  where i.session_id = v_session_id
    and i.status in ('proposed', 'shortlisted');

  return jsonb_build_object('ok', true, 'items', v_items);
end;
$$;

create or replace function public.participant_support_resolution(p_token text, p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
  v_session_id uuid;
  v_item public.session_resolution_items%rowtype;
begin
  v_ctx := public._participant_room_gate(p_token, false);
  if not (v_ctx->>'valid')::boolean then
    return jsonb_build_object('ok', false, 'error', coalesce(v_ctx->>'error', 'INVALID'));
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;
  v_session_id := (v_ctx->>'session_id')::uuid;

  select * into v_item
  from public.session_resolution_items
  where id = p_item_id and session_id = v_session_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if v_item.status = 'archived' then
    return jsonb_build_object('ok', false, 'error', 'ARCHIVED');
  end if;

  insert into public.session_resolution_supports (item_id, participant_id)
  values (p_item_id, v_participant_id)
  on conflict (item_id, participant_id) do nothing;

  return jsonb_build_object('ok', true);
end;
$$;

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
  v_session public.sessions%rowtype;
begin
  if p_status not in ('pending', 'verified', 'denied') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  end if;

  select * into v_participant from public.participants where id = p_participant_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_participant.session_id;

  if not exists (
    select 1 from public.sessions s
    where s.id = v_participant.session_id and s.facilitator_id = auth.uid()
  ) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if p_status = 'verified'
     and v_session.identity_verification_required
     and (
       not v_participant.document_submitted
       or not exists (
         select 1 from public.verification_requests vr
         where vr.participant_id = v_participant.id
           and vr.storage_path is not null
       )
     ) then
    return jsonb_build_object('ok', false, 'error', 'NO_VERIFICATION_MATERIAL');
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

-- Deprecate client-callable document flag without storage registration
revoke all on function public.participant_mark_document_submitted(text) from anon, authenticated;
