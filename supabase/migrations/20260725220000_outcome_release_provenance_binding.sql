-- Release-drift hardening: bind approvals and facilitator authorship attestation to the
-- exact instrument text that gets anchored, and stop publishing facilitator-only notes.
--
-- Problem this closes: `outcome_records` content could be edited after participants
-- approved it, so `ledger_sha` could anchor text nobody reviewed. Approvals now carry the
-- content hash they were given, any text revision resets them, and release refuses to
-- publish unless every approval and the facilitator attestation match the released bytes.
--
-- Append-only. No new tables; column privileges tightened on an existing one.

-- ─────────────────────────────────────────────
-- 1) Audit event allowlist
-- ─────────────────────────────────────────────

alter table public.session_audit_events
  drop constraint if exists session_audit_events_type_check;

alter table public.session_audit_events
  add constraint session_audit_events_type_check check (
    event_type in (
      'verification_submitted',
      'participant_verified',
      'participant_denied',
      'room_opened',
      'room_entered',
      'room_paused',
      'room_ended',
      'prompt_posted',
      'approval_given',
      'approval_requested',
      'approval_disputed',
      'approvals_reset',
      'authorship_attested',
      'dialogue_stage_advanced',
      'record_released',
      'release_failed'
    )
  );

-- ─────────────────────────────────────────────
-- 2) Provenance columns
-- ─────────────────────────────────────────────

alter table public.outcome_approvals
  add column if not exists reviewed_content_sha text;

alter table public.outcome_records
  add column if not exists authorship_attested_at timestamptz,
  add column if not exists authorship_attested_by uuid references auth.users(id) on delete set null,
  add column if not exists attested_content_sha text,
  add column if not exists authorship_statement text;

comment on column public.outcome_approvals.reviewed_content_sha is
  'SHA-256 of the instrument text this approval was given against. Stamped automatically; cleared whenever the approval is not approved.';
comment on column public.outcome_records.authorship_attested_at is
  'When the facilitator attested authorship of the current instrument text. Cleared automatically on any text revision.';
comment on column public.outcome_records.authorship_attested_by is
  'Facilitator who attested authorship. Not readable by anon/authenticated clients.';
comment on column public.outcome_records.attested_content_sha is
  'Instrument hash covered by the authorship attestation. Must equal the release hash.';
comment on column public.outcome_records.authorship_statement is
  'Facilitator-written provenance statement recorded with the attestation.';

-- ─────────────────────────────────────────────
-- 3) Canonical content hash (same payload as ledger_sha)
-- ─────────────────────────────────────────────

create or replace function public.outcome_content_sha(p_outcome public.outcome_records)
returns text
language sql
stable
set search_path = public
as $$
  select encode(extensions.digest(public.outcome_anchor_payload(p_outcome), 'sha256'), 'hex');
$$;

comment on function public.outcome_content_sha(public.outcome_records) is
  'SHA-256 of outcome_anchor_payload_v1 — the value release_outcome writes to ledger_sha.';

-- ─────────────────────────────────────────────
-- 4) Approvals are always bound to the text they reviewed
-- ─────────────────────────────────────────────

create or replace function public.stamp_outcome_approval_content_sha()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
begin
  if NEW.status = 'approved' then
    if TG_OP = 'INSERT'
       or OLD.status is distinct from 'approved'
       or NEW.reviewed_content_sha is null then
      select * into v_outcome from public.outcome_records where id = NEW.outcome_id;
      if found then
        NEW.reviewed_content_sha := public.outcome_content_sha(v_outcome);
      end if;
    end if;
  else
    NEW.reviewed_content_sha := null;
  end if;

  return NEW;
end;
$$;

drop trigger if exists outcome_approvals_stamp_content_sha on public.outcome_approvals;
create trigger outcome_approvals_stamp_content_sha
  before insert or update on public.outcome_approvals
  for each row execute function public.stamp_outcome_approval_content_sha();

-- ─────────────────────────────────────────────
-- 5) Revising the instrument invalidates attestation + approvals
-- ─────────────────────────────────────────────

