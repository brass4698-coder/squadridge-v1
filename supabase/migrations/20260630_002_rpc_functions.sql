-- ============================================================
-- SquadRidge RPC Functions
-- 20260630_002_rpc_functions.sql
-- ============================================================

-- ---- get_effective_user_roles ----
create or replace function public.get_effective_user_roles(
  p_user_id uuid default null
)
returns table (
  role_key text,
  workspace_id uuid,
  institution_id uuid,
  granted_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ur.role_key,
    ur.workspace_id,
    ur.institution_id,
    ur.granted_at
  from public.user_roles ur
  where ur.user_id = coalesce(p_user_id, auth.uid())
    and (
      -- caller can read own, or admins can read others
      p_user_id is null
      or p_user_id = auth.uid()
      or exists (
        select 1 from public.user_roles a
        where a.user_id = auth.uid()
          and a.role_key in ('super_admin','institution_admin')
      )
    );
$$;

grant execute on function public.get_effective_user_roles to authenticated;

-- ---- get_default_dashboard_for_user ----
create or replace function public.get_default_dashboard_for_user(
  p_user_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := coalesce(p_user_id, auth.uid());
  v_last text;
  v_role text;
begin
  -- check saved preference first
  select last_dashboard into v_last
  from public.app_preferences
  where user_id = v_uid;

  if v_last is not null then
    return v_last;
  end if;

  -- highest-priority role
  select ur.role_key into v_role
  from public.user_roles ur
  where ur.user_id = v_uid
  order by
    case ur.role_key
      when 'super_admin'       then 1
      when 'institution_admin' then 2
      when 'facilitator'       then 3
      when 'mediator'          then 4
      when 'analyst'           then 5
      when 'participant'       then 6
      when 'observer'          then 7
      else 99
    end
  limit 1;

  return case v_role
    when 'super_admin'       then '/app/admin'
    when 'institution_admin' then '/app/institution'
    when 'facilitator'       then '/app/facilitator'
    when 'mediator'          then '/app/mediator'
    when 'analyst'           then '/app/analyst'
    when 'participant'       then '/app/participant'
    when 'observer'          then '/app/observer'
    else '/app'
  end;
end;
$$;

grant execute on function public.get_default_dashboard_for_user to authenticated;

-- ---- validate_invite_token ----
create or replace function public.validate_invite_token(
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
begin
  select * into v_invite
  from public.invites
  where token = p_token
  limit 1;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;

  if v_invite.revoked_at is not null then
    return jsonb_build_object('valid', false, 'reason', 'revoked');
  end if;

  if v_invite.used_at is not null then
    return jsonb_build_object('valid', false, 'reason', 'already_used');
  end if;

  if v_invite.expires_at < now() then
    return jsonb_build_object('valid', false, 'reason', 'expired');
  end if;

  return jsonb_build_object(
    'valid', true,
    'invite_id', v_invite.id,
    'email', v_invite.email,
    'role_key', v_invite.role_key,
    'invite_type', v_invite.invite_type,
    'institution_id', v_invite.institution_id,
    'workspace_id', v_invite.workspace_id,
    'metadata', v_invite.metadata
  );
end;
$$;

-- public can call validate (reads no sensitive rows, just checks token)
grant execute on function public.validate_invite_token to anon, authenticated;

-- ---- accept_invite ----
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
begin
  v_validation := public.validate_invite_token(p_token);

  if not (v_validation->>'valid')::boolean then
    return v_validation;
  end if;

  select * into v_invite
  from public.invites
  where token = p_token
  limit 1;

  -- upsert profile
  insert into public.profiles (id, email, display_name, status, primary_role, onboarding_completed)
  values (
    p_user_id,
    v_invite.email,
    p_display_name,
    'active',
    v_invite.role_key,
    false
  )
  on conflict (id) do update set
    status = 'active',
    primary_role = coalesce(excluded.primary_role, public.profiles.primary_role),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();

  -- assign role
  insert into public.user_roles (user_id, role_key, workspace_id, institution_id)
  values (p_user_id, v_invite.role_key, v_invite.workspace_id, v_invite.institution_id)
  on conflict (user_id, role_key, workspace_id, institution_id) do nothing;

  -- mark invite used
  update public.invites
  set used_at = now(), auth_user_id = p_user_id
  where id = v_invite.id;

  -- audit
  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    p_user_id, 'invite_accepted', 'invite', v_invite.id,
    jsonb_build_object('role_key', v_invite.role_key, 'invite_type', v_invite.invite_type)
  );

  return jsonb_build_object(
    'success', true,
    'dashboard', public.get_default_dashboard_for_user(p_user_id),
    'role_key', v_invite.role_key
  );
end;
$$;

grant execute on function public.accept_invite to authenticated;

-- ---- create_invite (admin only) ----
create or replace function public.create_invite(
  p_email text,
  p_invite_type text,
  p_role_key text,
  p_institution_id uuid default null,
  p_workspace_id uuid default null,
  p_expires_hours int default 72,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_invite_id uuid;
begin
  -- only admins and facilitators may issue invites
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key in ('super_admin','institution_admin','facilitator')
  ) then
    raise exception 'unauthorized: insufficient role to create invite';
  end if;

  -- generate cryptographically random token
  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.invites (
    email, token, invite_type, role_key,
    institution_id, workspace_id, issued_by,
    expires_at, metadata
  )
  values (
    p_email, v_token, p_invite_type, p_role_key,
    p_institution_id, p_workspace_id, auth.uid(),
    now() + (p_expires_hours || ' hours')::interval,
    p_metadata
  )
  returning id into v_invite_id;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(), 'invite_created', 'invite', v_invite_id,
    jsonb_build_object('email', p_email, 'role_key', p_role_key)
  );

  return jsonb_build_object(
    'success', true,
    'token', v_token,
    'invite_id', v_invite_id,
    'expires_at', (now() + (p_expires_hours || ' hours')::interval)
  );
end;
$$;

grant execute on function public.create_invite to authenticated;

-- ---- revoke_invite ----
create or replace function public.revoke_invite(
  p_invite_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key in ('super_admin','institution_admin','facilitator')
  ) then
    raise exception 'unauthorized: insufficient role to revoke invite';
  end if;

  update public.invites
  set revoked_at = now()
  where id = p_invite_id
    and revoked_at is null
    and used_at is null;

  if not found then
    return jsonb_build_object('success', false, 'reason', 'not_found_or_already_used_revoked');
  end if;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id)
  values (auth.uid(), 'invite_revoked', 'invite', p_invite_id);

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.revoke_invite to authenticated;

-- ---- approve_access_request_and_issue_invite ----
create or replace function public.approve_access_request_and_issue_invite(
  p_request_id uuid,
  p_role_key text,
  p_institution_id uuid default null,
  p_workspace_id uuid default null,
  p_review_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request record;
  v_invite jsonb;
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key in ('super_admin','institution_admin')
  ) then
    raise exception 'unauthorized: insufficient role to approve access requests';
  end if;

  select * into v_request
  from public.access_requests
  where id = p_request_id
  limit 1;

  if not found then
    raise exception 'access_request not found';
  end if;

  -- issue invite
  v_invite := public.create_invite(
    v_request.email,
    p_role_key,
    p_role_key,
    p_institution_id,
    p_workspace_id,
    72,
    '{}'::jsonb
  );

  -- update request status
  update public.access_requests
  set
    status = 'approved',
    reviewed_by = auth.uid(),
    review_notes = p_review_notes,
    updated_at = now()
  where id = p_request_id;

  return jsonb_build_object(
    'success', true,
    'invite', v_invite
  );
end;
$$;

grant execute on function public.approve_access_request_and_issue_invite to authenticated;
