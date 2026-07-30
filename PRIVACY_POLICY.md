# Privacy policy

## Summary — short and direct

MENDguild is designed to be privacy‑forward. We want people to feel safe sharing without fear of identification. This document explains, in plain language, what data we collect, why, and how we protect it. This is a readable summary for users and reviewers — legal review is required before publication.

## What we aim to protect

- Anonymity of participants in conversations
- The content of messages (sensitive personal content)
- Minimal operational metadata needed to run the service

## What we collect (short list)

- Conversation content: by default messages are stored as ciphertext on the server (or in future releases, client-side encrypted). Plaintext is never intentionally logged.
- Session tokens / ephemeral handles: short-lived tokens that let you resume a conversation in-browser. These do not include email unless you provide it.
- Minimal metadata: timestamps (for ordering), conversation IDs, and lightweight metadata (tags, language) to enable basic product features and moderation. We hash or truncate identifying information where possible.
- Diagnostics (only if you opt in): crash reports and logs with PII redaction enabled.

## What we do not collect (by default)

- We do not require email or phone to start a conversation.
- The application does not store raw IP addresses in its own tables. Rate limiting in the Edge Functions keys on the authenticated user id rather than on IP (see [`supabase/functions/rate-limit/index.ts`](./supabase/functions/rate-limit/index.ts)). IPs that appear at the platform edge (Supabase, the host, the CDN) are governed by those platforms' log retention settings; we limit dashboard access and document each surface in [`docs/operations/ip-logging.md`](./docs/operations/ip-logging.md).
- We do not store device fingerprints intended for long-term tracking.

## How the data is used

- To deliver messages between participants.
- To support moderation and safety (automated classifiers + human review when needed).
- To operate and debug the service (with PII removed before storage or transmitted to monitoring services).
- To run short-lived analytics for product improvement; all analytics are designed to minimize re-identification risk.

## Security measures we have in place

- Application-layer AES-256-GCM encryption for message payloads, using a per-squad symmetric key stored in `squads.message_encryption_key`. This is operator-readable, not Signal-grade end-to-end encryption; see [`docs/security/threat-model.md`](./docs/security/threat-model.md) for the exact boundary. KMS-wrapped envelope encryption for backup keys is a target, not a deployed control today.
- All chat writes go through the `ingest-message` Edge Function, which redacts the message server-side before persistence; direct client `INSERT` into `public.messages` is denied by RLS (migration `20260428194500_messages_insert_edge_only.sql`).
- Sentry error reports are sanitised by a `beforeSend` hook ([`src/lib/sentry.ts`](./src/lib/sentry.ts)): dev noise is dropped, oversized strings in `extra` / `contexts` are truncated, and the user id sent to Sentry is a salted SHA-256 truncation rather than the raw `auth.users.id`.
- Access to production databases and backups is limited to a small ops group; keys are kept in the host secret manager and never committed to the repo.

## Moderation and safety tradeoffs

- We use a combination of automated classifiers and human-in-the-loop moderation to flag abusive or crisis content.
- In rare cases (imminent risk of harm) the product may surface crisis resources. We do not proactively share identifying information with third parties except under legal compulsion.
- All flagged content handling is logged in a restricted audit trail. Audit logs are minimized and access-controlled.

## User rights and requests

- Data access: You can request details about what we store for your conversation. Since we design for anonymity, some data (e.g., IPs) is not stored in raw form.
- Deletion: We provide an in-app “Leave & forget” option that ends your session and requests deletion of your recent messages. Deletion follows the schedule in DATA_RETENTION.md.
- Legal requests: If a lawful request is made for our logs or data, we will follow legal process and push back where appropriate. We will notify users when permitted and we’ll document the legal request handling procedure internal to the company.

## Limitations and tradeoffs (be honest)

- KMS-wrapped backup keys, application-layer IP hashing, and partitioned message storage are described elsewhere as targets. They are not deployed today; the source-of-truth for what is implemented is [`docs/security/threat-model.md`](./docs/security/threat-model.md) and [`DATA_RETENTION.md`](./DATA_RETENTION.md).
- Client-side end-to-end encryption is a future milestone. Until it ships, message payloads are encrypted with a per-squad key that any squad member, sanctioned moderator, or operator with direct database access can read. We do not describe this as Signal-grade or operator-blind. See [`CURRENT_STATUS.md`](./CURRENT_STATUS.md) and related product docs for what we will and will not claim publicly.

## Contact and next steps

- For privacy questions or data removal requests: privacy@mendguild.example (replace before publishing).
- For legal or compliance reviews, see DATA_RETENTION.md and [`docs/security/threat-model.md`](docs/security/threat-model.md).

## Thank you

We want people to trust the platform. We’ll continue to iterate and to be transparent about the limits of what we can and cannot guarantee.