create or replace function public.clear_outcome_attestation_on_revision()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if NEW.summary is distinct from OLD.summary
     or NEW.agreed_terms is distinct from OLD.agreed_terms
     or NEW.pending_items is distinct from OLD.pending_items then
    NEW.authorship_attested_at := null;
    NEW.authorship_attested_by := null;
    NEW.attested_content_sha := null;
  end if;

  return NEW;
end;
$$;

drop trigger if exists outcome_records_clear_attestation on public.outcome_records;
create trigger outcome_records_clear_attestation
  before update on public.outcome_records
  for each row execute function public.clear_outcome_attestation_on_revision();

create or replace function public.reset_outcome_approvals_on_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reset int := 0;
begin
  if NEW.summary is distinct from OLD.summary
     or NEW.agreed_terms is distinct from OLD.agreed_terms
     or NEW.pending_items is distinct from OLD.pending_items then
    update public.outcome_approvals
    set status = 'pending',
        approved_at = null,
        reviewed_content_sha = null
    where outcome_id = NEW.id
      and status <> 'pending';

    get diagnostics v_reset = row_count;

    if v_reset > 0 then
      perform public._log_session_audit_event_internal(
        NEW.session_id,
        'approvals_reset',
        'facilitator',
        auth.uid(),
        jsonb_build_object(
          'outcome_id', NEW.id,
          'reset_count', v_reset,
          'reason', 'INSTRUMENT_TEXT_REVISED'
        )
      );
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists outcome_records_reset_approvals on public.outcome_records;
create trigger outcome_records_reset_approvals
  after update on public.outcome_records
  for each row execute function public.reset_outcome_approvals_on_revision();

-- ─────────────────────────────────────────────
-- 6) Facilitator authorship attestation
-- ─────────────────────────────────────────────

create or replace function public.facilitator_attest_outcome_authorship(
  p_outcome_id uuid,
  p_statement text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_sha text;
  v_statement text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_outcome.status = 'published' then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_RELEASED');
  end if;

  if length(trim(coalesce(v_outcome.summary, ''))) < 8 then
    return jsonb_build_object('ok', false, 'error', 'SUMMARY_REQUIRED');
  end if;

  v_sha := public.outcome_content_sha(v_outcome);
  v_statement := coalesce(
    nullif(left(trim(coalesce(p_statement, '')), 500), ''),
    'Facilitator-authored instrument. Not a verbatim transcript of room dialogue.'
  );

  update public.outcome_records
  set authorship_attested_at = now(),
      authorship_attested_by = auth.uid(),
      attested_content_sha = v_sha,
      authorship_statement = v_statement,
      updated_at = now()
  where id = p_outcome_id;

  perform public._log_session_audit_event_internal(
    v_outcome.session_id,
    'authorship_attested',
    'facilitator',
    auth.uid(),
    jsonb_build_object('outcome_id', p_outcome_id, 'content_sha', v_sha)
  );

  return jsonb_build_object(
    'ok', true,
    'outcome_id', p_outcome_id,
    'content_sha', v_sha,
    'authorship_statement', v_statement
  );
end;
$$;

revoke all on function public.facilitator_attest_outcome_authorship(uuid, text) from public;
grant execute on function public.facilitator_attest_outcome_authorship(uuid, text) to authenticated;

comment on function public.facilitator_attest_outcome_authorship(uuid, text) is
  'Records a facilitator authorship attestation bound to the current instrument hash. Any later text edit clears it.';

-- ─────────────────────────────────────────────
-- 7) Release readiness (facilitator console)
-- ─────────────────────────────────────────────

