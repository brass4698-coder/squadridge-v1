# Data retention

## Purpose

This document explains how long different types of data are kept and how we delete them. It is written to be useful to engineers (so the implementation can be checked against the policy) and to reviewers (so operational tradeoffs are visible). The numbers below are defaults that should be confirmed by legal and operations before they are quoted to partners.

## Status (what is actually implemented today)

The current production deletion path is **TTL-based**, not partition-based:

- **Messages:** every row in `public.messages` has an `expires_at` column set by a `BEFORE INSERT` trigger to `now() + 7 days`. The hourly `pg_cron` job `cleanup-expired-data` calls `public.run_expired_data_cleanup()`, which logs `action = 'ttl_purge'` to `moderation_audit_log` then `DELETE`s expired rows.
- **Match queue:** the same trigger pattern sets a 7-day TTL on `public.match_queue`; the same cleanup orchestrator clears expired rows (via `sweep_matchmaking_queue`).
- **Squads:** the same orchestrator clears `public.squads` rows past their `expires_at`.
- **ZK proof submissions:** `public.zk_proof_submissions.expires_at` defaults to `created_at + 90 days` (there is no `zk_pool` table); purged by the same hourly job.

See [`supabase/migrations/20260418090000_ttl_cleanup.sql`](./supabase/migrations/20260418090000_ttl_cleanup.sql) and [`supabase/migrations/20260718071000_ttl_cleanup_audit_and_zk_expiry.sql`](./supabase/migrations/20260718071000_ttl_cleanup_audit_and_zk_expiry.sql). Cron intent is also listed under `[db.seed]` comments in `supabase/config.toml` and in [`supabase/cron_jobs.md`](./supabase/cron_jobs.md) (the CLI rejects a literal `[db.cron_jobs]` key — migrations install the schedules on reset/push).

## Retention categories and recommended defaults

- **Messages (ciphertext):** 7 days, enforced by `expires_at` + hourly cron.
  - Rationale: short TTL minimises blast radius if a squad key or backup is exposed. If a longer window is needed for a specific pilot (for example, to support post-session review), document the deviation in the pilot runbook and adjust the trigger interval in a follow-up migration; do not change it ad-hoc on the production database.
  - Implementation note: see migration above. There is no partitioned `messages` table today; `DELETE` plus the `idx_messages_expires_at` index is the current path.

- **Message metadata (squad/membership rows, conversation timing, language tags):** kept for the lifetime of the squad, then cleared with the squad's own `expires_at`.
  - Rationale: metadata stays minimal and is not retained beyond the conversation it describes.
  - Note: avoid storing free-text PII or stable cross-squad identifiers in metadata columns.

- **Audit logs (`moderation_audit_log`, including `message_plaintext_decrypt_review` rows):** append-only, kept at least as long as legal or internal policy requires; export before any shortening.
  - Rationale: required for dispute resolution and to evidence sanctioned moderator decrypts (migration `20260428120000_moderator_decrypt_audit_rpc.sql`).
  - Access: read paths are restricted to moderator RPCs and to operators with direct DB access.

- **ZK verification artifacts (`zk_proof_submissions`, `verified_attributes`):** see [`docs/technical/data-retention-zk.md`](./docs/technical/data-retention-zk.md). Proof rows carry `expires_at` (default 90 days) and are purged by the hourly TTL job; on account deletion these rows are also removed via the `auth.users` / `public.users` cascade.

- **Access logs / monitoring traces:** managed by the platform (Supabase, host, CDN). The application does not store raw access logs and does not currently hash IPs at the application layer. Treat platform-side log retention as the source of truth and limit dashboard access; align the windows you commit to with what those platforms actually enforce.

- **Crash reports / error traces (Sentry):** the SDK is wired with a `beforeSend` sanitiser ([`src/lib/sentry.ts`](./src/lib/sentry.ts)) that drops dev noise, removes any `session_boundary.user_id` that is not a salted hash, and truncates oversized strings in `extra` / `contexts`. The user id sent to Sentry is a salted SHA-256 truncation ([`src/lib/sentryUserHash.ts`](./src/lib/sentryUserHash.ts)). Sentry's own retention applies on top of this.

## Deletion, purge, and retention enforcement

