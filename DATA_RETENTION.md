# Data Retention Policy

*Last updated: 2026-04-28. Scaffold — exact windows and automated deletion jobs are partially implemented; see "Current state" notes per section.*

---

We retain data for the shortest time that still lets us operate safely, moderate responsibly, and recover from incidents. This document is the engineering-level companion to the privacy policy; operators and auditors should read both.

## Retention windows

### Messages

| State | Retention window | Deletion mechanism | Current state |
|---|---|---|---|
| Active (squad live) | Indefinite while squad is running | N/A | Implemented |
| Archived squad | 90 days after `archived_at` timestamp | Manual + planned partition drop | Partition migration scaffold in `supabase/migrations/`; automated cron not yet deployed |
| Moderation-flagged | Until review resolves + 7 days | Soft-delete + hard-delete job | Manual today |

**Note:** Messages are stored as ciphertext (AES-256-GCM). Deletion removes both ciphertext and the encryption key reference for that squad. Once deleted, messages cannot be decrypted even with database-level access.

The partition-based schema (`messages` partitioned by `created_at`) means archiving old data is a `DROP TABLE` on the partition — fast, auditable, and not dependent on row-by-row deletes.

### Matchmaking queue rows

Deleted on match or after a 24-hour inactivity window via `pg_cron` (see `docs/operations/matchmaking-cron.md`).

### ZK proof submissions and verified attributes

Retained for 180 days to support audit trails and nullifier replay prevention. After 180 days, rows are hard-deleted. The nullifier hash (which prevents double-use of a proof) has no PII value beyond that window — a re-used proof would simply be a new submission.

*Automated deletion job: scaffold in `scripts/retention_job.sql`, not yet wired to pg_cron in production. Next step: schedule via Supabase cron after pilot go-live.*

### Moderation audit logs

90 days. The audit log captures who accessed what plaintext, when, and with what justification — long enough to support incident investigation, short enough to limit ongoing exposure.

*Automated deletion: same retention job scaffold as above.*

### User accounts and profiles

Retained while the account is active. On deletion request: account marked inactive, profile data zeroed out, auth record deleted in Supabase Auth. Associated squad memberships are soft-deleted.

*Full automated self-service deletion: on roadmap. Currently requires operator action.*

### Waitlist signups

Retained until a user unsubscribes, or after 2 years of inactivity, whichever comes first.

### Error reports (Sentry)

Sentry's own retention applies (30 days by default on Sentry's hosted tier). We do not export or re-store Sentry data.

---

## Deletion process

### Standard account deletion

1. User requests deletion (self-service UI or email to operator).
2. Operator (or automated job) calls the account deletion flow:
   - Soft-delete profile row, zero out PII fields.
   - Delete auth.users entry via Supabase Admin API.
   - Mark squad memberships as `left`.
3. Messages authored by the deleted user retain ciphertext (they're part of a shared conversation) but the `sender_handle` ephemeral column is already anonymized — no linkage to the deleted account.
4. Confirm deletion in writing within 30 days.

*Limitation: today this is a manual operator process. Automated self-service UI is planned for Q3 2026.*

### Partition drop (bulk message deletion)

For large-scale message archival, we use PostgreSQL table partitioning. When a retention window expires:

```sql
-- Example: drop messages partition for squads archived before 2026-01-01
-- See scripts/retention_job.sql for the full pg_cron job scaffold
DROP TABLE IF EXISTS messages_2025_q4;
```

This is faster and safer than `DELETE FROM messages WHERE created_at < ...` on a live table.

### Incident-triggered early deletion

If a breach or unauthorized access is detected, we may delete affected partitions or accounts sooner than the standard window. This is recorded in the incident log (`docs/operations/incidents.md`) and communicated to affected users.

---

## Exceptions

We may retain data beyond the standard window when:
1. Required by law or an active legal hold.
2. Necessary to resolve an unresolved safety incident (e.g., credible threat investigation).
3. A user has an active pending export request (to ensure the export is complete before deletion).

Exceptions are logged in the incident record with justification and a target end date.

---

## Audit trail

All retention-related actions are logged:
- Moderation decrypt accesses: `moderation_audit_log` table (90 days).
- Partition drops: database activity log + operator runbook entry.
- Account deletions: deletion request ticket + confirmation.

The retention job SQL and pg_cron schedule should themselves be under version control and reviewed as part of any compliance audit.

---

## Next steps

- [ ] Deploy `scripts/retention_job.sql` as a pg_cron job in the Supabase project.
- [ ] Wire up automated account deletion to a user-facing UI.
- [ ] Legal review of retention windows against GDPR, DSA, and pilot-partner jurisdiction requirements.
- [ ] Add retention assertions to the pgTAP test suite so future migrations can't silently extend windows.
