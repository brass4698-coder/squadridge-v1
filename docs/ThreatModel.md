# Threat Model

> This document is an index/alias for investor and partner audiences.
> The full, continuously maintained threat model lives at
> [`docs/security/threat-model.md`](security/threat-model.md).

---

## Summary

SquadRidge processes sensitive personal dialogue in an anonymous peer-support context. The threat model addresses:

1. **Re-identification** — linking an ephemeral squad participant to a real-world identity.
2. **Message confidentiality** — unauthorised access to message content (at rest or in transit).
3. **Abuse and harassment** — bad actors exploiting the anonymity guarantees to harm other participants.
4. **Operator over-reach** — insider or operator access to data beyond what is necessary.
5. **Infrastructure compromise** — supply-chain, credential, or cloud-provider attacks.

---

## Key assets

| Asset | Confidentiality requirement | Integrity requirement |
|-------|-----------------------------|-----------------------|
| Message content | High (encrypted at rest) | High (authenticated encryption) |
| Participant handle → real identity mapping | Must not exist in the system | N/A |
| Session tokens | High (short-lived, invalidated on disconnect) | High |
| KMS data-keys | Critical (never stored unencrypted) | Critical |
| Moderation audit log | Medium (operator-only access) | High (append-only) |

---

## Current guarantees

- Messages are encrypted at rest with AES-GCM (server-side, KMS-wrapped keys). Ciphertext only is stored.
- Ephemeral handles are generated per-session; no cross-session linkage is stored.
- Raw IP addresses are never written to persistent storage (see `src/middleware/anonymizeRequest.ts`).
- Rate-limiting uses hashed device signals, not raw identifiers (see `src/middleware/rateLimiter.ts`).
- Row-level security (RLS) is enforced on all Supabase tables.
- ZK-based session attribute proofs allow credential verification without revealing the underlying value.

## Current non-goals (documented trade-offs)

- **End-to-end encryption** — messages are encrypted at the server, not client-side. Operators with KMS access can decrypt. E2EE is on the roadmap (Q3 2026). This is disclosed in `PRIVACY_POLICY.md` and the in-app security page.
- **Full forward secrecy** — planned post-E2EE implementation.
- **Anonymity set size guarantees** — Semaphore group size depends on enrolled members; small groups reduce k-anonymity.

---

## Mitigations by threat category

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Re-identification via logs | Request anonymizer scrubs IP/UA before any log write | Scaffold — wire to server runtime |
| Re-identification via DB | Ephemeral handle only; no name/email stored | Active |
| Message breach | AES-GCM at rest + TLS in transit | Scaffold (server-side) / Active (TLS) |
| Credential theft | Short-lived session tokens; secrets in KMS / secret manager | Active (Supabase JWT); KMS scaffold |
| Abuse / spam | Redis-backed rate limiter per hashed session token | Scaffold — wire Redis |
| Insider threat | RLS + least-privilege DB roles; audit log | Active (RLS); audit log in progress |
| Supply-chain attack | Dependabot; `npm audit`; secrets scan pre-commit | Active |
| Sentry PII leak | before-send hook scrubs message content and user fields | Scaffold — wire DSN |

---

## Full detail

See [`docs/security/threat-model.md`](security/threat-model.md) for the complete asset inventory, adversary profiles, attack trees, and remediation tracking.
