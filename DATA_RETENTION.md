# Data retention

## Purpose

This document explains how long different types of data are kept and how we delete them. It’s written to be practical: engineers should be able to implement it, and reviewers should understand operational tradeoffs. This is a draft and should be reviewed by legal before publication.

## Retention categories and recommended defaults

- Messages (ciphertext): 90 days by default.
  - Rationale: gives users time to continue conversations and allows short-term moderation, but keeps the data life short for privacy.
  - Implementation note: messages are stored as ciphertext + metadata. We recommend partitioning the messages table by month and dropping partitions older than 90 days.

- Message metadata (conversation_id, language tags, minimal routing info): 180 days.
  - Rationale: metadata helps product analytics and abuse detection while keeping message content shorter lived.
  - Note: metadata values must be minimized and avoid storing PII.

- Audit logs (moderation actions, admin changes): 365 days.
  - Rationale: we need an audit trail for operational integrity and dispute resolution. These logs are access‑controlled and do not contain raw user PII.

- Access logs / monitoring traces: 30 days (raw), 180 days (aggregates).
  - Raw logs are scrubbed for PII before storage. Aggregates for product telemetry may be retained longer with privacy protections.

- Crash reports / error traces: 30 days by default, scrubbed on ingest.
  - Sentry/example before-send hook is scaffolded to remove user messages and headers.

## Deletion, purge, and retention enforcement

- Partitioning approach:
  - Use a partitioned messages table (RANGE on created_at). Create partitions per calendar month.
  - A scheduled job (pg_cron or an external orchestrator) will drop partitions older than the retention window. Dropping partitions is fast and reduces risk of accidental partial deletion.

- Deletion requests:
  - “Leave & forget” will mark a session as ended and enqueue a deletion job for messages in that session. Deletions may be batched for operational efficiency.
  - Upon deletion completion, write an immutable audit entry recording the deletion (who/what requested it and timestamp), but avoid including the content removed.

- Partial retention for investigations:
  - If a lawful request or serious safety investigation requires preservation, a limited hold may be placed. This is exceptional and must be approved by a documented internal process. Holds are time-limited and audited.

## Backups and disaster recovery

- Backups must follow the same retention rules. Backups containing message partitions older than the retention window must be purged or encrypted with separate keys and access-limited.
- We recommend encrypting backups with a dedicated KMS key and storing rotation/usage logs.

## Access controls

- Production DB and storage access is limited to a small, named group. Access is audited and uses short-lived credentials where possible.
- Developer machines do not store production keys. Developers who need access must request time-limited privileges through an internal process.

## Operational runbook (high level)

- Daily:
  - Health checks on retention job; alert if retention lag > 2x scheduled window.
- Weekly:
  - Review audit log access patterns.
- Monthly:
  - Confirm partitions and that old partitions are dropped as expected.
- Incident:
  - If data with retention obligations is exposed, follow the Incident Response Plan (see SECURITY.md) and notify legal/privacy as required.

## What remains / scaffold notes

- The repo includes migrations/20260428_message_partitioning.sql with a partitioned table example and a scripts/retention_job.sql sample for pg_cron. These are scaffolds — they show the intended approach but need validation against your production DB engine, timezone settings, and backup strategy.
- Before production use:
  - Decide and document final retention windows (the defaults above are recommendations).
  - Wire pg_cron or a scheduler and test the drop-partition flow carefully on a staging DB (do NOT run on production without a tested backup and restore plan).
  - Ensure backups follow the same retention and encryption rules.

## Legal & compliance notes

- Retention windows may need to be adjusted for local legal obligations (e.g., regional requirements for records or law enforcement holds). Coordinate with legal for country-specific changes.
- Any request to preserve or disclose data for legal reasons must be logged and handled via the legal team. Don’t attempt to reply to subpoenas without legal guidance.

## Quick checklist for engineers

- [ ] Review partition boundaries and timezone behavior in migrations/20260428_message_partitioning.sql
- [ ] Configure pg_cron or a scheduled job to run the retention script
- [ ] Add monitoring/alerting for retention job successes/failures
- [ ] Confirm backup encryption and retention policies match the live retention plan
- [ ] Legal review of retention windows and hold procedures

## Thank you

This policy balances user privacy and necessary operational needs. Follow-up work may include a tested runbook for partition creation, a safe staging script, and a small demo that simulates dropping an old partition on a non-prod dataset.
