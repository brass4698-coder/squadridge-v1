-- Serialize participant inserts per session so concurrent invites cannot
-- overshoot max_participants / the hard ceiling of 12.
-- Preserves the calm ROOM_FULL exception contract.

create or replace function public.enforce_session_participant_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max int;
  v_count int;
begin
  -- Lock the parent session row for the remainder of this transaction.
  -- Concurrent BEFORE INSERT triggers for the same session block here,
  -- so the subsequent count cannot race past the ceiling.
  select s.max_participants
    into v_max
  from public.sessions s
  where s.id = new.session_id
  for update;

  if not found or v_max is null then
    raise exception 'SESSION_NOT_FOUND';
  end if;

  select count(*)::int into v_count
  from public.participants
  where session_id = new.session_id
    and (tg_op = 'INSERT' or id <> new.id);

  if v_count >= v_max then
    raise exception 'ROOM_FULL: this room is limited to % participants.', v_max;
  end if;

  if v_count >= 12 then
    raise exception 'ROOM_FULL: rooms cannot exceed 12 participants.';
  end if;

  return new;
end;
$$;

comment on function public.enforce_session_participant_capacity() is
  'BEFORE INSERT capacity guard: SELECT sessions FOR UPDATE then count participants; raises ROOM_FULL.';

-- Ensure the trigger remains attached (idempotent recreate).
drop trigger if exists trg_participants_capacity on public.participants;
create trigger trg_participants_capacity
  before insert on public.participants
  for each row execute function public.enforce_session_participant_capacity();
