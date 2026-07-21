-- ============================================================
-- SquadRidge Invite-Only Auth Migration
-- 20260630_001_invite_only_auth.sql
-- ============================================================

-- ---- 1. profiles ----
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  status text not null default 'pending'
    check (status in ('pending','active','suspended')),
  primary_role text,
  onboarding_completed boolean not null default false,
  last_dashboard text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- elevated read: super_admin / institution_admin can read users within their scope
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key in ('super_admin','institution_admin')
    )
  );

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ---- 2. roles ----
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  description text
);

alter table public.roles enable row level security;
create policy "roles_select_authenticated" on public.roles
  for select using (auth.uid() is not null);

-- seed
insert into public.roles (key, label, description) values
  ('super_admin',       'Super Admin',       'Full system access'),
  ('institution_admin', 'Institution Admin',  'Manages an institution and its workspaces'),
  ('facilitator',      'Facilitator',        'Runs sessions and manages participants'),
  ('mediator',         'Mediator',           'Active conflict intervention specialist'),
  ('analyst',          'Analyst',            'Read-only analytics and reporting'),
  ('participant',      'Participant',         'Enrolled dialogue participant'),
  ('observer',         'Observer',           'Read-only approved observer')
on conflict (key) do update set label = excluded.label;

-- ---- 3. user_roles ----
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_key text not null references public.roles(key),
  workspace_id uuid,
  institution_id uuid,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  unique (user_id, role_key, workspace_id, institution_id)
);

alter table public.user_roles enable row level security;

create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "user_roles_select_admin" on public.user_roles
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key in ('super_admin','institution_admin')
    )
  );

-- ---- 4. institutions ----
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.institutions enable row level security;

create policy "institutions_select_member" on public.institutions
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.institution_id = institutions.id
    )
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );

-- ---- 5. workspaces ----
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  slug text not null,
  type text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

create policy "workspaces_select_member" on public.workspaces
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and (
          ur.workspace_id = workspaces.id
          or ur.institution_id = workspaces.institution_id
        )
    )
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );

-- ---- 6. invites ----
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null,
  invite_type text not null
    check (invite_type in ('participant','facilitator','mediator','analyst','institution_admin','observer','super_admin')),
  role_key text not null,
  institution_id uuid references public.institutions(id),
  workspace_id uuid references public.workspaces(id),
  issued_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  auth_user_id uuid references public.profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;

-- only admins or backend service role can create invites
create policy "invites_select_admin" on public.invites
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key in ('super_admin','institution_admin','facilitator')
    )
  );

create policy "invites_select_by_email" on public.invites
  for select using (
    email = (select email from public.profiles where id = auth.uid())
  );

-- ---- 7. access_requests ----
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  organization text,
  role_requested text,
  use_case text,
  status text not null default 'submitted'
    check (status in ('submitted','under_review','approved','rejected','waitlisted')),
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.access_requests enable row level security;

-- public can insert (anon)
create policy "access_requests_insert_public" on public.access_requests
  for insert with check (true);

-- admins/facilitators can read and update
create policy "access_requests_select_admin" on public.access_requests
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key in ('super_admin','institution_admin','facilitator')
    )
  );

create policy "access_requests_update_admin" on public.access_requests
  for update using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key in ('super_admin','institution_admin','facilitator')
    )
  );

create trigger trg_access_requests_updated_at
  before update on public.access_requests
  for each row execute procedure public.set_updated_at();

-- ---- 8. app_preferences ----
create table if not exists public.app_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_dashboard text,
  theme text,
  density text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_preferences enable row level security;

create policy "app_preferences_own" on public.app_preferences
  for all using (auth.uid() = user_id);

create trigger trg_app_preferences_updated_at
  before update on public.app_preferences
  for each row execute procedure public.set_updated_at();

-- ---- 9. audit_events ----
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_events enable row level security;

create policy "audit_events_select_admin" on public.audit_events
  for select using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );

-- insert only via trusted RPC / service role
create policy "audit_events_insert_service" on public.audit_events
  for insert with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role_key = 'super_admin'
    )
  );