create or replace function public.facilitator_get_release_readiness(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_sha text;
  v_total int := 0;
  v_approved int := 0;
  v_rejected int := 0;
  v_stale int := 0;
  v_verbatim boolean := false;
  v_attested boolean := false;
  v_blocking text := null;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  v_sha := public.outcome_content_sha(v_outcome);
  v_attested := v_outcome.authorship_attested_at is not null
    and v_outcome.attested_content_sha = v_sha;

  select
    count(*),
    count(*) filter (where status = 'approved'),
    count(*) filter (where status = 'rejected'),
    count(*) filter (
      where status = 'approved'
        and (reviewed_content_sha is null or reviewed_content_sha <> v_sha)
    )
  into v_total, v_approved, v_rejected, v_stale
  from public.outcome_approvals
  where outcome_id = p_outcome_id;

  v_verbatim := public.outcome_contains_verbatim_room_content(p_outcome_id);

  if v_session.status <> 'ended' then
    v_blocking := 'SESSION_NOT_ENDED';
  elsif length(trim(coalesce(v_outcome.summary, ''))) < 8 then
    v_blocking := 'SUMMARY_REQUIRED';
  elsif v_total = 0 then
    v_blocking := 'APPROVALS_REQUIRED';
  elsif v_approved < v_total then
    v_blocking := 'APPROVALS_PENDING';
  elsif v_verbatim then
    v_blocking := 'VERBATIM_ROOM_CONTENT';
  elsif v_outcome.authorship_attested_at is null then
    v_blocking := 'AUTHORSHIP_ATTESTATION_REQUIRED';
  elsif not v_attested then
    v_blocking := 'ATTESTATION_STALE';
  elsif v_stale > 0 then
    v_blocking := 'CONTENT_CHANGED_AFTER_APPROVAL';
  end if;

  return jsonb_build_object(
    'ok', true,
    'outcome_id', p_outcome_id,
    'content_sha', v_sha,
    'outcome_status', v_outcome.status,
    'session_status', v_session.status,
    'outcome_public', v_session.outcome_public,
    'authorship_attested', v_attested,
    'authorship_attested_at', v_outcome.authorship_attested_at,
    'authorship_statement', v_outcome.authorship_statement,
    'approvals_total', v_total,
    'approvals_approved', v_approved,
    'approvals_rejected', v_rejected,
    'approvals_stale', v_stale,
    'verbatim_conflict', v_verbatim,
    'can_release', v_blocking is null,
    'blocking_reason', v_blocking
  );
end;
$$;

revoke all on function public.facilitator_get_release_readiness(uuid) from public;
grant execute on function public.facilitator_get_release_readiness(uuid) to authenticated;

comment on function public.facilitator_get_release_readiness(uuid) is
  'Facilitator-only release preflight: instrument hash, attestation freshness, approval binding, verbatim guard.';

-- ─────────────────────────────────────────────
-- 8) Facilitator-only notes read path
--    (notes are no longer selectable by anon/authenticated columns)
-- ─────────────────────────────────────────────

create or replace function public.facilitator_get_outcome_notes(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  return jsonb_build_object(
    'ok', true,
    'outcome_id', p_outcome_id,
    'facilitator_notes', v_outcome.facilitator_notes
  );
end;
$$;

revoke all on function public.facilitator_get_outcome_notes(uuid) from public;
grant execute on function public.facilitator_get_outcome_notes(uuid) to authenticated;

-- The published-outcome read policy is row-scoped, so every column of a released record
-- was reachable by API clients — including `facilitator_notes`, documented as never
-- published. Column privileges are the only lever that filters columns, so table-wide
-- SELECT is replaced with an explicit public-safe column list. New columns are invisible
-- to clients until granted, which fails closed.
revoke select on public.outcome_records from anon, authenticated;

grant select (
  id,
  session_id,
  summary,
  agreed_terms,
  pending_items,
  status,
  published_at,
  ledger_sha,
  timestamp_token,
  timestamp_authority,
  timestamped_at,
  timestamp_status,
  authorship_attested_at,
  attested_content_sha,
  authorship_statement,
  created_at,
  updated_at
) on public.outcome_records to anon, authenticated;

-- ─────────────────────────────────────────────
-- 9) Release: refuse to anchor text that drifted from what was reviewed
-- ─────────────────────────────────────────────

