-- Runtime fixes surfaced by pgTAP after the 20260725 series:
--
-- 1. participant_record_contact_hash raised "function digest(text, unknown) does not
--    exist" at runtime: pgcrypto lives in the `extensions` schema and the function
--    pins `search_path = public`. Schema-qualify the call.
-- 2. guard_sessions_status_transition used `raise exception 'CODE' using message = ...`,
--    which is invalid (MESSAGE specified twice) and turned every guarded transition
--    into a hard error. Keep errcode P0001 and put the stable code first in the
--    message (same pattern as the ROOM_FULL capacity errors) so
--    transition_session_status still surfaces it via sqlerrm.
-- 3. Legacy demo-claim RPCs were still executable by anon: Supabase default
--    privileges granted EXECUTE at creation time and the original migrations only
--    revoked from PUBLIC. Revoke the direct anon grants (authenticated-only RPCs).
-- 4. issue_deck_invite and create_invite call pgcrypto's gen_random_bytes with
--    search_path pinned to public only, failing at runtime. Re-pin to
--    public, extensions (still pinned; advisor-safe).
-- 5. handle_new_user created profiles with a null email, but redeem_deck_invite,
--    has_deck_access and the deck_access_grants_select_own policy all match on
--    profiles.email — deck invites could never be redeemed. Populate email at
--    signup and backfill existing null rows from auth.users.
--
-- (Draft-proposal member visibility is fixed separately in
--  20260725230500_ledger_proposal_draft_member_visibility.sql.)

-- ─────────────────────────────────────────────
-- 1) participant_record_contact_hash: qualify pgcrypto digest
-- ─────────────────────────────────────────────

create or replace function public.participant_record_contact_hash(
  p_token text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ctx jsonb;
  v_participant_id uuid;
  v_email text := lower(trim(p_email));
begin
  v_ctx := public.validate_participant_token(p_token);
  if not (v_ctx->>'valid')::boolean then
    return v_ctx;
  end if;

  if v_email is null or v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return jsonb_build_object('valid', false, 'error', 'INVALID_EMAIL');
  end if;

  v_participant_id := (v_ctx->>'participant_id')::uuid;

  update public.participants
  set email_hash = encode(extensions.digest(v_email, 'sha256'), 'hex'),
      updated_at = now()
  where id = v_participant_id;

  return jsonb_build_object('valid', true);
end;
$$;

revoke all on function public.participant_record_contact_hash(text, text) from public;
grant execute on function public.participant_record_contact_hash(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 2) guard_sessions_status_transition: valid RAISE syntax
-- ─────────────────────────────────────────────

create or replace function public.guard_sessions_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_unverified int;
  v_participant_count int;
begin
  if TG_OP = 'UPDATE' and NEW.status is distinct from OLD.status then
    -- Terminal: released only via release_outcome
    if NEW.status = 'released'
       and coalesce(current_setting('app.allow_session_release', true), '') <> 'true' then
      raise exception 'INVALID_TRANSITION: released status requires release_outcome RPC'
        using errcode = 'P0001';
    end if;

    -- No reopen / rewind after ended or released (break-glass is a future RPC)
    if OLD.status in ('ended', 'released')
       and NEW.status in ('setup', 'open', 'live', 'paused') then
      raise exception 'INVALID_TRANSITION: cannot reopen or rewind a session after it has ended or been released'
        using errcode = 'P0001';
    end if;

    -- Facilitate: live/open requires all participants verified
    if NEW.status in ('live', 'open') then
      select count(*), count(*) filter (where verification_status <> 'verified')
      into v_participant_count, v_unverified
      from public.participants
      where session_id = NEW.id;

      if v_participant_count = 0 then
        raise exception 'NO_PARTICIPANTS: at least one participant required before opening room'
          using errcode = 'P0001';
      end if;

      if v_unverified > 0 then
        raise exception 'PARTICIPANTS_NOT_VERIFIED: all participants must be verified before facilitating'
          using errcode = 'P0001';
      end if;

      if OLD.status not in ('setup', 'paused', 'open', 'live') then
        raise exception 'INVALID_TRANSITION: cannot open room from current status'
          using errcode = 'P0001';
      end if;
    end if;

    -- End session only after facilitation started
    if NEW.status = 'ended' and OLD.status not in ('live', 'paused', 'open') then
      raise exception 'INVALID_TRANSITION: session must be live or paused before ending'
        using errcode = 'P0001';
    end if;

    -- Pause only from active room
    if NEW.status = 'paused' and OLD.status not in ('live', 'open', 'paused') then
      raise exception 'INVALID_TRANSITION: session must be live before pausing'
        using errcode = 'P0001';
    end if;
  end if;

  return NEW;
end;
$$;

comment on function public.guard_sessions_status_transition() is
  'Session status transition guard. Raises P0001 with a stable code prefix (INVALID_TRANSITION / NO_PARTICIPANTS / PARTICIPANTS_NOT_VERIFIED) consumed by transition_session_status.';

-- ─────────────────────────────────────────────
-- 3) Demo-claim RPCs: authenticated only (remove default anon grant)
-- ─────────────────────────────────────────────

revoke execute on function public.create_demo_squad() from anon;
revoke execute on function public.issue_demo_claim_consent(text) from anon;
revoke execute on function public.finalize_demo_session_claim(text, text) from anon;

-- ─────────────────────────────────────────────
-- 4) Invite issuers: resolve pgcrypto gen_random_bytes (extensions schema)
-- ─────────────────────────────────────────────

alter function public.issue_deck_invite(text, text[], text, int)
  set search_path to public, extensions;

alter function public.create_invite(text, text, text, uuid, uuid, integer, jsonb)
  set search_path to public, extensions;

-- ─────────────────────────────────────────────
-- 5) profiles.email: populate at signup + backfill
--    (profiles.email is already the documented match key for invites and
--    deck access; this stores no data the auth schema does not already hold)
-- ─────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users (id)
        values (new.id)
    on conflict (id) do nothing;

    -- Email is a guard-protected profile column; this copies it from auth.users
    -- (the trusted source), so take the same documented bypass accept_invite uses.
    perform set_config('app.allow_profile_privileged_update', 'true', true);

    insert into public.profiles (id, email)
        values (new.id, new.email)
    on conflict (id) do update
        set email = coalesce(public.profiles.email, excluded.email);

    perform set_config('app.allow_profile_privileged_update', 'false', true);

    return new;
end;
$$;

do $$
begin
  perform set_config('app.allow_profile_privileged_update', 'true', true);

  update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id
    and p.email is null
    and u.email is not null;

  perform set_config('app.allow_profile_privileged_update', 'false', true);
end $$;
