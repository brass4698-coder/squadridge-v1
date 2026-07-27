-- v2 facilitated rooms: application-layer AES-GCM ciphertext for session_messages.
-- Keys live in session_room_keys (not on sessions) so public released-session SELECT
-- cannot expose key material. Operator/service-role can still read keys — this is
-- NOT operator-blind E2E. See docs/security/threat-model.md §5.

create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────
-- session_room_keys
-- ─────────────────────────────────────────────

create table if not exists public.session_room_keys (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  message_encryption_key text not null,
  key_epoch integer not null default 1,
  created_at timestamptz not null default now(),
  constraint session_room_keys_key_nonempty check (length(btrim(message_encryption_key)) > 0)
);

comment on table public.session_room_keys is
  'Per-session AES-256-GCM key (base64). Readable by the facilitator via RLS and by admitted participants via security-definer RPC. Operators with DB/service-role access can also read — not Signal-grade E2E.';

comment on column public.session_room_keys.message_encryption_key is
  'Base64 or base64url 32-byte AES-256-GCM key. Client encrypts message bodies before insert/RPC.';

alter table public.session_room_keys enable row level security;

revoke all on table public.session_room_keys from public;
revoke all on table public.session_room_keys from anon;
revoke all on table public.session_room_keys from authenticated;

grant select on table public.session_room_keys to authenticated;

drop policy if exists "Facilitator can read room key for own sessions" on public.session_room_keys;
create policy "Facilitator can read room key for own sessions"
  on public.session_room_keys
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_id
        and s.facilitator_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policies for authenticated — keys are server-owned.

create or replace function public.sessions_ensure_room_key()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.session_room_keys (session_id, message_encryption_key)
  values (NEW.id, encode(gen_random_bytes(32), 'base64'))
  on conflict (session_id) do nothing;
  return NEW;
end;
$$;

comment on function public.sessions_ensure_room_key() is
  'AFTER INSERT on sessions: create a server-generated room encryption key.';

drop trigger if exists sessions_ensure_room_key on public.sessions;
create trigger sessions_ensure_room_key
  after insert on public.sessions
  for each row
  execute function public.sessions_ensure_room_key();

revoke all on function public.sessions_ensure_room_key() from public;

-- Backfill existing sessions
insert into public.session_room_keys (session_id, message_encryption_key)
select s.id, encode(extensions.gen_random_bytes(32), 'base64')
from public.sessions s
where not exists (
  select 1 from public.session_room_keys k where k.session_id = s.id
);

-- ─────────────────────────────────────────────
-- Payload helpers
-- ─────────────────────────────────────────────

create or replace function public.is_aes_gcm_v3_payload(p_body text)
returns boolean
language plpgsql
immutable
as $$
declare
  v jsonb;
begin
  if p_body is null or length(btrim(p_body)) < 20 then
    return false;
  end if;
  begin
    v := btrim(p_body)::jsonb;
  exception
    when others then
      return false;
  end;
  return coalesce(v->>'v', '') = '3'
    and coalesce(v->>'alg', '') = 'AES-256-GCM'
    and coalesce(v->>'iv', '') <> ''
    and coalesce(v->>'ct', '') <> ''
    and jsonb_typeof(v->'iv') = 'string'
    and jsonb_typeof(v->'ct') = 'string';
end;
$$;

comment on function public.is_aes_gcm_v3_payload(text) is
  'True when body is a SquadRidge AES-GCM v3 JSON envelope (structure only; does not decrypt).';

revoke all on function public.is_aes_gcm_v3_payload(text) from public;
grant execute on function public.is_aes_gcm_v3_payload(text) to authenticated;
grant execute on function public.is_aes_gcm_v3_payload(text) to service_role;

create or replace function public.session_messages_require_ciphertext()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.session_room_keys k where k.session_id = NEW.session_id
  ) and not public.is_aes_gcm_v3_payload(NEW.body) then
    raise exception 'SESSION_MESSAGE_CIPHERTEXT_REQUIRED'
      using errcode = 'check_violation',
        hint = 'Encrypt the message body client-side with the session room key (AES-GCM v3).';
  end if;
  return NEW;
end;
$$;

drop trigger if exists session_messages_require_ciphertext on public.session_messages;
create trigger session_messages_require_ciphertext
  before insert on public.session_messages
  for each row
  execute function public.session_messages_require_ciphertext();

revoke all on function public.session_messages_require_ciphertext() from public;

-- Tighten facilitator message policy: explicit WITH CHECK (was missing)
drop policy if exists "Facilitator can read and write messages in their sessions" on public.session_messages;

create policy "Facilitator can select messages in their sessions"
  on public.session_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
  );

create policy "Facilitator can insert messages in their sessions"
  on public.session_messages
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
    and sender_role = 'facilitator'
  );

create policy "Facilitator can update messages in their sessions"
  on public.session_messages
  for update
  to authenticated
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

create policy "Facilitator can delete messages in their sessions"
  on public.session_messages
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.facilitator_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- Participant key access (token-gated)
-- ─────────────────────────────────────────────

