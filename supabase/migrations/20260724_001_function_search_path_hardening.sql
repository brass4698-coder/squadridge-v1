-- Harden function search_path for advisor WARN: function_search_path_mutable.
-- public.uuid_generate_v4 here is the app wrapper (gen_random_uuid), not uuid-ossp.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.outcome_anchor_payload(p_outcome public.outcome_records)
returns text
language sql
immutable
set search_path to public
as $$
  select jsonb_build_object(
    'v', 1,
    'session_id', p_outcome.session_id,
    'summary', coalesce(p_outcome.summary, ''),
    'agreed_terms', coalesce(p_outcome.agreed_terms, ''),
    'pending_items', coalesce(p_outcome.pending_items, '')
  )::text;
$$;

create or replace function public.uuid_generate_v4()
returns uuid
language sql
set search_path to public
as $$
  select gen_random_uuid();
$$;

-- Explicit pin (reliable across recreate paths)
alter function public.set_updated_at() set search_path to public;
alter function public.outcome_anchor_payload(public.outcome_records) set search_path to public;
alter function public.uuid_generate_v4() set search_path to public;

comment on function public.outcome_anchor_payload(public.outcome_records) is
  'Canonical content-only payload for release integrity anchors. search_path pinned.';
