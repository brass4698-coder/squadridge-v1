# Due Diligence Reference

This document consolidates the key materials an investor, partner, or acquirer will need for technical, legal, and commercial due diligence on SquadRidge.

For a narrative overview see [DILIGENCE_OVERVIEW.md](./DILIGENCE_OVERVIEW.md). For the product roadmap and KPIs see [ROADMAP.md](./ROADMAP.md).

---

## 1. Technical diligence

### Architecture and data flows
- [docs/technical/architecture-overview.md](./docs/technical/architecture-overview.md) — full stack diagram, component responsibilities, data flow
- [docs/Architecture.md](./docs/Architecture.md) — high-level diagram + threat model summary

### Security posture
- [docs/security/threat-model.md](./docs/security/threat-model.md) — assets, adversaries, guarantees, non-goals
- [docs/security/encryption-scope.md](./docs/security/encryption-scope.md) — what is and isn't encrypted
- [docs/security/secrets-rotation.md](./docs/security/secrets-rotation.md) — key lifecycle
- [SECURITY.md](./SECURITY.md) — vulnerability reporting, safe harbour, supply-chain posture
- [src/utils/encryption.ts](./src/utils/encryption.ts) — KMS-backed server-side encryption skeleton

### Privacy and data
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) — user-facing privacy policy
- [DATA_RETENTION.md](./DATA_RETENTION.md) — retention windows, deletion procedures, access controls
- [docs/technical/data-retention-zk.md](./docs/technical/data-retention-zk.md) — ZK-specific retention

### API surface
- [docs/technical/openapi.yaml](./docs/technical/openapi.yaml) — OpenAPI 3 specification for key endpoints

### CI / code quality
- [.github/workflows/ci.yml](./.github/workflows/ci.yml) — lint, type-check, unit tests, production build, dependency review, npm audit

### Compliance controls checklist

| Control | Status | Location |
|---|---|---|
| Dependency review (new high/critical) | ✅ Automated on every PR | CI workflow |
| npm audit (production runtime) | ✅ Informational on every push | CI workflow |
| Strict TypeScript | ✅ Enabled | tsconfig.app.json |
| ESLint + Prettier | ✅ Enforced, max-warnings 0 | CI workflow |
| Request PII anonymisation | ✅ Utility + tests | src/middleware/anonymizeRequest.ts |
| Sentry PII scrubbing | ✅ before-send hook | src/lib/sentry.ts |
| Rate limiting | ✅ Redis-backed Edge function | supabase/functions/rate-limit |
| AES-256-GCM message encryption | ✅ Server-side | src/lib/messageCrypto.ts |
| ZK proof verification | ✅ Semaphore-based | supabase/functions/verify-zk-proof |
| RLS on all tables | ✅ Enforced | supabase/migrations |
| Moderation audit trail | ✅ Immutable audit table | migrations/20260417120000_* |
| Data retention job | ✅ pg_cron | migrations/20260418090000_ttl_cleanup.sql |
| Pre-commit hooks | ✅ lint-staged | .husky/pre-commit |
| Git secret scanning | ✅ gitleaks config | .gitleaks.toml |
| KMS-backed key wrapping | ⬜ Skeleton + roadmap | src/utils/encryption.ts, ROADMAP.md |
| Client-side E2EE | ⬜ Roadmap only | ROADMAP.md |
| SOC 2 | ⬜ Roadmap Q4 2026 | ROADMAP.md |
| Pentest | ⬜ Roadmap Q3 2026 | ROADMAP.md |
| Bug bounty | ⬜ Roadmap | ROADMAP.md |

---

## 2. Business and commercial diligence

### Positioning
- [docs/pitch/](./docs/pitch/) — investor deck materials
- [INVESTOR_READINESS_AUDIT.md](./INVESTOR_READINESS_AUDIT.md) — readiness gaps and mitigations
- [DILIGENCE_OVERVIEW.md](./DILIGENCE_OVERVIEW.md) — recommended initial wedge, buyer profiles

### Demo and proof of traction
- Demo playbook: [docs/demo-flow.md](./docs/demo-flow.md)
- E2E tests (Playwright): `e2e/` directory

### Financials and go-to-market
- Contact the maintainers (see [SECURITY.md](./SECURITY.md)) for financial model and GTM deck (not stored in the repository for confidentiality).

---

## 3. Legal diligence

| Item | Status |
|---|---|
| License | MIT (see [LICENSE](./LICENSE)) |
| Privacy policy | [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) |
| Data retention policy | [DATA_RETENTION.md](./DATA_RETENTION.md) |
| Code of conduct | [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) |
| Contributing guidelines | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| GDPR DPA (with Supabase) | ⬜ To be executed before EU pilot |
| Export controls | Review required for cross-border deployments |
| Open source licence audit | `npm audit` covers supply chain; no GPL/AGPL transitive deps in production bundle (verify with `npx license-checker --production`) |

---

## 4. Operations and incident response

- [docs/operations/production-checklist.md](./docs/operations/production-checklist.md) — pre-launch controls
- [docs/operations/incidents.md](./docs/operations/incidents.md) — incident response process
- [docs/security/dependency-advisories.md](./docs/security/dependency-advisories.md) — current known advisories and dispositions

---

## 5. Contacts

See [SECURITY.md](./SECURITY.md) for security disclosures and primary engineering contact. Investor inquiries: contact the founding team directly.
