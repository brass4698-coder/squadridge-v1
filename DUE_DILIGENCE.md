# Due Diligence Overview

_Status: scaffold — update figures and links as the company matures._

This document is a high-level investor and partner due-diligence index. It maps to the artifacts in this repository and explains where to find authoritative information on each standard diligence topic.

---

## 1. Company and product overview

| Item | Location |
|------|----------|
| Product one-pager | `docs/product-one-pager.md` |
| Product overview | `docs/product-overview.md` |
| Pitch decks (multiple audiences) | `src/pitch-deck-hub/` |
| Current status / traction | `CURRENT_STATUS.md` |
| Investor readiness audit | `INVESTOR_READINESS_AUDIT.md` |

---

## 2. Technical architecture

| Item | Location |
|------|----------|
| Architecture overview | `docs/Architecture.md` (alias: `docs/architecture-overview.md`) |
| Threat model | `docs/ThreatModel.md` (alias: `docs/security/threat-model.md`) |
| Encryption scope | `docs/security/encryption-scope.md` |
| ADRs (architectural decisions) | `docs/adr/` |
| API specification | `openapi.yaml` |

---

## 3. Security posture

| Item | Location |
|------|----------|
| Security policy and reporting | `SECURITY.md` |
| Threat model | `docs/security/threat-model.md` |
| Secrets rotation runbook | `docs/security/secrets-rotation.md` |
| Observability and Sentry | `docs/security/observability-and-sentry.md` |
| Dependency advisories | `docs/security/dependency-advisories.md` |
| CI security scan | `.github/workflows/ci.yml` |
| Secrets scan script | `scripts/scan-secrets.sh` |

**Current status:** No known critical CVEs. Dependabot configured. Pre-commit hooks block secret patterns.

**Planned:** SOC 2 readiness documentation (Q3 2026), formal penetration test (Q4 2026).

---

## 4. Privacy and compliance

| Item | Location |
|------|----------|
| Privacy policy | `PRIVACY_POLICY.md` |
| Data retention policy | `DATA_RETENTION.md` |
| Trust and safety | `docs/trust-safety.md` |
| GDPR / DPA | Contact legal@squadridge.com (placeholder) |

**Key claims:**
- Message ciphertext only; ephemeral handles; no real-name storage.
- Server-side AES-GCM encryption at rest (KMS-wrapped keys); E2EE on roadmap.
- IP addresses are never stored in persistent storage; device signals are hashed and short-lived.

---

## 5. Data model and infrastructure

| Item | Location |
|------|----------|
| Message partitioning migration | `migrations/20260428_message_partitioning.sql` |
| Retention job | `scripts/retention_job.sql` |
| Deployment docs | `docs/deployment.md` |
| Operations | `docs/operations/` |
| Docker Compose (local dev) | `docker-compose.yml` |

---

## 6. Governance and open-source

| Item | Location |
|------|----------|
| License | `LICENSE` (MIT) |
| Contributing guide | `CONTRIBUTING.md` |
| Code of conduct | `CODE_OF_CONDUCT.md` |
| Changelog | `CHANGELOG.md` |
| Roadmap | `ROADMAP.md` |
| CODEOWNERS | `CODEOWNERS` |

---

## 7. Financials and go-to-market

Financials, unit economics, and go-to-market plans are maintained outside the public repository. Contact the founder team for access under NDA.

---

## 8. Open items / risks (as of 2026-04-28)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| E2EE not yet implemented | Medium | Server-side encryption in place; E2EE on roadmap (see `ROADMAP.md`) |
| SOC 2 not yet audited | Low-Medium | Documentation started; target audit Q4 2026 |
| Single-founder bus factor | Medium | Engineering CONTRIBUTING guide and ADRs established |
| Legal DPA template not finalised | Medium | Template in progress; legal review Q2 2026 |

---

> **Note for maintainers:** Keep this document current as the company matures. Investors and partners will reference it during due diligence. Stale information here creates unnecessary friction.
