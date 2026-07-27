-- pgTAP: session phase timer fields, floor RPC, budget helper, audit allowlist
begin;
select plan(12);

select has_column('public', 'sessions', 'phase_started_at', 'sessions.phase_started_at exists');
select has_column('public', 'sessions', 'phase_duration_seconds', 'sessions.phase_duration_seconds exists');
select has_column('public', 'sessions', 'phase_budgets', 'sessions.phase_budgets exists');
select has_column('public', 'sessions', 'session_ends_at', 'sessions.session_ends_at exists');
select has_column('public', 'sessions', 'phase_timer_state', 'sessions.phase_timer_state exists');
select has_column('public', 'sessions', 'floor_holder_participant_id', 'sessions.floor_holder_participant_id exists');
select has_column('public', 'participants', 'tone_signal', 'participants.tone_signal exists');

select has_function(
  'public',
  'facilitator_start_phase_timer',
  array['uuid', 'integer'],
  'facilitator_start_phase_timer exists'
);

select has_function(
  'public',
  'facilitator_extend_phase_timer',
  array['uuid', 'integer', 'text'],
  'facilitator_extend_phase_timer exists'
);

select has_function(
  'public',
  'facilitator_pause_phase_timer',
  array['uuid', 'text'],
  'facilitator_pause_phase_timer exists'
);

select has_function(
  'public',
  'facilitator_set_floor',
  array['uuid', 'uuid'],
  'facilitator_set_floor exists'
);

select ok(
  (public.default_phase_budgets_for_template('ngo_deliberation')->>'story')::int
    > (public.default_phase_budgets_for_template('community_mediation')->>'story')::int,
  'ngo_deliberation story budget differs from community_mediation'
);

select * from finish();
rollback;
