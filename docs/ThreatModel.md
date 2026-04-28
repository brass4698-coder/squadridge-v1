# Threat Model (Summary)

**Status: Summary reference — the authoritative threat model is at [docs/security/threat-model.md](security/threat-model.md)**
**Last updated: 2026-04-28**

This document is a high-level executive summary for reviewers who want a quick orientation. Engineers and security reviewers should read the full threat model linked above.

---

## What we're protecting

SquadRidge facilitates sensitive, anonymous peer conversations in conflict and crisis contexts. The core things we're protecting:

1. **User identity** — who is talking, from where, with whom
2. **Message content** — what users say in squads
3. **Participation metadata** — that a user participated at all, and when
4. **ZK credential attributes** — the credential type verified, though not the credential itself

---

## Who we're defending against

| Adversary | Current protection | Gap |
|-----------|-------------------|-----|
| Other participants | Pseudonymous handles only; no cross-squad linking | Writing-style analysis could still link users |
| Network observer | TLS in transit | Timing and volume patterns still visible |
| Honest-but-curious operator | AES-GCM at rest; audited moderator decrypt | Operator with DB access CAN read with privileged access |
| Compromised operator / breach | Same as above | No forward secrecy; breach exposes all historical messages |
| Compelled access (legal) | Not protected beyond legal minimization | We comply with valid legal orders |
| Platform vendor (Supabase) | Contractual DPA | Supabase sees metadata; backup access is a risk |

---

## Attack surfaces (summary)

```
┌─────────────────────────────────────────────────────────┐
│                    Attack surfaces                       │
│                                                         │
│  1. Browser client          ← XSS, local storage leak   │
│  2. Auth tokens             ← Session hijacking         │
│  3. API endpoints           ← Rate limiting, input val. │
│  4. Edge Functions          ← Service-role abuse        │
│  5. Database                ← RLS bypass, SQL injection │
│  6. Supabase platform       ← Vendor breach             │
│  7. Semaphore ZK            ← Stale proof root, replay  │
│  8. Client encryption keys  ← Extraction from browser   │
│  9. Logging/monitoring      ← PII leakage in logs       │
│  10. Dependency chain       ← Supply chain attack       │
└─────────────────────────────────────────────────────────┘
```

---

## Mitigations in place

| Surface | Mitigation |
|---------|-----------|
| Message content | AES-256-GCM at application layer; Edge-only inserts |
| Auth | Supabase magic link / anonymous session; JWT validation |
| Rate limiting | Upstash Redis via Edge; client-side soft throttle |
| PII in logs | Sentry `beforeSend` scrubs; IP hash in request anonymizer |
| SQL injection | Parameterized queries via Supabase JS client; RLS |
| ZK replay | Nullifier deduplication in `zk_proof_submissions` |
| Moderator abuse | Audited decrypt RPC with required justification |
| Dependency chain | Dependabot; `npm audit` in CI; dependency review action |
| Secrets in repo | `.env.example` only; husky pre-commit lint; scan-secrets.sh |

---

## What is NOT mitigated today

Be explicit with users and partners about these gaps:

1. **End-to-end encryption** — the platform can read message plaintext with service-role access. Roadmap: MLS/Signal-style E2E.
2. **Forward secrecy** — if the squad key is compromised, all historical messages decrypt. Roadmap: key rotation and per-session derivation.
3. **IP address at the platform edge** — Supabase/CDN sees your IP; we hash before logging but the hash happens after the request reaches our Edge.
4. **Metadata analysis** — timing, message frequency, and squad membership patterns are still linkable by an operator.
5. **Tor/VPN** — we do not provide or require Tor routing.
6. **On-device forensics** — messages cached in the browser are not protected against physical device access.

---

## Where to read more

- Full threat model with adversary tiers, trust boundaries, and pre-deployment checklist: [docs/security/threat-model.md](security/threat-model.md)
- Encryption scope (what "encrypted" means here): [docs/security/encryption-scope.md](security/encryption-scope.md)
- Architecture diagram and data flows: [docs/Architecture.md](Architecture.md)
- Secrets rotation: [docs/security/secrets-rotation.md](security/secrets-rotation.md)

---

*This is not the authoritative threat model. If you are making a security decision, read the full document.*
