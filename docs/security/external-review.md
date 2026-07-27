# External Security Review

**Status:** Placeholder — **no external security review is complete** as of July 2026 (no completed review artifact found in-repo).  
**Rule:** Never claim “certified,” “audited,” or “penetration-tested” until a real engagement is recorded below with date, reviewer, and scope.

Internal sources of truth remain:

- [`./threat-model.md`](./threat-model.md)
- [`./public-claims-audit.md`](./public-claims-audit.md)
- Implementation registry: [`../../src/data/implementationStatus.ts`](../../src/data/implementationStatus.ts)

Related product evolution note: Phase 2 item I7 in [`../product/platform-evolution-action-plan.md`](../product/platform-evolution-action-plan.md).

---

## Recommended scope (first engagement)

Focus on the **v2 private deliberation path**, not soft-retired matchmaking/ZK surfaces:

1. **RLS** — session, message, outcome, invite, and audit-trail policies; service-role blast radius  
2. **Auth** — magic-link account binding; role-scoped invite tokens; participant bearer paths  
3. **Release path** — approvals, attestation, `release_outcome`, SHA-256 anchor storage and verify path  
4. **Operator access** — honest documentation that room content is operator-readable today  
5. **Deploy hygiene** — stub/demo flags off; no mock data in production builds  

Out of scope unless explicitly added: full ASVS certification, formal IOA certification, court-admissibility opinions, or claiming RFC 3161 live without a verified TSA path.

---

## Engagement record (fill when real)

| Field | Value |
| ----- | ----- |
| **Engagement title** | _TBD_ |
| **Reviewer / firm** | _TBD_ |
| **Start date** | _TBD_ |
| **Report date** | _TBD_ |
| **Status** | `not_started` · `in_progress` · `complete_with_findings` · `complete_no_critical` — **current: not_started** |
| **Scope summary** | _TBD — paste SOW bullets_ |
| **Methods** | _e.g. code review, threat-model walkthrough, RLS test suite review, staging pentest_ |
| **Artifact location** | _Private data room path — not committed secrets_ |
| **Residual risks (public summary)** | _TBD — metadata only; no exploit detail in public git_ |
| **Follow-ups tracked** | _Link issues / ROADMAP items_ |

---

## Public language after a review

Allowed only when status is complete and artifacts exist outside this placeholder:

- “Scoped external review of [scope] completed on [date] by [reviewer]; residual risks summarized in the data room.”

Still forbidden without separate evidence:

- “Fully audited,” “SOC 2 certified,” “penetration-test passed with zero issues,” or implying Signal-grade E2E.
