-- pgTAP: v2 session audit trail and workflow notifications

begin;
select plan(4);

-- Tables exist
select has_table('public', 'session_audit_events', 'session_audit_events table exists');
select has_table('public', 'workflow_notifications', 'workflow_notifications table exists');

-- RPCs exist
select has_function(
  'public',
  'export_session_audit_trail',
  array['uuid'],
  'export_session_audit_trail RPC exists'
);

select has_function(
  'public',
  'facilitator_set_participant_verification',
  array['uuid', 'text'],
  'facilitator_set_participant_verification RPC exists'
);

select * from finish();
rollback;
