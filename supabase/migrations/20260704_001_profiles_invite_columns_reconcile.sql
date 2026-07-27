-- ============================================================
-- Reconcile phase1 profiles with invite-only auth columns.
-- The invite-only migration used CREATE TABLE IF NOT EXISTS and
-- never ALTERed existing phase1 profiles — accept_invite and
-- AuthContext expect email, status, primary_role, etc.
-- ============================================================

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists status text;
alter table public.profiles add column if not exists primary_role text;
alter table public.profiles add column if not exists onboarding_completed boolean;
alter table public.profiles add column if not exists last_dashboard text;

-- Defaults for new rows on legacy schema
update public.profiles
set status = coalesce(status, 'active')
where status is null;

update public.profiles
set onboarding_completed = (onboarding_completed_at is not null)
where onboarding_completed is null;

alter table public.profiles
  alter column status set default 'pending';

alter table public.profiles
  alter column onboarding_completed set default false;

-- Backfill email from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or trim(p.email) = '');

-- Backfill display_name from callsign when present
update public.profiles
set display_name = nullif(trim(callsign), '')
where display_name is null
  and callsign is not null
  and trim(callsign) <> '';

-- Legacy onboarded operators are active
update public.profiles
set
  status = 'active',
  onboarding_completed = true
where onboarding_completed_at is not null
  and status = 'pending';

do $$
begin
  alter table public.profiles
    add constraint profiles_status_check
    check (status in ('pending', 'active', 'suspended'));
exception
  when duplicate_object then null;
end;
$$;

create unique index if not exists profiles_email_lower_unique_idx
  on public.profiles (lower(email))
  where email is not null and trim(email) <> '';

-- Harden accept_invite: caller must match invite email; ignore client user id
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
