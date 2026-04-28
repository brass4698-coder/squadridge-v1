# Data Retention Policy

**Last updated: 2026-04-28**
**Status: Draft — legal and operational review required before public launch**

This document describes what we keep, for how long, why, and how we delete it. It is the companion to [PRIVACY_POLICY.md](PRIVACY_POLICY.md) and the engineering reference to the threat model at [docs/security/threat-model.md](docs/security/threat-model.md).

---

## Guiding principle

Keep the minimum data for the minimum time needed to deliver the service, investigate abuse, and meet legal obligations. When in doubt, delete sooner.

---

## 1. Retention windows

| Data type | Retention window | Notes |
|-----------|-----------------|-------|
| Message ciphertext (`messages.payload_ciphertext`) | **90 days** from `created_at` | Default window; adjustable per deployment |
| Message metadata (sender handle, timestamps) | **90 days** from `created_at` | Co-located with ciphertext in the same row |
| Matchmaking queue rows (`match_queue`) | **24 hours** after match or cancel | Swept by the matchmaking cron job |
| Squad membership (`squad_members`) | Until squad is archived | Archived squads are retained for **30 days** then purged |
| Squad encryption snapshots (`squad_encryption_snapshots`) | 90 days after archive | Required for moderator review of archived sessions |
| ZK proof submissions (`zk_proof_submissions`) | **Indefinite** | Required for audit integrity and nullifier deduplication |
| User accounts | Until user-requested deletion or 12 months of inactivity | Inactivity purge is a roadmap item |
| Moderation audit log | **1 year** | Required for abuse review; minimal PII |
| Server-side error logs (Sentry) | 90 days | Configured in Sentry project settings |
| Rate-limit tokens (Redis) | **1 hour** rolling window | Volatile; lost on Redis restart |
| IP hash (request anonymizer) | Not persisted | Hashed in-flight; never written to DB |
| Build/CI logs | 30 days | GitHub Actions default |

---

## 2. Message retention in detail

Messages are stored in a partitioned `messages` table. Each partition covers one calendar month. Retention is enforced by **dropping the entire partition** when it falls outside the retention window.

### Why partitions instead of row-level deletes?

- Partition drops are a single metadata operation — much faster than `DELETE WHERE created_at < ...` on millions of rows.
- They are harder to accidentally reverse (no row-level audit delta to exploit).
- They release storage immediately (no bloat from dead rows).

### Partition naming convention

```
messages_YYYY_MM
```

A retention job (scheduled via `pg_cron`) drops partitions older than the retention window. See [scripts/retention_job.sql](scripts/retention_job.sql) and [migrations/20260428_message_partitioning.sql](migrations/20260428_message_partitioning.sql).

---

## 3. User-requested deletion

When a user requests account deletion:

1. **Immediately:** Revoke their Supabase auth session; remove their profile row.
2. **Within 24 hours:** Orphan their `squad_members` rows (soft delete or cascade, depending on squad status).
3. **Within 30 days:** Purge any remaining rows linked to their `user_id` that were not yet swept by the partition job. Message ciphertext rows are retained until the partition drops (their author handle is pseudonymous, not linked to real identity in the row itself).
4. **Not deleted:** ZK nullifiers (needed for proof deduplication) and moderation audit log entries referencing the user's moderation actions.

> **Scaffold note:** The deletion pipeline is not yet fully automated. Today it requires manual steps. A task queue + cron job for the 30-day sweep is in the roadmap.

---

## 4. Audit logs

Moderation audit log entries (`moderation_audit_log`) record:
- Which moderator requested message plaintext
- The message ID reviewed
- The justification provided
- Timestamp

These are retained for **1 year** and are only readable by service-role access. They are **not** shown to users. They exist to provide accountability for platform-side message review.

---

## 5. Exceptions and overrides

| Situation | Handling |
|-----------|----------|
| Active abuse investigation | Relevant rows may be held past retention window with a documented legal hold |
| Legal/regulatory request | Data may be preserved under applicable law; we document each hold |
| Ongoing moderation action | Squad data retained until action closes |
| User has an open support ticket | Profile retained until ticket resolves |

Each exception is tracked in an internal legal-hold register (not in this repo).

---

## 6. How we enforce retention (engineering)

- **Partition drops:** `pg_cron` job runs nightly; SQL in [scripts/retention_job.sql](scripts/retention_job.sql).
- **Queue TTL sweep:** Matchmaking cron (see `docs/technical/matchmaking-automation.md`).
- **Sentry:** Retention configured in Sentry project settings (90-day default).
- **Redis:** TTL set on every key; no persistent storage of PII.

---

## 7. Auditing the retention process

Each partition drop is logged to `partition_drop_log` (to be implemented — see roadmap). Logs include partition name, row count, and timestamp. This log is retained for 1 year.

> **Scaffold note:** `partition_drop_log` and its associated alerting are in the roadmap. Until implemented, retention is enforced but not automatically audited.

---

## 8. Changes

Changes to retention windows should go through PR review with a comment in this doc and a note in the threat model if the change affects anonymity guarantees.

---

*If you have questions about what data we hold about you, see [PRIVACY_POLICY.md § Your rights](PRIVACY_POLICY.md#5-your-rights).*
