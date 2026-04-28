# Data Retention Policy

_Last updated: 2026-04-28_

This document describes what SquadRidge stores, the retention windows applied to each category, the deletion process, and the access controls that restrict who can read or purge data.

For the broader privacy context see [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) and for technical detail see [docs/security/threat-model.md](./docs/security/threat-model.md).

## 1. Data categories and retention windows

| Category | Table / Location | Default retention | Trigger for earlier deletion |
|---|---|---|---|
| Message ciphertext | `messages` | 90 days after squad archive | Account deletion; operator override |
| Squad metadata | `squads` | 180 days after last activity | Operator purge; account deletion |
| Matchmaking queue entries | `matchmaking_queue` | Purged at match or 48 h TTL | Automatic TTL job |
| ZK proof commitments | `zk_proof_submissions` | 12 months (fraud prevention) | Account deletion cascade |
| Verified attributes | `verified_attributes` | Lifetime of account | Account deletion cascade |
| Operational logs | Supabase platform logs | 7 days (Supabase default) | Platform-level; contact Supabase |
| Error reports (Sentry) | Sentry cloud | 90 days (Sentry default) | Sentry project settings |
| Waitlist signups | `waitlist_signups` | Until programme close or 12 months | Operator purge |

All retention windows above are _defaults_. Operators deploying SquadRidge for pilot programmes should review these windows in light of their own legal obligations and configure the retention job accordingly.

## 2. Automatic deletion jobs

### Message TTL (pg_cron)

The migration `supabase/migrations/20260418090000_ttl_cleanup.sql` installs a `pg_cron` job that removes archived squad messages older than the configured retention window. Operators should verify the cron job is active:

```sql
SELECT * FROM cron.job WHERE jobname LIKE '%ttl%';
```

To change the retention window, update the `interval` argument in the cron job or adjust the `squads.archived_at` + offset logic in the migration.

### Matchmaking queue TTL

Unmatched queue entries are expired automatically by the `matchmaking_queue.expires_at` column (set at enqueue time, default 48 h). A sweep function removes expired rows periodically — see `supabase/migrations/20260420120000_matchmaking_sweep_cron.sql`.

### Partitioned messages table (example)

The standalone migration example at `migrations/20260428_message_partitioning.sql` demonstrates how to partition the `messages` table by month so old partitions can be dropped atomically (fast, no vacuum overhead). This is the recommended path for high-volume deployments.

## 3. Account deletion cascade

When a user account is deleted (via the in-app flow or a direct DELETE on `auth.users`), foreign-key cascades remove all rows in:

- `public.users` (profile)
- `squad_members`
- `matchmaking_queue`
- `zk_proof_submissions`
- `verified_attributes`
- `sessions` / `waitlist_signups`

Message rows in `messages` reference `sender_handle` (an ephemeral handle, not a user FK) and are **not** automatically removed by the cascade. Operators must run a separate purge of messages where `conversation_id` maps to squads with no remaining members, or implement the retention job to cover this gap.

## 4. Access controls

| Role | Permissions |
|---|---|
| `authenticated` | Read own rows only (RLS enforced per table) |
| `service_role` | Full access (used only by Edge Functions and migration jobs) |
| `moderator` | Read anonymized transcripts; no access to encryption keys |
| `anon` | No access to any message, profile, or session table |

Message encryption keys (`squads.message_encryption_key`) are readable only by `service_role` and the `get_or_create_message_key` RPC (which validates squad membership via RLS before returning the key).

## 5. Secrets and key rotation

For encryption key rotation and KMS integration see [docs/security/secrets-rotation.md](./docs/security/secrets-rotation.md) and [src/utils/encryption.ts](./src/utils/encryption.ts).

## 6. Auditing

All moderator actions that access message content are recorded in `moderation_audit` (see migration `20260417120000_moderation_audit.sql`). The audit table is immutable to the `authenticated` role and write-only for moderation RPCs.

## 7. Regulatory notes

- **GDPR / UK GDPR**: Data minimisation, purpose limitation, and deletion rights as described above. Operators must appoint a data controller and, where applicable, execute a Data Processing Agreement with Supabase.
- **Crisis data**: Content flagged as a crisis disclosure (see `crisis_alerts` table) is subject to a separate hold period required by safeguarding obligations before deletion. Consult your legal team.
- This document is not legal advice. Engage a privacy lawyer for deployments in regulated sectors (healthcare, education, government).
