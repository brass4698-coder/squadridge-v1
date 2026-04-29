# RFC: End-to-end messaging key hierarchy (Phase 4)

## Status

Design / pre-implementation. **Do not** ship user-facing “full E2E” claims until this RFC is reviewed and the threat model is updated. The decision to defer building this RFC, and the triggers that would re-open it, is recorded in [ADR 004](../adr/004-defer-operator-blind-e2e.md).

## Problem

Today, a **shared squad symmetric key** in `squads.message_encryption_key` encrypts payloads stored in Postgres. Any client with the key can decrypt; the **operator** can also read keys and ciphertext ([`docs/security/encryption-scope.md`](../security/encryption-scope.md)).

## Target properties (product-dependent)

- **Confidentiality from operator**: ciphertext in `messages` is not decryptable by the service using only server-held secrets.
- **Membership**: only current squad participants can decrypt (define behavior on join/leave and archival).
- **Practical migration**: existing squads may need re-keying or dual-read windows.

## Proposed directions (non-prescriptive)

1. **Per-user key pairs** (X25519 or similar) established at join time; squad messages wrapped with a derived group key or pairwise channels.
2. **Double Ratchet**-style sessions for forward secrecy (significant complexity; mobile/offline constraints).
3. **Hybrid**: keep shared squad key for MVP-class rooms; offer “high assurance” rooms with stricter key ceremony.

## Implementation sketch

- Client: extend [`src/lib/messagePayload.ts`](../../src/lib/messagePayload.ts) with versioned payload types; key material in [`src/lib/squadMessageKey.ts`](../../src/lib/squadMessageKey.ts) or successor module.
- Server: avoid storing private keys; public keys only if needed; RLS for `user_devices` / key registry tables.
- Edge: verify format and membership, not plaintext content.

## Exit criteria (from roadmap)

- Security review sign-off.
- Updated [`docs/security/threat-model.md`](../security/threat-model.md) and encryption scope.
- Migration plan for existing rows.