create or replace function public.release_outcome(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_pending int;
  v_approval_count int;
  v_unbound int;
  v_sha text;
  v_notify_body text;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;
  if v_session.facilitator_id is distinct from auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_session.status <> 'ended' then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'SESSION_NOT_ENDED')
    );
    return jsonb_build_object('ok', false, 'error', 'SESSION_NOT_ENDED');
  end if;

  if length(trim(coalesce(v_outcome.summary, ''))) < 8 then
    return jsonb_build_object('ok', false, 'error', 'SUMMARY_REQUIRED');
  end if;

  select count(*), count(*) filter (where status <> 'approved')
  into v_approval_count, v_pending
  from public.outcome_approvals
  where outcome_id = p_outcome_id;

  if v_approval_count = 0 then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'APPROVALS_REQUIRED')
    );
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_REQUIRED');
  end if;

  if v_pending > 0 then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'APPROVALS_PENDING')
    );
    return jsonb_build_object('ok', false, 'error', 'APPROVALS_PENDING');
  end if;

  if public.outcome_contains_verbatim_room_content(p_outcome_id) then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'VERBATIM_ROOM_CONTENT')
    );
    return jsonb_build_object('ok', false, 'error', 'VERBATIM_ROOM_CONTENT');
  end if;

  v_sha := public.outcome_content_sha(v_outcome);

  if v_outcome.authorship_attested_at is null then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'AUTHORSHIP_ATTESTATION_REQUIRED')
    );
    return jsonb_build_object('ok', false, 'error', 'AUTHORSHIP_ATTESTATION_REQUIRED');
  end if;

  if v_outcome.attested_content_sha is distinct from v_sha then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'ATTESTATION_STALE')
    );
    return jsonb_build_object('ok', false, 'error', 'ATTESTATION_STALE');
  end if;

  select count(*)
  into v_unbound
  from public.outcome_approvals
  where outcome_id = p_outcome_id
    and status = 'approved'
    and (reviewed_content_sha is null or reviewed_content_sha <> v_sha);

  if v_unbound > 0 then
    perform public._log_session_audit_event_internal(
      v_outcome.session_id,
      'release_failed',
      'facilitator',
      auth.uid(),
      jsonb_build_object('error', 'CONTENT_CHANGED_AFTER_APPROVAL', 'unbound_approvals', v_unbound)
    );
    return jsonb_build_object(
      'ok', false,
      'error', 'CONTENT_CHANGED_AFTER_APPROVAL',
      'unbound_approvals', v_unbound
    );
  end if;

  update public.outcome_records
  set status = 'published',
      published_at = now(),
      ledger_sha = v_sha,
      updated_at = now()
  where id = p_outcome_id;

  perform set_config('app.allow_session_release', 'true', true);

  update public.sessions
  set status = 'released',
      updated_at = now()
  where id = v_outcome.session_id;

  perform public._log_session_audit_event_internal(
    v_outcome.session_id,
    'record_released',
    'facilitator',
    auth.uid(),
    jsonb_build_object(
      'outcome_id', p_outcome_id,
      'ledger_sha', v_sha,
      'outcome_public', v_session.outcome_public,
      'approvals_bound', v_approval_count,
      'authorship_attested_at', v_outcome.authorship_attested_at
    )
  );

  if v_session.outcome_public then
    v_notify_body := coalesce(v_session.title, 'Session')
      || ' outcome is on the public ledger with a verification anchor.';
  else
    v_notify_body := coalesce(v_session.title, 'Session')
      || ' private anchored record was released (not listed on the public ledger).';
  end if;

  perform public.notify_facilitator_workflow(
    v_outcome.session_id,
    'record_released',
    'Record released',
    v_notify_body
  );

  return jsonb_build_object(
    'ok', true,
    'ledger_sha', v_sha,
    'outcome_id', p_outcome_id,
    'session_id', v_outcome.session_id,
    'outcome_public', v_session.outcome_public
  );
end;
$$;

revoke all on function public.release_outcome(uuid) from public;
grant execute on function public.release_outcome(uuid) to authenticated;

comment on function public.release_outcome(uuid) is
  'Releases an approved instrument. Requires ended session, complete approvals bound to the current text, a current facilitator authorship attestation, and no verbatim room content.';

