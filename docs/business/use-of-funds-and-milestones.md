# Use of Funds & 18-Month Milestones

**Audience:** investors and funders  
**Last updated:** July 2026  
**Status:** Planning anchors — **not** a committed raise size, term sheet, or traction claim.

Amounts below are **illustrative planning ranges or TBD placeholders**. Do not cite them as fundraised totals or as evidence of runway already secured. Update this file when a real raise or grant award is documented.

Related: [`investor-brief.md`](./investor-brief.md) · [`../operations/v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md) · [`../operations/pilot-deploy-runbook.md`](../operations/pilot-deploy-runbook.md) · [`../operations/evidence-collection.md`](../operations/evidence-collection.md)

---

## Budget buckets (planning anchors)

| Bucket | Purpose | Planning range / placeholder |
| ------ | ------- | ---------------------------- |
| **Engineering** | Pilot hardening, email/ops gaps, staging→prod discipline, ledger/release polish | **TBD** — planning band often discussed as majority of a pre-seed / grant tranche (e.g. ~40–55% of a round *if* raised; not a commitment) |
| **Security review** | Scoped external review of RLS, auth, release path; residual-risk memo | **TBD** — typically a discrete fixed-scope engagement (placeholder: five-figure USD band until vendor quote) |
| **Facilitator ops** | Pilot facilitation support, runbook time, partner onboarding, evidence pack discipline | **TBD** — planning band often ~15–25% of a tranche *if* raised |
| **Legal / compliance** | MOU templates, privacy/terms refresh, counsel for privilege language (no product privilege claim) | **TBD** — planning band often ~5–15% of a tranche *if* raised |
| **Contingency / infra** | Hosting, TSA evaluation (if triggered), incident buffer | **TBD** remainder |

**Ask posture (from investor brief):** capital unlocks **pilots + scoped security review + ops** — not vanity marketing spend. Dollar ask: **not fixed in-repo**; set in the live data room when a process is open.

---

## 12–18 month milestone ladder

All dates are relative to funding or grant start (**T0**). Labels: **ops target** (process) vs **hypothesis** (commercial).

| Horizon | Milestone | Evidence | Label |
| ------- | --------- | -------- | ----- |
| **0–3 mo** | Staging dry-run of Configure → Verify → Facilitate → Release on a fixed deploy SHA | [`pilot-deploy-runbook.md`](../operations/pilot-deploy-runbook.md), checklist green | Ops target |
| **3–6 mo** | First **private** anchored memo pilot (NGO / board / HR), MOU discloses operator-readable rooms | [`v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md), [`pilot-evidence-pack-template.md`](../operations/pilot-evidence-pack-template.md) | Ops target |
| **6–12 mo** | 2–3 additional bounded pilots; evidence packs filed; metrics pre-registered | [`evidence-collection.md`](../operations/evidence-collection.md), [`pilot-metrics-preregistration.md`](../operations/pilot-metrics-preregistration.md) | Ops target |
| **9–15 mo** | Scoped external security review complete (or explicitly deferred with written rationale) | [`../security/external-review.md`](../security/external-review.md) | Ops target |
| **12–18 mo** | First paying organisation | Invoice / contract — **none claimed today** | **Hypothesis** |

Optional stretch (not required for wedge success): first **public** ledger publish with partner consent after private-memo success.

---

## Explicit non-claims

- No assertion that pilots or paying customers already exist  
- No assertion that an external security review is complete  
- No assertion that RFC 3161 or operator-blind E2E will ship on this ladder without separate engineering decisions  

When real awards or customers exist, replace placeholders here and in the private data room — do not backfill invented history.
