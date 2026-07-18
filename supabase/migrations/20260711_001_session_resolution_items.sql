-- v2 session resolution workflow: propose → support → shortlist → outcome import
-- Anchors city community safety and institutional coordination sessions.

create table if not exists public.session_resolution_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  title text not null,
  description text,
  owner_org text,
  target_days int,
  support_count int not null default 0,
  rank_order int,
  status text not null default 'proposed'
    check (status in ('proposed', 'shortlisted', 'archived')),
  proposed_by_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_resolution_items_target_days_positive
    check (target_days is null or target_days > 0),
  constraint session_resolution_items_rank_positive
    check (rank_order is null or rank_order > 0)
);

comment on table public.session_resolution_items is
  'Structured intervention proposals for v2 sessions — ranked shortlist feeds outcome workspace.';

create index session_resolution_items_session_idx
  on public.session_resolution_items (session_id, status, rank_order nulls last);

create table if not exists public.session_resolution_supports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.session_resolution_items (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint session_resolution_supports_unique_participant unique (item_id, participant_id)
);

comment on table public.session_resolution_supports is
  'One support vote per verified participant per resolution item.';

create index session_resolution_supports_item_idx
  on public.session_resolution_supports (item_id);

-- Keep support_count in sync
create or replace function public.refresh_session_resolution_support_count()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.session_resolution_items
    set support_count = support_count + 1,
        updated_at = now()
    where id = NEW.item_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.session_resolution_items
    set support_count = greatest(0, support_count - 1),
        updated_at = now()
    where id = OLD.item_id;
    return OLD;
  end if;
  return null;
end;
$$;

create trigger session_resolution_supports_count_trg
after insert or delete on public.session_resolution_supports
for each row execute function public.refresh_session_resolution_support_count();

alter table public.session_resolution_items enable row level security;
alter table public.session_resolution_supports enable row level security;

create policy "Facilitator manages session resolution items"
  on public.session_resolution_items for all
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

create policy "Facilitator reads session resolution supports"
  on public.session_resolution_supports for select
  using (
    exists (
      select 1
      from public.session_resolution_items i
      join public.sessions s on s.id = i.session_id
      where i.id = item_id and s.facilitator_id = auth.uid()
    )
  );

-- Participant token RPCs (anon-friendly)
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
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;
  v_participant_id := (v_ctx->>'participant_id')::uuid;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('ok', false, 'error', 'NOT_VERIFIED');
  end if;

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

revoke all on function public.list_session_resolutions_for_participant(text) from public;
grant execute on function public.list_session_resolutions_for_participant(text) to anon, authenticated;

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
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'verification_status') <> 'verified' then
    return jsonb_build_object('ok', false, 'error', 'NOT_VERIFIED');
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

revoke all on function public.participant_support_resolution(text, uuid) from public;
grant execute on function public.participant_support_resolution(text, uuid) to anon, authenticated;

grant select, insert, update, delete on table public.session_resolution_items to authenticated;
grant select on table public.session_resolution_supports to authenticated;
grant all on table public.session_resolution_items to service_role;
grant all on table public.session_resolution_supports to service_role;
