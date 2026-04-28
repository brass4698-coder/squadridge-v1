# Data Retention Policy

_Last updated: 2026-04-28_
_Status: scaffold — legal and operational review required before enforcing in production._

This document defines what SquadRidge stores, for how long, and how it is deleted. It is the authoritative reference for engineers implementing or modifying retention logic.

---

## 1. Guiding principles

- **Data minimisation.** Store only what is necessary for the stated purpose.
- **Purpose limitation.** Data collected for one purpose is not reused for a different purpose without explicit consent.
- **Secure deletion.** Data is deleted—not merely flagged—after its retention window expires. PostgreSQL `DELETE` + partition drops are preferred over soft deletes for content data.
- **Documented exceptions.** Any deviation from the periods below must be approved and documented.

---

## 2. Retention schedules

| Data category | Default retention | Notes |
|---------------|------------------|-------|
| Ephemeral session token | Session lifetime only | Expires at disconnect; never written to long-term storage |
| Message ciphertext (active squad) | Duration of squad session | Deleted when squad is closed or TTL expires (default: 24 h after last activity) |
| Message ciphertext (archived squad) | 30 days after squad end | Covered by monthly partition drop job (see `migrations/20260428_message_partitioning.sql`) |
| Hashed device signal | 30 days | Used for rate-limiting only; column `expires_at` enforced by `scripts/retention_job.sql` |
| Moderation flags (non-escalated) | 90 days | Hashed content pointer only; raw text not stored |
| Moderation flags (escalated / legal hold) | As required by applicable law | Requires explicit legal-hold flag; access restricted to authorised roles |
| Waitlist / contact email | Until user requests deletion or 24 months (whichever is sooner) | Held only for product updates; not shared with third parties |
| Error / observability events (Sentry) | 30 days in Sentry | PII scrubbed before ingestion (see `src/utils/sentry.ts`) |
| Audit log entries (moderation actions) | 1 year | Anonymised; operator-only access |

---

## 3. Deletion mechanisms

### 3.1 Partition drops (messages)

Messages are stored in monthly partitions. The retention job (`scripts/retention_job.sql`) drops partitions older than the configured window. This is a hard delete — the data is unrecoverable after the partition is dropped.

```sql
-- Example: drop partitions older than 30 days (adapt window as needed)
-- See scripts/retention_job.sql for the full job definition.
```

### 3.2 Row-level TTL (device signals)

The `rate_limit_tokens` table (see migration) has an `expires_at timestamptz` column. A pg_cron job (or external scheduler) runs `DELETE FROM rate_limit_tokens WHERE expires_at < now()` daily.

### 3.3 User-requested deletion

When a user requests erasure:
1. All message rows linked to their ephemeral `sender_handle` are deleted immediately.
2. Any moderation flags referencing the handle are anonymised (handle replaced with a one-way hash of the deletion timestamp).
3. The session token is invalidated and removed from auth tables.
4. A deletion receipt (timestamp + pseudonymous handle hash) is written to the audit log.

---

## 4. Backup and recovery

Backups follow the same retention schedule. Backups are encrypted with KMS-managed keys. After the retention window, the corresponding backup segments are purged. A runbook for backup purging is in `docs/operations/`.

---

## 5. Legal holds

If a legal hold is placed on data, the retention job automatically skips rows/partitions flagged `legal_hold = true`. Legal holds must be documented in the incident log and reviewed quarterly.

---

## 6. Review cadence

This policy is reviewed:
- **Quarterly** by the engineering lead and privacy contact.
- **On any material change** to data flows (new tables, new third-party integrations, new features that collect data).

---

> **Note for maintainers:** The retention durations above are starting-point scaffolds. Adjust them based on your legal jurisdiction, user agreements, and operational needs. Consult legal counsel before enforcing in production.
