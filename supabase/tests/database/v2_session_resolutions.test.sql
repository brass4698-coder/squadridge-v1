begin;
select plan(4);

select has_table('public', 'session_resolution_items', 'session_resolution_items exists');
select has_table('public', 'session_resolution_supports', 'session_resolution_supports exists');

select policies_are(
  'public',
  'session_resolution_items',
  array['Facilitator manages session resolution items'],
  'resolution items RLS'
);

select has_function(
  'public',
  'participant_support_resolution',
  array['text', 'uuid'],
  'participant_support_resolution RPC exists'
);

select * from finish();
rollback;
