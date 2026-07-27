-- pgTAP: room capacity ceiling, locking guard, and deck/pacing helpers
begin;
select plan(9);

select has_function(
  'public',
  'has_deck_access',
  'has_deck_access RPC exists'
);

select has_function(
  'public',
  'facilitator_set_room_pacing',
  array['uuid', 'text', 'text', 'integer'],
  'facilitator_set_room_pacing RPC exists'
);

select has_function(
  'public',
  'record_participant_reason',
  array['text', 'text'],
  'record_participant_reason RPC exists'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'sessions'
      and c.conname = 'sessions_max_participants_range'
  ),
  'sessions_max_participants_range check exists'
);

select has_function(
  'public',
  'enforce_session_participant_capacity',
  'enforce_session_participant_capacity trigger fn exists'
);

select ok(
  position('for update' in lower(pg_get_functiondef('public.enforce_session_participant_capacity'::regproc))) > 0,
  'capacity guard locks sessions row with FOR UPDATE'
);

select ok(
  exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    where c.relname = 'participants'
      and t.tgname = 'trg_participants_capacity'
      and not t.tgisinternal
  ),
  'trg_participants_capacity is attached to participants'
);

-- Behavioral: fill to max then assert ROOM_FULL (no overshoot).
-- Concurrent clients are serialized by the FOR UPDATE in the trigger body above;
-- under a single connection we still prove the ceiling is enforced.
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'authenticated',
  'authenticated',
  'capacity-lock-facilitator@example.test',
  '',
  now(),
  now(),
  now()
)
on conflict (id) do nothing;

insert into public.sessions (
  id,
  facilitator_id,
  title,
  conflict_type,
  language,
  max_participants,
  status,
  identity_verification_required
)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Capacity lock probe',
  'Community & civic',
  'English',
  2,
  'setup',
  false
)
on conflict (id) do nothing;

insert into public.participants (session_id, codename, invite_token)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'P1', 'capacitylocktoken000000000001'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'P2', 'capacitylocktoken000000000002');

select throws_ilike(
  $$
    insert into public.participants (session_id, codename, invite_token)
    values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'P3', 'capacitylocktoken000000000003')
  $$,
  '%ROOM_FULL%',
  'third insert past max_participants raises ROOM_FULL'
);

select is(
  (select count(*)::int from public.participants where session_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  2,
  'participant count does not overshoot max_participants'
);

select * from finish();
rollback;