create or replace function public.participant_get_room_key(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_key text;
  v_epoch integer;
begin
  v_ctx := public._participant_room_gate(p_token, false);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  select k.message_encryption_key, k.key_epoch
  into v_key, v_epoch
  from public.session_room_keys k
  where k.session_id = (v_ctx->>'session_id')::uuid;

  if v_key is null or length(btrim(v_key)) = 0 then
    return jsonb_build_object('valid', false, 'error', 'ROOM_KEY_MISSING');
  end if;

  return jsonb_build_object(
    'valid', true,
    'session_id', v_ctx->>'session_id',
    'message_encryption_key', v_key,
    'key_epoch', coalesce(v_epoch, 1)
  );
end;
$$;

comment on function public.participant_get_room_key(text) is
  'Returns the session room AES key to an admitted participant (token-gated). Still operator-readable in Postgres.';

revoke all on function public.participant_get_room_key(text) from public;
grant execute on function public.participant_get_room_key(text) to anon, authenticated;

-- Facilitator accessor (ensures key exists)
create or replace function public.facilitator_get_or_create_room_key(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_key text;
  v_epoch integer;
begin
  if v_uid is null then
    return jsonb_build_object('valid', false, 'error', 'NOT_AUTHENTICATED');
  end if;

  if not exists (
    select 1 from public.sessions s
    where s.id = p_session_id and s.facilitator_id = v_uid
  ) then
    return jsonb_build_object('valid', false, 'error', 'FORBIDDEN');
  end if;

  insert into public.session_room_keys (session_id, message_encryption_key)
  values (p_session_id, encode(gen_random_bytes(32), 'base64'))
  on conflict (session_id) do nothing;

  select k.message_encryption_key, k.key_epoch
  into v_key, v_epoch
  from public.session_room_keys k
  where k.session_id = p_session_id;

  if v_key is null then
    return jsonb_build_object('valid', false, 'error', 'ROOM_KEY_MISSING');
  end if;

  return jsonb_build_object(
    'valid', true,
    'session_id', p_session_id,
    'message_encryption_key', v_key,
    'key_epoch', v_epoch
  );
end;
$$;

revoke all on function public.facilitator_get_or_create_room_key(uuid) from public;
grant execute on function public.facilitator_get_or_create_room_key(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- participant_send_message: require ciphertext
-- ─────────────────────────────────────────────

create or replace function public.participant_send_message(p_token text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_session_id uuid;
  v_codename text;
  v_msg_id uuid;
  v_first_message boolean;
  v_pacing jsonb;
  v_stage text;
  v_trimmed text;
begin
  v_ctx := public._participant_room_gate(p_token, true);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if (v_ctx->>'session_status') = 'paused' then
    return jsonb_build_object('valid', false, 'error', 'ROOM_PAUSED');
  end if;

  select coalesce(dialogue_stage, 'preparation') into v_stage
  from public.sessions
  where id = (v_ctx->>'session_id')::uuid;

  if not public.dialogue_stage_allows_participant_post(v_stage) then
    return jsonb_build_object(
      'valid', false,
      'error', 'STAGE_POSTING_CLOSED',
      'dialogue_stage', v_stage
    );
  end if;

  v_pacing := public.participant_get_pacing(p_token);
  if coalesce((v_pacing->>'posting_blocked')::boolean, false) then
    if coalesce((v_pacing->>'acknowledge_required')::boolean, false) then
      return jsonb_build_object('valid', false, 'error', 'PAUSE_ACK_REQUIRED');
    end if;
    return jsonb_build_object('valid', false, 'error', 'POSTING_RESTRICTED');
  end if;

  v_trimmed := trim(p_body);
  if v_trimmed is null or length(v_trimmed) = 0 then
    return jsonb_build_object('valid', false, 'error', 'EMPTY_BODY');
  end if;

  if not public.is_aes_gcm_v3_payload(v_trimmed) then
    return jsonb_build_object('valid', false, 'error', 'CIPHERTEXT_REQUIRED');
  end if;

  if length(v_trimmed) > 16000 then
    return jsonb_build_object('valid', false, 'error', 'BODY_TOO_LONG');
  end if;

  v_session_id := (v_ctx->>'session_id')::uuid;
  v_codename := v_ctx->>'codename';

  if not exists (
    select 1 from public.session_room_keys k where k.session_id = v_session_id
  ) then
    return jsonb_build_object('valid', false, 'error', 'ROOM_KEY_MISSING');
  end if;

  select not exists (
    select 1 from public.session_messages m
    where m.session_id = v_session_id
      and m.sender_role = 'participant'
      and m.sender_label = v_codename
  ) into v_first_message;

  insert into public.session_messages (session_id, sender_label, sender_role, body)
  values (v_session_id, v_codename, 'participant', v_trimmed)
  returning id into v_msg_id;

  if v_first_message then
    perform public._log_session_audit_event_internal(
      v_session_id,
      'room_entered',
      'participant',
      null,
      jsonb_build_object('participant_codename', v_codename)
    );
  end if;

  return jsonb_build_object('valid', true, 'message_id', v_msg_id);
end;
$$;

-- ─────────────────────────────────────────────
-- Verbatim guard: only scans legacy plaintext rows.
-- Encrypted rooms rely on facilitator authorship attestation;
-- ciphertext cannot be substring-matched without server decrypt.
-- ─────────────────────────────────────────────

create or replace function public.outcome_contains_verbatim_room_content(p_outcome_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_outcome public.outcome_records%rowtype;
begin
  select * into v_outcome from public.outcome_records where id = p_outcome_id;
  if not found then
    return false;
  end if;

  return exists (
    select 1
    from public.session_messages m
    where m.session_id = v_outcome.session_id
      and not public.is_aes_gcm_v3_payload(m.body)
      and length(trim(m.body)) >= 20
      and (
        position(lower(trim(m.body)) in lower(coalesce(v_outcome.summary, ''))) > 0
        or position(lower(trim(m.body)) in lower(coalesce(v_outcome.agreed_terms, ''))) > 0
        or position(lower(trim(m.body)) in lower(coalesce(v_outcome.pending_items, ''))) > 0
      )
  );
end;
$$;