- **Scheduled cleanup:** the migration above schedules `cleanup-expired-data` via `pg_cron`. If `pg_cron` is not available on the project, the cron block is skipped — operators must run the equivalent `DELETE` statements via an external scheduler in that case.
- **Squad archive vs delete:** ending a session sets `squads.archived_at` and `status = 'archived'` (`SessionPage.tsx`). The squad's `expires_at` continues to drive eventual row deletion; archive is not itself a delete.
- **Demo "Leave and forget":** the in-product demo control on `DemoSessionPage` clears local browser state (last-squad pointer, local Semaphore identity) only. It does not issue server-side deletes; the offline demo session has no server rows to delete.
- **User-initiated deletion of a real squad:** not currently a self-serve flow. A user who wants their messages removed before the 7-day TTL must contact operators, who can issue a scoped `DELETE` against `public.messages` for that squad and record the action in `moderation_audit_log`. A self-serve "delete my messages" path is on the roadmap.
- **Holds for legal or safety investigations:** any preservation request must be approved through a documented internal process, time-limited, audited, and recorded in `moderation_audit_log`. Do not respond to subpoenas without legal sign-off.

## Backups and disaster recovery

- Backups inherit Supabase's project-level retention. Until backup retention is shorter than or equal to the message TTL, treat backups as the long pole of message retention and limit who can restore them.
- A dedicated KMS key for backup envelopes is described in [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) as a target; it is not wired in today.

## Access controls

- Production database and storage access is limited to a small named group; access uses short-lived credentials where possible.
- Developer machines do not store production keys. Time-limited access is requested through the internal process.
- Service-role keys remain restricted to Edge Functions; see [`docs/security/threat-model.md`](./docs/security/threat-model.md).

## Operational runbook (high level)

- **Daily:** check that the cleanup ran in the last 90 minutes via the dashboard view installed by [`supabase/migrations/20260429140000_retention_cleanup_metrics.sql`](./supabase/migrations/20260429140000_retention_cleanup_metrics.sql):

  ```sql
  SELECT * FROM public.pilot_retention_cleanup_24h
  ORDER BY hour_bucket DESC LIMIT 1;
  ```

  Alert when the latest `hour_bucket` is older than 90 minutes (cron stalled) or when `messages_deleted = 0` for every hour over 24h during an active pilot (the `expires_at` trigger may have been disabled).
- **Weekly:** review `moderation_audit_log` access patterns; confirm no unexpected `message_plaintext_decrypt_review` activity.
- **Monthly:** confirm the trigger and the cron job are still installed on the production project (`\d+ public.messages` shows `trigger_set_message_ttl`; `SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-data';` returns one row that calls `public.run_expired_data_cleanup()`).
- **Incident:** if data subject to retention obligations is exposed, follow the incident response plan in [`SECURITY.md`](./SECURITY.md) and notify legal / privacy as required.

## Gaps and roadmap

- **Partitioned messages table.** Earlier drafts of this document referenced `migrations/20260428_message_partitioning.sql` and `scripts/retention_job.sql`. Those files were never landed; the project ships TTL + cron + a metrics-capturing cleanup function instead. If volumes grow to the point where row-level `DELETE` becomes expensive, revisit partitioning then — do not treat partitioning as already in place. The `retention_cleanup_runs` table is the audit surface a partition rollout would extend, replacing the `partition_drop_log` name from earlier drafts.
- **Self-serve user deletion.** No in-product action issues server-side message deletion today. The operator path above is the current workaround.
- **Application-level IP anonymisation.** The current rate limiter keys on the authenticated user id, not IP, so the application never sees IPs to anonymise. IPs that exist at the platform edge (Supabase logs, hosting provider, CDN) are governed by those platforms' settings — see [`docs/operations/ip-logging.md`](./docs/operations/ip-logging.md) for the full surface map.
- **Legal review.** Retention windows above are engineering defaults; confirm jurisdiction-specific obligations with legal before publishing partner-facing copy.

## Quick checklist for operators

- [ ] `expires_at` triggers exist on `public.messages` and `public.match_queue` (`\d+ public.messages` shows `trigger_set_message_ttl`).
- [ ] `cron.job` includes `cleanup-expired-data` and ran successfully in the last hour.
- [ ] Supabase project backup retention is documented and aligned with the message TTL story we tell partners.
- [ ] Platform-level IP / access log retention is documented for the host and Supabase project actually in use.
- [ ] Any deviation from the 7-day message TTL is recorded in the pilot runbook for the cohort.
- [ ] Legal review of retention windows and hold procedures is on file before any high-risk pilot.
