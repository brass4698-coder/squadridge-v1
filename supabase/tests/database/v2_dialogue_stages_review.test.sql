-- pgTAP: dialogue stages + participant outcome review RPCs
begin;
select plan(6);

select has_function(
  'public',
  'facilitator_advance_dialogue_stage',
  array['uuid', 'text'],
  'facilitator_advance_dialogue_stage exists'
);

select has_function(
  'public',
  'facilitator_seed_outcome_approvals',
  array['uuid'],
  'facilitator_seed_outcome_approvals exists'
);

select has_function(
  'public',
  'participant_get_outcome_review',
  array['text'],
  'participant_get_outcome_review exists'
);

select has_function(
  'public',
  'participant_review_outcome',
  array['text', 'text', 'text'],
  'participant_review_outcome exists'
);

select has_function(
  'public',
  'facilitator_set_approval_status',
  array['uuid', 'text'],
  'facilitator_set_approval_status exists'
);

select ok(
  exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'sessions'
      and c.conname = 'sessions_dialogue_stage_check'
  ),
  'sessions_dialogue_stage_check exists'
);

select * from finish();
rollback;
