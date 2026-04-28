# Threat Model (summary)

*This is a short summary for readers who want the overview quickly. The full, maintained engineering document is at [`docs/security/threat-model.md`](security/threat-model.md) — read that before making any security-relevant decision.*

---

## What we protect (assets)

- **User identity and account** — Supabase Auth user ID, email (if provided), profile fields
- **Message content** — encrypted at rest with AES-256-GCM; not E2E against the operator
- **Verification proofs** — ZK proof commitments, nullifiers, linked to user ID server-side
- **Matchmaking metadata** — intent tags, timing, user ID

## Who we protect against (adversary tiers)

1. **Other participants** — peers in the same squad; limited to what RLS exposes (callsign, messages, not raw identity)
2. **Network observers** — TLS protects content in transit; metadata (timing, SNI) is out of scope for MVP
3. **Honest-but-curious operator** — our own team, database admin; can read message keys and content — documented and accepted for MVP
4. **Compromised operator / breach** — same as above but adversarial; mitigated by access controls, audit logs, and eventual KMS
5. **Platform vendor (Supabase)** — contractual; logs auth events and edge requests by default

## What we protect today

- Messages are encrypted (AES-256-GCM) at rest — ciphertext in `messages.payload_ciphertext`
- Direct client INSERT into messages is blocked by RLS (enforced since migration 20260428194500)
- Moderator plaintext access is audited (migration 20260428120000)
- ZK proofs are verified server-side against issuer-managed Merkle roots
- Sentry PII scrubbing via `beforeSend` hook
- Rate limiting on key actions (Upstash Redis via Edge Function)
- Request anonymization middleware (IP hashing, UA removal) — scaffold, not yet deployed on all paths

## What we don't protect yet

- **Operator or service-role** access to message plaintext — operator is trusted in the current model
- **True E2E encryption** — squad keys are server-held; see ROADMAP.md Phase 2 for the path
- **Forward secrecy** — no per-session key rotation; if the squad key leaks, historical messages decrypt
- **On-device forensic resistance** — out of scope for MVP
- **KMS-backed key management** — `src/utils/encryption.ts` is a scaffold showing the pattern; not yet deployed
- **Network metadata** — timing attacks, traffic analysis, SNI-based usage detection

## Key mitigations in place

| Risk | Mitigation | Status |
|---|---|---|
| Plaintext message storage | AES-256-GCM, squad key in DB | ✅ Implemented |
| Unauthorized message insert | RLS `WITH CHECK (false)` — Edge-only inserts | ✅ |
| Moderation access without audit trail | Audited RPC, justification required | ✅ |
| PII in error reports | Sentry beforeSend scrubbing | ✅ |
| Request PII (IP, UA) | Anonymization middleware | 🔶 Scaffold |
| Brute-force / abuse | Upstash Redis rate limiter on Edge | ✅ |
| Committed secrets | .env.example, Husky pre-commit, Dependabot | ✅ |
| Supply chain vulnerabilities | Dependabot weekly, dependency-review action on PRs | ✅ |
| ZK proof replay | Nullifier uniqueness constraint, server-side verification | ✅ |

---

For attack surface diagrams, adversary decision trees, and the full pre-deployment gate checklist, see `docs/security/threat-model.md`.
