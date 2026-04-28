# Privacy Policy

_Last updated: 2026-04-28_

SquadRidge ("we", "us", "our") is committed to protecting your privacy. This policy describes what data we collect, how we use it, and your rights. For the full technical description of what is stored and for how long, see [DATA_RETENTION.md](./DATA_RETENTION.md) and the engineering documentation at [docs/security/threat-model.md](./docs/security/threat-model.md).

## 1. What we collect

| Category | Details | Purpose |
|---|---|---|
| Account identifiers | Pseudonymous app account ID (UUID); no name or national ID required | Session continuity, moderation |
| Verification data | ZK proof commitment hash and nullifier (no raw document or credential) | Preventing double-enrolment |
| Dialogue metadata | Squad ID, session timestamps, message sequence numbers | Routing, ordering |
| Message content | AES-256-GCM ciphertext (server-side encrypted at rest) | Dialogue delivery |
| Coarse matching attributes | Generalized region, language preference, availability window | Matchmaking |
| Operational logs | Aggregated error codes and latency buckets (no full request bodies or IPs in long-term storage) | Platform stability |

We do **not** collect: real names, email addresses by default, national IDs, device fingerprints, precise location, or raw IP addresses in persistent storage.

## 2. How we use data

- Operate the platform and provide dialogue functionality.
- Detect and prevent abuse, spam, and duplicate registrations.
- Improve matching quality using aggregate (non-identifying) signals.
- Meet legal obligations where required.

We do **not** sell data, share data with advertisers, or use dialogue content for marketing.

## 3. Who sees your data

- **You**: you control your own session and can request deletion.
- **Moderators**: view anonymized transcripts (metadata only) for safety review; cannot see your account identity or ZK credentials.
- **Platform operators**: database access is restricted by role; message content is encrypted with squad-level keys; the operator cannot read plaintext messages without key access (see [docs/security/encryption-scope.md](./docs/security/encryption-scope.md)).
- **Third-party processors**: Supabase (cloud database and auth), Sentry (error reporting, PII-scrubbed before transmission). No other third-party processors receive dialogue data.

## 4. Retention and deletion

See [DATA_RETENTION.md](./DATA_RETENTION.md) for full retention windows and deletion procedures. In summary:

- Active session data: retained for the duration of the squad session plus a configurable hold window.
- Message ciphertext: automatically purged according to the retention schedule (default: 90 days post-session archive).
- Account data: deleted on account deletion request; cascades through all related tables.
- ZK proof data: retained only as long as required for fraud prevention (shortest feasible window).

To request deletion, contact us using the address in [SECURITY.md](./SECURITY.md) or use the in-app account-deletion flow.

## 5. Security

We apply server-side AES-256-GCM encryption to message content, use ZK verification to minimise identity exposure, enforce row-level security on all database tables, and apply strict rate limits and access controls. Details in [docs/security/threat-model.md](./docs/security/threat-model.md).

**Important limitation:** current encryption is server-side (operator can access keys). Full client-side end-to-end encryption is on the roadmap. See [ROADMAP.md](./ROADMAP.md).

## 6. Your rights

Depending on your jurisdiction you may have the right to access, correct, or delete your data, or to object to processing. Contact us to exercise these rights. We will respond within 30 days.

## 7. Changes to this policy

We will notify participants of material changes. The date at the top of this file tracks the last revision.

## 8. Contact

See [SECURITY.md](./SECURITY.md) for security disclosures and general contact information.
