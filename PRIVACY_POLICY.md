# Privacy Policy

*Last updated: 2026-04-28. Scaffold — pending legal review and jurisdiction-specific additions before public deployment.*

---

We know privacy policies are usually long and confusing. This one is meant to be readable in under five minutes, honest about what we don't know yet, and written so you can trust it.

## Who we are

SquadRidge is a verified-anonymous dialogue platform for structured, cross-border conversations. The company is early-stage; a formal legal entity and DPA are in progress. Until those are published, treat this document as our good-faith technical and operational commitment.

## What we collect and why

### Account identifiers

When you sign in via magic link or OTP, Supabase (our auth provider) stores your email address and a persistent internal user ID (`auth.users.id`). We need this to let you back in and to tie your session to a squad. We do not store passwords.

**What to know:** Your email is a strong real-world identifier. If you need stronger anonymity — for example, if you're operating in a context where your email itself reveals your identity — we'd recommend using a purpose-specific address and a VPN or Tor before we've shipped more robust anonymous-account options.

### Profile and matching data

You optionally fill in a callsign, region hint, language preferences, and experience tags. These help us match you with the right squad. We store them in `public.profiles`. Peers in your squad see a limited projection (callsign, role, coarse tags, region hint) but there is no global directory or cross-squad search.

**Limitation:** Combining callsign uniqueness, region hint, language, and tags can re-identify someone in a small population. We document this risk in the engineering threat model and are working on progressively reducing it.

### Messages

Messages are encrypted at the application layer with AES-256-GCM before storage. The encryption key lives server-side in the squad record. This means SquadRidge and anyone with database access can read your messages if they choose to. **This is not end-to-end encryption in the cryptographic sense.** We say this clearly because an anonymous mental-health or dialogue platform that obscures this fact creates false expectations.

We are building toward true E2E (Signal-style key distribution); that roadmap is in ROADMAP.md. Until then, do not share anything you would be harmed by if the operator or a database administrator could read it.

### Matchmaking metadata

When you enter a matchmaking queue, we store your user ID, intent tags, timing, and side (requester / responder) in `public.match_queue`. This is used to find a compatible squad partner. Queue rows are short-lived and are deleted after a match or cancellation.

### Moderation and safety records

If a message is flagged for review, a moderator may access the plaintext via an audited RPC (every access is logged). Flagged content is retained for the minimum period needed to resolve the review, then deleted. The audit log itself is retained for 90 days.

### ZK verification records

If you complete a zero-knowledge proof (e.g., proving membership in a verified group), the proof commitment and nullifier are stored server-side, bound to your user ID. This means the platform knows "this account produced this proof" — it does not store the raw attribute you proved (e.g., your actual credential document).

### Error reporting (Sentry)

If Sentry is configured (`VITE_SENTRY_DSN`), crashes and unexpected errors are sent to Sentry. Before sending, we scrub known PII fields and truncate any string longer than 512 bytes to prevent accidental message-body capture. We send a salted hash of your user ID (not the raw UUID) so we can correlate errors across sessions without exposing your identity.

### What we do not collect

- Raw IP addresses are not stored in application tables. We hash and salt them before use.
- Browser user-agent strings are removed from server-side request context before any logging.
- We do not run advertising trackers.
- We do not sell or share data with third-party marketers.

## Where data lives

Application data lives in Supabase (PostgreSQL). Supabase has its own privacy policy and data processing agreements — we recommend you read them if you are a facilitator or pilot operator deploying SquadRidge for others. Edge Functions run on Deno Deploy (Supabase's hosting). Error reports go to Sentry if configured. We will publish a complete sub-processor list as we formalize contracts.

## Retention windows

Short form — see DATA_RETENTION.md for details:

| Data type | Retention |
|---|---|
| Active messages | While squad is active |
| Archived squad messages | 90 days after archive, then deleted |
| Match queue rows | Deleted on match or 24-hour expiry |
| Moderation audit logs | 90 days |
| ZK proof records | 180 days |
| Waitlist signups | Until withdrawn, max 2 years |

## Your rights

You can:
- Request export of your data by contacting us (email below).
- Request deletion of your account and associated data.
- Withdraw consent for error reporting by not setting VITE_SENTRY_DSN in your deployment.

If you're in the EU, GDPR gives you additional rights (access, rectification, portability, erasure, objection). We'll honor those — contact us and we'll respond within 30 days.

**Limitation:** Full automated self-service for data export and deletion is on the roadmap, not shipped yet. Today it requires contacting us directly.

## Children

SquadRidge is not intended for children under 16. We don't knowingly collect data from minors.

## Changes to this document

We'll update this document as the product evolves. Significant changes will be noted in CHANGELOG.md and communicated to active pilot operators directly.

## Contact

If you have questions, concerns, or a data request: use the contact in SECURITY.md (same address). We will route privacy requests to the right person.

---

*This document is a scaffold. It is written in good faith but has not been reviewed by a lawyer. Before deploying SquadRidge to real users, especially in regulated jurisdictions, get a proper legal review. If you are a pilot operator, you may need your own DPA with SquadRidge and with Supabase.*
