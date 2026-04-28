# Due Diligence Reference

**Last updated: 2026-04-28**
**Audience: Investors, partners, and technical reviewers**

This document is a practical reference for anyone conducting diligence on SquadRidge. It maps engineering claims to code locations, lists current limitations honestly, and provides a demo script and KPI framework. It complements [DILIGENCE_OVERVIEW.md](DILIGENCE_OVERVIEW.md) and the technical threat model at [docs/security/threat-model.md](docs/security/threat-model.md).

---

## 1. Investor diligence checklist

### Architecture and privacy

| Claim | Evidence | Caveat |
|-------|----------|--------|
| Messages are encrypted at rest | `src/lib/messageCrypto.ts` — AES-256-GCM, random IV per message | Not E2E — operator/Supabase can read; see threat model §5 |
| Message key is server-generated on squad creation | Migration `20260417150000_squads_message_encryption_key_server_default.sql` | No key rotation in v1 |
| Direct client INSERT to messages is blocked | Migration `20260428194500_messages_insert_edge_only.sql`; pgTAP test | All writes go through Edge function with server-side redaction |
| Moderator decrypt is audited | Migration `20260428120000_moderator_decrypt_audit_rpc.sql` | Requires justification; tamper-resistant log — not operator-proof |
| Semaphore ZK proofs verified server-side | `supabase/functions/_shared/handleZkProofVerification.ts` | Proof root must match `issuer_groups.current_root` |
| IP addresses not persisted | `src/middleware/anonymizeRequest.ts` scaffold | Full server-side deployment of anonymizer TBD |
| No raw IP in error telemetry | `src/lib/sentry.ts` — `beforeSend` scrubs long strings | Sentry DSN not required for builds; opt-in |

### Compliance and governance

| Item | Status |
|------|--------|
| Privacy policy | Draft — see [PRIVACY_POLICY.md](PRIVACY_POLICY.md) |
| Data retention policy | Draft — see [DATA_RETENTION.md](DATA_RETENTION.md) |
| Threat model | Complete — see [docs/security/threat-model.md](docs/security/threat-model.md) |
| Security disclosure process | See [SECURITY.md](SECURITY.md) |
| Code of conduct | See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| SOC 2 | Not yet — roadmap item (12–18 months) |
| GDPR DPA with Supabase | Supabase provides a standard DPA; review required |
| Bug bounty program | Planned — post-Series A |
| Pentest | Not yet completed; planned before pilot launch |

### Technical risk register (honest)

| Risk | Current mitigation | Residual risk | Roadmap |
|------|-------------------|---------------|---------|
| Operator-readable messages | AES-GCM at application layer; audited moderator decrypt | High — any Supabase/service-role access reads plaintext | True E2E (MLS/Signal-style) |
| No forward secrecy | None | High — historical messages decrypt if key compromised | Key rotation → per-message keys (long-term) |
| Semaphore decoys in demo mode | Two-flag gate; CI blocks prod builds | Low for prod; documented risk for demo | Issuer-managed groups for pilots |
| Dependency vulnerabilities | Dependabot weekly; `npm audit` in CI | Moderate — @xenova/transformers chain has known residual | Tracked in `docs/security/dependency-advisories.md` |
| Rate limiting | Upstash Redis via Edge; client-side soft throttle | Medium — full server-side not deployed | `src/middleware/rateLimiter.ts` scaffold |
| Secrets in repo history | `scripts/scan-secrets.sh` provided; husky pre-commit | Low — scan should be run on any new clone | gitleaks in CI (roadmap) |

---

## 2. Demo script

This script is for a 20-minute live demo. Run it in a staging environment, never in production.

### Pre-demo checklist

- [ ] Staging environment healthy (`supabase status`)
- [ ] At least 3 demo personas ready (see `src/demo/demoPersona.ts`)
- [ ] Semaphore demo mode on for staging (`.env.e2e`)
- [ ] Screen sharing ready, no personal accounts visible

### Demo flow

