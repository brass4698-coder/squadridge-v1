# Data retention (operators) — Phase 2 alignment

This note ties product language to **enforceable** operator practice. It is not legal advice.

## Messaging

- Messages are stored as ciphertext in `messages.payload_ciphertext` with per-squad keys on `squads`. Retention policies (delete after session end, user-initiated export then delete, etc.) should be implemented as **scheduled jobs** or **Edge Functions** once product requirements are fixed — the schema supports archiving (`squads.archived_at`) but automatic row deletion is environment-specific.

## Moderation audit

- `moderation_audit_log` is append-only for human actions taken through moderator RPCs. Retain audit rows at least as long as regulatory or internal policy requires; export before shortening retention.

## ZK / verification artifacts

- See [`docs/technical/data-retention-zk.md`](../technical/data-retention-zk.md) if present, and the threat model for what must be kept for replay protection vs what can be minimized.

## Ledger

- Published `ledger_proposals` rows are intended to be **durable public records**. Do not delete published entries without a legal/compliance review; prefer `status = 'archived'` if the product adds that path for takedowns.
