-- Idempotent create_invite + stale invite/session cleanup (append-only migration).
-- Privacy: audit/cleanup never stores message bodies.

-- Unique idempotency key when present in metadata (partial unique index).
create unique index if not exists invites_idempotency_key_uidx
  on public.invites ((metadata->>'idempotency_key'))
  where (metadata ? 'idempotency_key' and length(trim(metadata->>'idempotency_key')) > 0);

create or replace function public.create_invite(
  p_email text,
  p_invite_type text,
  p_role_key text,
  p_institution_id uuid default null,
  p_workspace_id uuid default null,
  p_expires_hours int default 72,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_invite_id uuid;
  v_expires timestamptz;
  v_idem text;
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key in ('super_admin','institution_admin','facilitator')
  ) then
    raise exception 'unauthorized: insufficient role to create invite';
  end if;

  v_idem := nullif(trim(coalesce(p_metadata->>'idempotency_key', '')), '');

  if v_idem is not null then
    select i.id, i.token, i.expires_at
      into v_invite_id, v_token, v_expires
    from public.invites i
    where i.metadata->>'idempotency_key' = v_idem
    limit 1;

    if found then
      return jsonb_build_object(
        'success', true,
        'token', v_token,
        'invite_id', v_invite_id,
        'expires_at', v_expires,
        'idempotent_replay', true
      );
    end if;
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := now() + (p_expires_hours || ' hours')::interval;

  insert into public.invites (
    email, token, invite_type, role_key,
    institution_id, workspace_id, issued_by,
    expires_at, metadata
  )
  values (
    p_email, v_token, p_invite_type, p_role_key,
    p_institution_id, p_workspace_id, auth.uid(),
    v_expires,
    p_metadata
  )
  returning id into v_invite_id;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(), 'invite_created', 'invite', v_invite_id,
    jsonb_build_object(
      'role_key', p_role_key,
      'idempotency_key', v_idem
    )
  );

  return jsonb_build_object(
    'success', true,
    'token', v_token,
    'invite_id', v_invite_id,
    'expires_at', v_expires,
    'idempotent_replay', false
  );
end;
$$;

grant execute on function public.create_invite to authenticated;

-- Release outcome with optional idempotency metadata (no PII / no dialogue bodies).
create or replace function public.release_outcome(
  p_outcome_id uuid,
  p_ledger_sha text,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
  v_session_id uuid;
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key in ('super_admin','institution_admin','facilitator','mediator')
  ) then
    raise exception 'unauthorized: insufficient role to release outcome';
  end if;

  select * into v_outcome from public.outcome_records where id = p_outcome_id for update;
  if not found then
    raise exception 'outcome_not_found';
  end if;

  if v_outcome.status = 'published' then
    return jsonb_build_object(
      'success', true,
      'already_published', true,
      'outcome_id', v_outcome.id,
      'ledger_sha', v_outcome.ledger_sha
    );
  end if;

  if v_outcome.status not in ('pending_approval', 'approved') then
    raise exception 'outcome_not_ready';
  end if;

  update public.outcome_records
  set
    status = 'published',
    published_at = now(),
    ledger_sha = p_ledger_sha,
    updated_at = now()
  where id = p_outcome_id;

  v_session_id := v_outcome.session_id;
  update public.sessions
  set status = 'released', updated_at = now()
  where id = v_session_id;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(), 'outcome_released', 'outcome_record', p_outcome_id,
    jsonb_build_object(
      'session_id', v_session_id,
      'idempotency_key', nullif(trim(coalesce(p_idempotency_key, '')), '')
    )
  );

  return jsonb_build_object(
    'success', true,
    'already_published', false,
    'outcome_id', p_outcome_id,
    'ledger_sha', p_ledger_sha
  );
end;
$$;

grant execute on function public.release_outcome to authenticated;

-- Cleanup: expired unused invites + stale setup sessions (metadata only).
create or replace function public.cleanup_stale_invites_and_sessions()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invites int := 0;
  v_sessions int := 0;
begin
  update public.invites
  set revoked_at = now()
  where revoked_at is null
    and used_at is null
    and expires_at < now() - interval '7 days';
  get diagnostics v_invites = row_count;

  -- Sessions stuck in setup/open with no updates for 30 days → ended (not deleted).
  update public.sessions
  set status = 'ended', updated_at = now()
  where status in ('setup', 'open')
    and updated_at < now() - interval '30 days';
  get diagnostics v_sessions = row_count;

  return jsonb_build_object(
    'invites_revoked', v_invites,
    'sessions_ended', v_sessions
  );
end;
$$;

revoke all on function public.cleanup_stale_invites_and_sessions() from public;
grant execute on function public.cleanup_stale_invites_and_sessions() to service_role;

do $$
declare
  jid bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    select jobid into jid from cron.job where jobname = 'cleanup-stale-invites-sessions' limit 1;
    if jid is not null then
      perform cron.unschedule(jid);
    end if;
    perform cron.schedule(
      'cleanup-stale-invites-sessions',
      '15 3 * * *',
      $cron$select public.cleanup_stale_invites_and_sessions();$cron$
    );
  end if;
exception
  when others then
    -- pg_cron may be unavailable in local/dev; function remains callable by service role.
    null;
end;
$$;