1. **Anonymous sign-in (2 min)**
   - Open the app; choose "Continue anonymously."
   - Show: no name/email required for the core experience.
   - Narrate: "We issue a temporary session identity. No email unless you want magic-link recovery."

2. **Squad matching (3 min)**
   - Submit a conflict scenario with 2–3 intent tags.
   - Show the matchmaking queue and estimated wait time.
   - Narrate: "The pool key is a hash of your tags — we never store your tags in plaintext in a row you can be linked to."

3. **Encrypted messaging (5 min)**
   - Exchange messages in a matched squad.
   - Open DevTools → Network; show that the payload is ciphertext.
   - Narrate: "AES-256-GCM, server-encrypted. A future milestone is full E2E — we're honest that today the platform can read with privileged access."

4. **Moderation and safety (3 min)**
   - Show the moderation dashboard (admin view).
   - Trigger the audit trail: attempt to access message plaintext — show the required justification prompt.
   - Narrate: "Every decrypt is logged. We're building accountability before we scale."

5. **ZK credential verification (3 min)**
   - Show a Semaphore proof being submitted and verified on the Edge.
   - Narrate: "This proves membership without revealing which member. The proof root must match the issuer's signed manifest."

6. **Privacy and exit (2 min)**
   - Show the "Leave and forget" one-tap exit.
   - Narrate: "Session ephemeral identifiers cleared. Deletion request goes to the queue."

7. **Q&A**

### Known demo caveats to pre-empt

- "Is this E2E encrypted?" → "Application-layer AES-GCM today. Full E2E is on the roadmap with a clear milestone — see ROADMAP.md §3."
- "Can you see what users are saying?" → "With service-role access, yes. That access is MFA-gated, logged, and will require break-glass approval post-launch."
- "What if there's a legal order?" → "We comply with valid legal orders. Users in high-risk contexts should read the threat model before relying on the platform."

---

## 3. KPIs and metrics

### Growth

- Monthly active squads (unique `squad_id` with at least one message in 30 days)
- 7/30/90-day squad retention
- Time-to-first-squad (from sign-up to first message sent)

### Safety

- Flagged-content SLA: % resolved within 24 hours
- False positive rate for automated moderation classifiers
- Moderator response time (median)

### Privacy and trust

- Zero incidents of user re-identification (target: 0)
- Mean time to rotate a compromised key
- % of builds shipping without `VITE_ZK_STUB=true`

### Infrastructure

- API p99 latency (matchmaking, message ingest)
- Error rate (Sentry)
- Rate-limit hit rate (signals abuse or growth)

---

## 4. What to review carefully (for engineers in diligence)

1. **[docs/security/threat-model.md](docs/security/threat-model.md)** — read §5 ("Claims that hold today") and §13 carefully. They are explicit about current limitations.
2. **[supabase/migrations/](supabase/migrations/)** — the migration history shows the security posture evolution. Note RLS policies and Edge-only inserts.
3. **[src/lib/messageCrypto.ts](src/lib/messageCrypto.ts)** — AES-GCM implementation and key handling.
4. **[supabase/functions/_shared/handleZkProofVerification.ts](supabase/functions/_shared/handleZkProofVerification.ts)** — ZK proof path.
5. **[src/middleware/anonymizeRequest.ts](src/middleware/anonymizeRequest.ts)** and **[src/middleware/rateLimiter.ts](src/middleware/rateLimiter.ts)** — scaffolds for the server-side anonymizer and rate limiter; review the comments and TODO items.

---

## 5. Next steps for post-investment

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | Independent pentest before pilot | Security lead |
| P0 | Legal review of PRIVACY_POLICY.md and DATA_RETENTION.md | Legal counsel |
| P1 | Wire SENTRY_DSN and ANON_PEPPER in production | Engineering |
| P1 | Deploy Redis-backed rate limiter | Engineering |
| P1 | Automate message partition retention | Engineering |
| P2 | SOC 2 Type I readiness audit | Ops |
| P2 | Bug bounty program | Security |
| P3 | True E2E encryption (MLS) | Engineering (long-term) |

---

*For questions, see [SECURITY.md](SECURITY.md) for the engineering contact.*
