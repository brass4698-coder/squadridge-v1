-- ============================================================
-- SquadRidge Role Management RPCs
-- 20260703_001_role_management_rpcs.sql
--
-- Adds out-of-band role management on top of the invite-driven flow:
--   • list_users_with_roles     — admin console view
--   • grant_role_to_user        — add a role to an existing user
--   • revoke_role_from_user     — remove a role (blocks last super_admin)
--
-- All three enforce admin-only access at the RPC body level (SECURITY DEFINER
-- means the calling role is bypassed; the `raise exception` guards are the
-- authoritative check). RLS on `user_roles` still denies direct client
-- INSERT/DELETE, so these RPCs are the only client-facing path.
-- ============================================================

-- ---- list_users_with_roles ----
create or replace function public.list_users_with_roles(
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  status text,
  primary_role text,
  onboarding_completed boolean,
  created_at timestamptz,
  roles jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.email,
    p.display_name,
    p.status,
    p.primary_role,
    p.onboarding_completed,
    p.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'role_key', ur.role_key,
            'workspace_id', ur.workspace_id,
            'institution_id', ur.institution_id,
            'granted_at', ur.granted_at,
            'granted_by', ur.granted_by
          )
          order by ur.granted_at desc
        )
        from public.user_roles ur
        where ur.user_id = p.id
      ),
      '[]'::jsonb
    ) as roles
  from public.profiles p
  where exists (
    select 1 from public.user_roles caller
    where caller.user_id = auth.uid()
      and caller.role_key in ('super_admin','institution_admin')
  )
  order by p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 100), 500))
  offset greatest(0, coalesce(p_offset, 0));
$$;

comment on function public.list_users_with_roles is
  'Admin console user directory. Returns empty when caller is not super_admin or institution_admin.';

grant execute on function public.list_users_with_roles to authenticated;

-- ---- grant_role_to_user ----
create or replace function public.grant_role_to_user(
  p_target_user_id uuid,
  p_role_key text,
  p_workspace_id uuid default null,
  p_institution_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = v_actor
      and ur.role_key in ('super_admin','institution_admin')
  ) then
    raise exception 'unauthorized: insufficient role to grant roles';
  end if;

  -- Reject unknown role_keys up-front so we don't rely solely on the FK error.
  if not exists (select 1 from public.roles r where r.key = p_role_key) then
    raise exception 'invalid role_key: %', p_role_key;
  end if;

  -- Only super_admin may grant super_admin.
  if p_role_key = 'super_admin' and not exists (
    select 1 from public.user_roles ur
    where ur.user_id = v_actor
      and ur.role_key = 'super_admin'
  ) then
    raise exception 'unauthorized: only super_admin may grant super_admin';
  end if;

  -- Target must exist.
  if not exists (select 1 from public.profiles p where p.id = p_target_user_id) then
    raise exception 'target user not found';
  end if;

  insert into public.user_roles (user_id, role_key, workspace_id, institution_id, granted_by)
  values (p_target_user_id, p_role_key, p_workspace_id, p_institution_id, v_actor)
  on conflict (user_id, role_key, workspace_id, institution_id) do nothing;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    v_actor,
    'role_granted',
    'user',
    p_target_user_id,
    jsonb_build_object(
      'role_key', p_role_key,
      'workspace_id', p_workspace_id,
      'institution_id', p_institution_id
    )
  );

  return jsonb_build_object('success', true);
end;
$$;

comment on function public.grant_role_to_user is
  'Admin-only. Idempotent; on conflict returns success without a duplicate audit row (the audit is intentionally written on every call so misuse is still recorded).';

grant execute on function public.grant_role_to_user to authenticated;

-- ---- revoke_role_from_user ----
create or replace function public.revoke_role_from_user(
  p_target_user_id uuid,
  p_role_key text,
  p_workspace_id uuid default null,
  p_institution_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_deleted int;
  v_remaining_super_admins int;
begin
  if v_actor is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = v_actor
      and ur.role_key in ('super_admin','institution_admin')
  ) then
    raise exception 'unauthorized: insufficient role to revoke roles';
  end if;

  -- Only super_admin may revoke super_admin.
  if p_role_key = 'super_admin' and not exists (
    select 1 from public.user_roles ur
    where ur.user_id = v_actor
      and ur.role_key = 'super_admin'
  ) then
    raise exception 'unauthorized: only super_admin may revoke super_admin';
  end if;

  -- Safety guard: never leave zero super_admins in the system.
  if p_role_key = 'super_admin' then
    select count(*) into v_remaining_super_admins
    from public.user_roles
    where role_key = 'super_admin'
      and not (
        user_id = p_target_user_id
        and coalesce(workspace_id::text, '') = coalesce(p_workspace_id::text, '')
        and coalesce(institution_id::text, '') = coalesce(p_institution_id::text, '')
      );
    if v_remaining_super_admins = 0 then
      raise exception 'refused: cannot revoke the last super_admin';
    end if;
  end if;

  delete from public.user_roles
  where user_id = p_target_user_id
    and role_key = p_role_key
    and coalesce(workspace_id::text, '') = coalesce(p_workspace_id::text, '')
    and coalesce(institution_id::text, '') = coalesce(p_institution_id::text, '');

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    return jsonb_build_object('success', false, 'reason', 'not_found');
  end if;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    v_actor,
    'role_revoked',
    'user',
    p_target_user_id,
    jsonb_build_object(
      'role_key', p_role_key,
      'workspace_id', p_workspace_id,
      'institution_id', p_institution_id
    )
  );

  return jsonb_build_object('success', true);
end;
$$;

comment on function public.revoke_role_from_user is
  'Admin-only. Refuses to revoke the last remaining super_admin. Returns {success:false,reason:not_found} when the (user, role, scope) tuple has no matching row.';

grant execute on function public.revoke_role_from_user to authenticated;