-- ─────────────────────────────────────────────
-- 10) Anchor verification reports attestation state (no identity)
-- ─────────────────────────────────────────────

create or replace function public.verify_outcome_anchor(p_outcome_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session public.sessions%rowtype;
  v_expected text;
  v_can_read boolean := false;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  select * into v_session from public.sessions where id = v_outcome.session_id;

  if v_outcome.status = 'published'
     and v_session.outcome_public = true
     and v_session.status = 'released' then
    v_can_read := true;
  elsif auth.uid() is not null
        and v_session.facilitator_id = auth.uid() then
    v_can_read := true;
  end if;

  if not v_can_read then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;

  if v_outcome.ledger_sha is null then
    return jsonb_build_object('ok', false, 'error', 'NO_ANCHOR');
  end if;

  v_expected := encode(extensions.digest(public.outcome_anchor_payload(v_outcome), 'sha256'), 'hex');

  return jsonb_build_object(
    'ok', true,
    'match', v_expected = v_outcome.ledger_sha,
    'ledger_sha', v_outcome.ledger_sha,
    'recomputed_sha', v_expected,
    'outcome_public', v_session.outcome_public,
    'algorithm', 'SHA-256',
    'canonical', 'outcome_anchor_payload_v1',
    'authorship_attested',
      v_outcome.authorship_attested_at is not null
      and v_outcome.attested_content_sha = v_expected,
    'authorship_attested_at', v_outcome.authorship_attested_at,
    'trusted_timestamp', false
  );
end;
$$;

revoke all on function public.verify_outcome_anchor(uuid) from public;
grant execute on function public.verify_outcome_anchor(uuid) to anon, authenticated;

comment on function public.verify_outcome_anchor(uuid) is
  'Recomputes the content-only SHA-256 for a released outcome and reports authorship-attestation state. trusted_timestamp is always false until a live RFC 3161 path exists.';

-- ─────────────────────────────────────────────
-- 11) Participant review returns the hash it is deciding on
-- ─────────────────────────────────────────────

create or replace function public.participant_get_outcome_review(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_outcome public.outcome_records%rowtype;
  v_approval public.outcome_approvals%rowtype;
  v_session public.sessions%rowtype;
  v_sha text;
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select * into v_session
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  select * into v_outcome
  from public.outcome_records
  where session_id = v_session.id
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'valid', true,
      'available', false,
      'error', 'NO_OUTCOME'
    );
  end if;

  if v_outcome.status not in ('pending_approval', 'approved', 'published') then
    return jsonb_build_object(
      'valid', true,
      'available', false,
      'outcome_status', v_outcome.status,
      'message', 'The facilitator has not opened review yet.'
    );
  end if;

  select * into v_approval
  from public.outcome_approvals
  where outcome_id = v_outcome.id
    and participant_id = (v_ctx->>'participant_id')::uuid;

  v_sha := public.outcome_content_sha(v_outcome);

  return jsonb_build_object(
    'valid', true,
    'available', true,
    'outcome_id', v_outcome.id,
    'outcome_status', v_outcome.status,
    'summary', v_outcome.summary,
    'agreed_terms', v_outcome.agreed_terms,
    'pending_items', v_outcome.pending_items,
    'outcome_public', v_session.outcome_public,
    'session_title', v_session.title,
    'approval_id', v_approval.id,
    'approval_status', coalesce(v_approval.status, 'pending'),
    'dispute_note', v_approval.dispute_note,
    'content_sha', v_sha,
    'reviewed_content_sha', v_approval.reviewed_content_sha,
    'decision_matches_current_text',
      v_approval.reviewed_content_sha is not null
      and v_approval.reviewed_content_sha = v_sha,
    'can_decide', v_outcome.status = 'pending_approval'
      and coalesce(v_approval.status, 'pending') = 'pending'
  );
end;
$$;

revoke all on function public.participant_get_outcome_review(text) from public;
grant execute on function public.participant_get_outcome_review(text) to anon, authenticated;
