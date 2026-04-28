# Privacy policy

## Summary — short and direct

SquadRidge is designed to be privacy‑forward. We want people to feel safe sharing without fear of identification. This document explains, in plain language, what data we collect, why, and how we protect it. This is a readable summary for users and reviewers — legal review is required before publication.

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
- We do not collect raw IP addresses into persistent storage. On the server we replace IPs with a salted/peppered truncated hash to support rate limiting and abuse controls.
- We do not store device fingerprints intended for long-term tracking.

## How the data is used

- To deliver messages between participants.
- To support moderation and safety (automated classifiers + human review when needed).
- To operate and debug the service (with PII removed before storage or transmitted to monitoring services).
- To run short-lived analytics for product improvement; all analytics are designed to minimize re-identification risk.

## Security measures we have in place

- Field-level server-side encryption (KMS-wrapped keys) for sensitive fields is scaffolded in the repo. Real KMS wiring is a deployment step described in DATA_RETENTION.md and in the repo comments.
- Request anonymization middleware strips and replaces sensitive headers before logging.
- Access to production DBs and backups is limited to a small ops group; keys are stored in a secret manager (not in the repo).
- We scrub PII from error reports (Sentry before-send hook is included as a scaffold).

## Moderation and safety tradeoffs

- We use a combination of automated classifiers and human-in-the-loop moderation to flag abusive or crisis content.
- In rare cases (imminent risk of harm) the product may surface crisis resources. We do not proactively share identifying information with third parties except under legal compulsion.
- All flagged content handling is logged in a restricted audit trail. Audit logs are minimized and access-controlled.

## User rights and requests

- Data access: You can request details about what we store for your conversation. Since we design for anonymity, some data (e.g., IPs) is not stored in raw form.
- Deletion: We provide an in-app “Leave & forget” option that ends your session and requests deletion of your recent messages. Deletion follows the schedule in DATA_RETENTION.md.
- Legal requests: If a lawful request is made for our logs or data, we will follow legal process and push back where appropriate. We will notify users when permitted and we’ll document the legal request handling procedure internal to the company.

## Limitations and tradeoffs (be honest)

- This repo includes scaffolds for encryption and KMS integration. The code shows the intended approach, but a production deployment must wire a real KMS provider and rotate keys.
- Client-side E2EE (end-to-end encryption) is a future milestone. Until then, we encrypt server-side fields to reduce risk, but server‑side operators with DB access may be able to access ciphertext metadata. We document current status and roadmap tradeoffs in [`CURRENT_STATUS.md`](CURRENT_STATUS.md) and related product docs.

## Contact and next steps

- For privacy questions or data removal requests: privacy@squadridge.example (replace before publishing).
- For legal or compliance reviews, see DATA_RETENTION.md and [`docs/security/threat-model.md`](docs/security/threat-model.md).

## Thank you

We want people to trust the platform. We’ll continue to iterate and to be transparent about the limits of what we can and cannot guarantee.
