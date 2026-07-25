-- Optional RFC 3161 trusted-timestamp scaffold beside ledger_sha.
-- Schema + comments only: no live TSA integration, no fake tokens in release_outcome.
-- Public copy must continue to claim SHA-256 integrity today; RFC 3161 only after a real TSA path ships.

alter table public.outcome_records
  add column if not exists timestamp_token text;

alter table public.outcome_records
  add column if not exists timestamp_authority text;

alter table public.outcome_records
  add column if not exists timestamped_at timestamptz;

alter table public.outcome_records
  add column if not exists timestamp_status text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'outcome_records_timestamp_status_check'
  ) then
    alter table public.outcome_records
      add constraint outcome_records_timestamp_status_check
      check (
        timestamp_status is null
        or timestamp_status in ('none', 'pending', 'stored', 'verified', 'failed')
      );
  end if;
end $$;

comment on column public.outcome_records.timestamp_token is
  'Optional RFC 3161 TimeStampToken (base64 or DER text). Remains null until a live TSA path is wired. Do not treat a stored value as court-admissible without a production authority.';

comment on column public.outcome_records.timestamp_authority is
  'TSA identifier or URI when a token is stored. Empty when timestamping is unused.';

comment on column public.outcome_records.timestamped_at is
  'App/operator wall-clock when a TSA response was accepted. Not a substitute for genTime inside a real TimeStampToken.';

comment on column public.outcome_records.timestamp_status is
  'Scaffold status for a future timestamping pipeline. null/none means SHA-256-only integrity (shipped today).';
