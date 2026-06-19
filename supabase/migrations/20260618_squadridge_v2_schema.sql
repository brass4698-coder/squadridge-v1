-- SquadRidge v2 schema migration
-- Phase 7: sessions, participants, verification, outcomes, access_requests

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- sessions
-- ─────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  facilitator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  conflict_type text not null,
  language text not null default 'English',
  max_participants int not null default 2,
  eligibility_notes text,
  identity_verification_required boolean not null default true,
  outcome_public boolean not null default false,
  status text not null default 'setup'
    check (status in ('setup','open','live','paused','ended','released')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Facilitator owns their sessions"
  on public.sessions for all
  using (facilitator_id = auth.uid())
  with check (facilitator_id = auth.uid());

create policy "Public can read released sessions"
  on public.sessions for select
  using (status = 'released' and outcome_public = true);

-- ─────────────────────────────────────────────
-- participants
-- ─────────────────────────────────────────────
create table if not exists public.participants (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  codename text not null,
  invite_token text not null unique,
  invite_used boolean not null default false,
  email_hash text, -- SHA-256 of email, never plaintext
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','denied')),
  document_submitted boolean not null default false,
  consented_at timestamptz,
  admitted_at timestamptz,
  left_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.participants enable row level security;

create policy "Facilitator manages participants in their sessions"
  on public.participants for all
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

-- ─────────────────────────────────────────────
-- verification_requests
-- ─────────────────────────────────────────────
create table if not exists public.verification_requests (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  document_type text,
  storage_path text, -- path in Supabase Storage, not public URL
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.verification_requests enable row level security;

create policy "Facilitator reviews verification in their sessions"
  on public.verification_requests for all
  using (
    exists (
      select 1 from public.participants p
      join public.sessions s on s.id = p.session_id
      where p.id = participant_id and s.facilitator_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- outcome_records
-- ─────────────────────────────────────────────
create table if not exists public.outcome_records (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  summary text not null,
  agreed_terms text,
  pending_items text,
  facilitator_notes text, -- never published
  status text not null default 'draft'
    check (status in ('draft','pending_approval','approved','published')),
  published_at timestamptz,
  ledger_sha text, -- SHA-256 of published outcome JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.outcome_records enable row level security;

create policy "Facilitator manages outcomes in their sessions"
  on public.outcome_records for all
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

create policy "Public can read published outcomes"
  on public.outcome_records for select
  using (status = 'published');

-- ─────────────────────────────────────────────
-- outcome_approvals
-- ─────────────────────────────────────────────
create table if not exists public.outcome_approvals (
  id uuid primary key default uuid_generate_v4(),
  outcome_id uuid not null references public.outcome_records(id) on delete cascade,
  approver_label text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.outcome_approvals enable row level security;

create policy "Facilitator manages approvals in their sessions"
  on public.outcome_approvals for all
  using (
    exists (
      select 1 from public.outcome_records o
      join public.sessions s on s.id = o.session_id
      where o.id = outcome_id and s.facilitator_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- access_requests (pilot applications)
-- ─────────────────────────────────────────────
create table if not exists public.access_requests (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  organisation text,
  email text not null,
  use_case text not null,
  description text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.access_requests enable row level security;

-- Anonymous inserts allowed (public form); only admins can read
create policy "Anyone can submit access request"
  on public.access_requests for insert
  with check (true);

create policy "Admins can read access requests"
  on public.access_requests for select
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- session_messages (for real-time chat)
-- ─────────────────────────────────────────────
create table if not exists public.session_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  sender_label text not null, -- 'Facilitator' | 'Participant A' etc. Never PII
  sender_role text not null check (sender_role in ('facilitator','participant')),
  body text not null,
  sent_at timestamptz not null default now()
);

alter table public.session_messages enable row level security;

create policy "Facilitator can read and write messages in their sessions"
  on public.session_messages for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
  );

-- Realtime
alter publication supabase_realtime add table public.session_messages;
alter publication supabase_realtime add table public.participants;
