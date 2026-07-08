# Semaphore ZK self-assessment (internal)

Internal security assessment for Semaphore proof verification in SquadRidge.
External review remains recommended before high-risk cohorts; this document satisfies
the threat-model §6 gate for documented internal sign-off.

**Assessed:** 2026-07-08  
**Scope:** Client proof generation, Edge verification, issuer-managed groups

## Components reviewed

| Component | Path | Finding |
|-----------|------|---------|
| Proof verification | `supabase/functions/_shared/handleZkProofVerification.ts` | Server calls `verifyProof`; binds scope to `user_id` |
| Stub guard | `vite.config.ts`, `scripts/ensure-no-zk-stub-prod.mjs` | Production refuses `VITE_ZK_STUB=true` |
| Issuer manifests | `src/lib/zk/issuerManifest.ts` | Signature + stale root rejection |
| Demo decoys | `VITE_SEMAPHORE_DEMO_GROUP` + prod gate | Collapsed anonymity set blocked in prod CI |

## Residual risks (accepted for pilot)

- Proofs verified server-side — platform learns account ↔ scope binding
- Issuer manifest refresh cron deferred (RFC §4.3) — manual refresh before expiry
- Hash stub in dev only — never for real users

## Sign-off criteria met

- [x] Production build guards documented and enforced in CI
- [x] Issuer-managed path implemented with fail-closed stale root
- [x] Public copy does not claim full anonymity or operator-blind encryption
- [ ] External cryptographic review (recommended before authoritarian-context pilots)

**Decision:** Approved for **facilitator-led pilot** with honest bounds in UI. Re-assess before expanding to highest-risk adversary tiers (threat-model §3 tiers 4–5).
