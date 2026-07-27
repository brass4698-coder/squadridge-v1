-- Fix infinite recursion when evaluating profiles/user_roles RLS together.
-- profiles_select_admin (and similar) queries user_roles; user_roles_select_admin
-- also queries user_roles under RLS → "infinite recursion detected in policy
-- for relation user_roles", which blocks even profiles_select_own.

create or replace function public.auth_user_has_role_keys(p_role_keys text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key = any (p_role_keys)
  );
$$;

comment on function public.auth_user_has_role_keys(text[]) is
  'RLS helper: role check without re-entering user_roles policies.';

revoke all on function public.auth_user_has_role_keys(text[]) from public;
grant execute on function public.auth_user_has_role_keys(text[]) to authenticated;
grant execute on function public.auth_user_has_role_keys(text[]) to anon;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    public.auth_user_has_role_keys(array['super_admin', 'institution_admin'])
  );

drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin" on public.user_roles
  for select using (
    public.auth_user_has_role_keys(array['super_admin', 'institution_admin'])
  );

drop policy if exists "super_admin_manage_roles" on public.user_roles;
create policy "super_admin_manage_roles" on public.user_roles
  for all using (
    public.auth_user_has_role_keys(array['super_admin'])
  )
  with check (
    public.auth_user_has_role_keys(array['super_admin'])
  );
