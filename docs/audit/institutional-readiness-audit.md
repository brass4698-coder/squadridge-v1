# Institutional Readiness Audit

**Status:** Phase 0 baseline · **Last updated:** July 2026  
**Audience:** Pilot partners, institutional buyers, security reviewers, funders, and internal product/engineering leads.  
**Canonical product story:** [`docs/product/platform-description.md`](../product/platform-description.md) · **Engineering truth:** [`docs/security/threat-model.md`](../security/threat-model.md) · **Phase A checklist:** [`ROADMAP.md`](../../ROADMAP.md)

This document is the **honest institutional readiness baseline** for SquadRidge v2. It scores ten product domains against shipped reality, maps audience fit, and recommends actions before claiming pilot impact or institutional deployment at scale. It does **not** replace the threat model or pilot runbook — it synthesizes them for diligence conversations.

---

## Executive summary

### Overall institutional maturity: **~4 / 10**

| Dimension | Score (0–10) | Rationale |
| --------- | ------------ | --------- |
| Product–narrative alignment | 5 | v2 facilitator story is documented; legacy routes and README drift remain visible to engineers |
| Security honesty | 6 | Threat model and public-claims audit are strong; operator-readable content is disclosed |
| v2 lifecycle completeness | 4 | Configure → Verify → Facilitate → Release exists but state machine and participant path have known gaps |
| Institutional operations | 3 | Runbooks exist; audit trail, notifications, and live ledger evidence are not yet shipped |
| Audience-specific fit | 4 | Strong for bounded mediator pilots; weak for Track II audit-grade or military-adjacent procurement |
| Test / CI confidence | 5 | Lint, build, pgTAP, e2e smoke exist; v2 lifecycle lacks integration coverage |

**Weighted institutional maturity: ~4/10** — credible for **small, facilitator-led private pilots** with explicit security boundaries; **not** ready for broad institutional procurement, classified-adjacent deployment, or quantitative impact claims.

### “Could it be it?” verdict

**Yes, for a narrow wedge — if you stay honest about scope.**

SquadRidge can be the right infrastructure for **facilitator-led protected written dialogue with a verifiable public outcome** when:

- The institution accepts **operator-readable room content** (not Signal-grade E2E).
- The pilot is **invite-only**, **small-cohort**, and **facilitator-operated** end to end.
- Success is measured by **process integrity** (verification, release, anchor) — not “lives saved” or automated early warning.
- Legacy paths (`/match`, squad ZK, CSI admin) are **not** sold as the primary product.

It is **not** “it” today for: open citizen matchmaking at scale, video mediation, operator-blind encryption requirements, automated conflict prediction, or procurement frameworks requiring external security certification and live ledger proof from real pilots.

---

## Domain audits (10)

Each domain lists **status**, **audience impact**, **security tier** (adversary 1–5 per [`threat-model.md`](../security/threat-model.md) §3), **ROADMAP link**, and **recommended action**.

Adversary tiers (summary):

1. Other participants  
2. Network observer  
3. Honest-but-curious operator  
4. Compromised operator / breach  
5. Platform vendor / subprocessors  

---

### 1. Auth and invites

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (staff) · **Partial** (session participants) |
| **Detail** | Magic-link OTP auth, `access_requests`, staff invite create/validate/accept/revoke RPCs, seven roles with per-role dashboards (`App.v2.tsx`). Participant token flow (`/p/*`) is mounted but verification steps are **client-simulated**; facilitator manual review on `ParticipantsReviewPage` is authoritative for pilots. Known misalignment: participant links must not use staff `/invite/accept` path. |
| **Audience impact** | **NGO / mediators:** Good — closed pilot, manual review matches peacebuilding ops. **Track II:** Partial — role model exists but institution_admin tooling is thin. **Peace Corps:** Good for staff-facilitated cohorts; weak for volunteer self-serve at scale. **Military-adjacent:** Partial — invite audit exists; no IL5/FedRAMP path. |
| **Security tier** | **3–5** — email binds real identity; operator can correlate invites, profiles, and session participation. |
| **ROADMAP** | **P0 #2** — Fix participant token invite path |
| **Recommended action** | Complete P0 #2; document staff vs participant invite paths in partner onboarding; add integration test for facilitator-generated link → `/p/room`. |

---

### 2. Session lifecycle v2

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (core) · **Partial** (enforcement) |
| **Detail** | Configure (`/app/sessions/new/setup`), Verify, Facilitate (`/control`), Release (`/release`) routes and DB schema exist. Session templates persist `setup_config`. **Gap:** status transitions are not fully enforced server-side — facilitator can skip steps manually; mock room at `/app/sessions/:id/room` coexists with operational `/control`. |
| **Audience impact** | **NGO / mediators:** Usable with runbook discipline. **Track II:** Needs enforced state machine for audit defensibility. **Peace Corps:** Adequate for single-facilitator pilots. **Military-adjacent:** Insufficient without immutable workflow audit. |
| **Security tier** | **2–4** — lifecycle metadata and session rows visible to operator; skip transitions weaken process claims. |
| **ROADMAP** | **P0 #1** — Enforced session state machine · **P1 #7** — Unify “New session” entry |
| **Recommended action** | Ship P0 #1 RPC guards before any Track II or government-facing diligence; gate or remove mock room from primary facilitator CTA. |

---

### 3. Participant token path

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Partial** |
| **Detail** | Routes `/p/invite` → `/p/verify` → consent → briefing → waiting → `/p/room` → done. RPCs: `participant_send_message`, `participant_list_messages`, consent/verification helpers (`20260708_001_v2_participant_token_and_templates.sql`). Email OTP and document upload UI are **simulated**; `markParticipantDocumentSubmitted` may write status but does not replace facilitator verification. E2E covers demo-token acceptance only (`e2e/phase0-routing.spec.ts`). |
| **Audience impact** | **NGO / mediators:** Acceptable if facilitator verifies manually. **Track II:** Risk — simulated steps could be mistaken for automated KYC. **Peace Corps:** Volunteers need clearer “facilitator confirms you” copy. **Military-adjacent:** Not suitable without real identity assurance integration. |
| **Security tier** | **1–3** — token in URL is shareable; facilitator review mitigates but token leakage enables room access until revoked. |
| **ROADMAP** | **P0 #2** — Fix participant token invite path |
| **Recommended action** | Wire validation to `participants.invite_token`; add expiry/declined states; label simulated verification UI prominently; extend e2e through real DB token. |

---

### 4. Room messaging RLS

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (v2) · **Legacy** (squad path) |
| **Detail** | v2: `session_messages` with RLS scoped to session facilitators and participant RPCs; Realtime publication enabled. Content is **not E2E** — operator with DB access can read bodies. Legacy squad: `messages` insert **edge-only** via `ingest-message`; moderator decrypt audited via RPC. |
| **Audience impact** | **NGO / mediators:** Clear if boundaries disclosed. **Track II:** Requires written operator-access disclosure in MOU. **Peace Corps:** OK for low-classification community dialogue. **Military-adjacent:** Fails default expectations for classified or CUI-adjacent content. |
| **Security tier** | **3–5** for content confidentiality; **1–2** for transport (TLS). |
| **ROADMAP** | **P0 #3** — Record redaction (outcome side) · Long-term: room-level E2E (Phase C / threat model §13) |
| **Recommended action** | Keep v2 and legacy messaging stories separate in partner docs; do not claim E2E; prioritize P0 #3 so room content cannot leak into public record. |

---

### 5. Outcome and release

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (core) · **Partial** (redaction enforcement) |
| **Detail** | Outcome drafting, `outcome_approvals`, `release_outcome` RPC with SHA-256 anchor, facilitator Release UI implemented. Approval tracking is real. **Gap:** no server-side block on importing verbatim room text into outcome; notifications not wired. |
| **Audience impact** | **NGO / mediators:** Core value proposition — usable. **Track II:** Needs redaction enforcement + audit trail for release events. **Peace Corps:** Strong for funder-safe outcome memos (NGO template). **Military-adjacent:** Process integrity claims need P1 audit events. |
| **Security tier** | **3–4** — release is deliberate human action; operator can alter DB but anchor detects post-release tamper on published record. |
| **ROADMAP** | **P0 #3** — Architectural record redaction · **P1 #4** — Workflow notifications · **P1 #5** — v2 audit trail |
| **Recommended action** | Ship P0 #3 before first public ledger record; pair with P1 #5 for diligence exports. |

---

### 6. Ledger and anchor

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (UI + RPC) · **Mock** (live content) |
| **Detail** | Public `/ledger` and `/ledger/:recordId` query `outcome_records`. Sample records (`src/data/sampleRecords.ts`) labeled illustrative; banner when no live publishes. `ledger_sha` computed at release. No public `/ledger/:id/verify` page yet (Phase B). Legacy `/ledger-legacy` still mounted. |
| **Audience impact** | **NGO / mediators:** Demonstrates concept; partners may ask for real records. **Track II:** Illustrative-only ledger undermines credibility until P1 #6. **Peace Corps:** Fine for demos. **Military-adjacent:** Anchor math is sound; evidentiary chain incomplete without audit log + live pilot. |
| **Security tier** | **2** for integrity of published record; **3** for metadata on ledger. |
| **ROADMAP** | **P1 #6** — First live ledger records · Phase B — Public anchor verification page |
| **Recommended action** | Complete one real pilot release (P1 #6); never present samples as traction; add verify page in Phase B. |

---

### 7. Legacy squad ZK match

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Legacy** (mounted in v2 router) |
| **Detail** | `/match`, `/session/:squadId`, Semaphore ZK verification, intent pools, application-layer encrypted squad chat. Production guardrails: `VITE_ZK_STUB` blocked in prod, edge-only message ingest, moderator decrypt audit. **Not** the v2 product story. `/find-squad` redirects to `/invite` in v2. |
| **Audience impact** | **NGO / mediators:** Distracting — avoid in institutional pitches. **Track II:** Wrong modality (citizen matchmaking). **Peace Corps:** Legacy citizen dialogue ≠ volunteer program management. **Military-adjacent:** ZK path does not meet operational identity requirements. |
| **Security tier** | **1–5** — ZK binds to `user_id`; operator-readable squad keys; see threat model §5. |
| **ROADMAP** | Not Phase A — document as legacy; deprecate from primary router when v2 pilots stable |
| **Recommended action** | Flag in README and partner materials; do not conflate with v2 mediation; consider feature-flag removal from default v2 builds for institutional demos. |

---

### 8. Incident CSI admin

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Partial** (internal) · **Not in v2 router** (incident rooms) |
| **Detail** | CSI: `conflict_severity_snapshots`, `escalation_alerts`, moderator read UI at `/admin/csi` (rostered moderators). Sample insert edge function for demos. **Incident dialogue** (`/incident`) implemented in `App.tsx` but **not** mounted in `App.v2.tsx`. Early-warning narrative in old README is **not** shipped as product. |
| **Audience impact** | **NGO / mediators:** CSI is internal triage only — do not sell as early warning. **Track II:** Irrelevant to mediation ledger story. **Peace Corps:** Misaligned unless reframed as optional ops tooling. **Military-adjacent:** Civil Affairs may want situational awareness — **not** production-ready; no partner API. |
| **Security tier** | **3–5** — CSI data and moderator dashboards are operator-visible. |
| **ROADMAP** | Strategy doc only — [`strategic-positioning-early-warning.md`](../business/strategic-positioning-early-warning.md); not Phase A |
| **Recommended action** | Remove “lives saved” / early-warning hero from institutional materials; keep CSI behind moderator roster; document incident routes as legacy/unmounted in v2. |

---

### 9. Marketing and docs claims

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Partial** (reconciling) |
| **Detail** | v2 marketing pages (`LandingPage`, `SecurityPage`, FAQ) largely aligned with platform-description and `public-claims-audit.md`. **Drift:** root `README.md` still leads with early-warning / lives saved; `CURRENT_STATUS.md` still centers squad matchmaking. `check:banned-copy` CI gate exists. |
| **Audience impact** | **All audiences:** Overclaiming erodes trust with sophisticated institutional buyers. |
| **Security tier** | **N/A** (reputational / legal) |
| **ROADMAP** | Phase 0 narrative reconcile (this audit) · Ongoing `check:banned-copy` |
| **Recommended action** | Align README and CURRENT_STATUS with platform-description; run banned-copy on any partner PDFs; quarterly public-claims re-audit. |

---

### 10. Tests and CI gaps

| Field | Assessment |
| ----- | ---------- |
| **Status** | **Shipped** (CI gates) · **Gaps** (v2 depth) |
| **Detail** | CI: lint, typecheck, Vitest, Playwright e2e, CodeQL, dependency-review, pgTAP (`messages_insert_edge_only`, etc.), prod readiness checks. **Gaps:** no Vitest/pgTAP for `release_outcome` invalid transitions (P0 #1); participant path e2e uses `demo-token` only; no integration test facilitator invite → real room message; v2 audit trail untested (not shipped). |
| **Audience impact** | **Track II / military-adjacent:** Test gaps block security questionnaire confidence. **NGO pilots:** Acceptable for bounded pilots with manual QA. |
| **Security tier** | **4** — untested transition guards increase breach-of-process risk. |
| **ROADMAP** | **P0 #1–3** each require acceptance tests per ROADMAP.md |
| **Recommended action** | Add pgTAP for session state machine and release guards; extend e2e for real participant token; require `check:all` before pilot go-live per runbook. |

---

## Legacy routes inventory (v2 router)

These paths remain in the codebase and must be disclosed in diligence. **Lead institutional conversations with `/app` facilitator flows and `/ledger` — not these.**

| Route | Status | Notes |
| ----- | ------ | ----- |
| `/match` | Legacy, mounted | Intent-pool citizen matchmaking |
| `/session/:squadId` | Legacy, mounted | Squad encrypted chat room |
| `/session/demo-session-001` | Demo | Gated by `VITE_ENABLE_DEMO_SQUAD` in production builds |
| `/incident`, `/incident/:slug` | Legacy, **not in App.v2** | Incident dialogue (App.tsx only if old router used) |
| `/ledger-legacy`, `/ledger-legacy/:proposalId` | Legacy, mounted | Pre-v2 proposal ledger |
| `/admin/csi` | Internal ops | Moderator-rostered CSI read console |
| `/find-squad`, `/match-setup` | Redirect | → `/invite` in v2 |

Primary v2 operational paths: `/app/sessions/*`, `/p/*`, `/ledger`, `/request-access`, `/sign-in`.

---

## Audience fit briefs

### NGOs and mediators

**Fit: Strong for bounded pilots (6/10 institutional readiness)**

**Who:** Programme directors, certified mediators, community dialogue facilitators, internal NGO governance leads.

**Job to be done:** Run sensitive written dialogue where room content stays private; release an approved outcome memo or joint statement with a verification anchor — without publishing a transcript or participant names.

**What works today:** Session templates (community mediation, NGO deliberation), facilitator control room, manual participant verification, outcome draft and release RPC, public ledger UI with honest sample labeling, pilot access request flow, threat-model-aligned security page.

**What does not:** Automated participant verification, email notifications, enforced lifecycle guards, live published ledger records from real pilots, operator-blind encryption.

**Pilot framing:** “Private pilot — facilitator-led protected dialogue with verifiable release. Manual verification; operator-readable room content per our security page.”

**Go / no-go:** **Go** for 2–6 participant sessions with assigned facilitator, incident owner, and signed partner MOU referencing threat model §5.

---

### Track II / government governance

**Fit: Moderate — credible demo, not procurement-ready (4/10)**

**Who:** Track II conveners, policy units, board secretariats, ombuds-adjacent inquiry chairs.

**Job to be done:** Cross-line or inter-agency written process with audit-grade **outcome** record; provable release integrity; no attribution on public record.

**What works today:** Track II session template, directional anonymity on ledger (counts not names), SHA-256 anchor at release, role-based access, RLS on session tables.

**Blockers:** No enforced state machine (P0 #1), no session audit trail (P1 #5), simulated participant verification, no live ledger evidence (P1 #6), operator-readable content, no external security certification.

**Pilot framing:** “Process pilot for outcome integrity — not classified content, not legal adjudication.”

**Go / no-go:** **Conditional go** for non-classified, facilitator-controlled pilots after P0 items 1–3; **no-go** for claims of audit-grade compliance until P1 #5–6 and external review.

---

### Peace Corps

**Fit: Moderate for staff-led programs; weak for volunteer self-serve (3/10)**

**Who:** Peace Corps staff facilitating community dialogue, conflict sensitivity training cohorts, or third-party facilitator partnerships — **not** as a replacement for Peace Corps administrative systems.

**Job to be done:** Structured dialogue sessions with clear facilitator authority; optional non-public outcomes for internal reporting; low-bandwidth text modality.

**What works today:** Text-only room, facilitator-led rounds, NGO deliberation template (non-public outcome default), offline-tolerant static marketing, magic-link access without passwords.

**Gaps:** No volunteer-scale onboarding, no integration with PC systems, no field-offline participant path (Phase C), simulated verification, English-first UI assumptions.

**Pilot framing:** “Facilitator-led dialogue tool for specific PC-facilitated sessions — not a Corps-wide platform.”

**Go / no-go:** **Go** only as a **single-program pilot** with HQ facilitator, explicit data handling review, and no deployment in high-risk posts without security review.

---

### Military-adjacent (Civil Affairs framing)

**Fit: Weak today — strategic interest only (2/10)**

**Who:** Civil Affairs teams exploring structured civil-military dialogue support, stability operations partners, or defense innovation cells evaluating peace-tech **process** tools — **not** operational C2 or intelligence systems.

**Job to be done:** De-escalation-centered structured dialogue with verifiable civilian-facing outcomes; clear separation from weapons, targeting, or classified networks.

**What works today:** De-escalation UX language, facilitator-controlled release, no video/recording on platform, written-only modality aligns with attribution sensitivity.

**Hard blockers:** No FedRAMP/IL authorization path, operator-readable messages, no CMMC-aligned deployment package, CSI/early-warning narrative creates confusion with operational intelligence, legacy squad matchmaking wrong for military audience, no STIG-hardened hosting story.

**Pilot framing:** “Research partnership for facilitator-led dialogue **process** — explicitly not an intelligence, early-warning, or C2 system.”

**Go / no-go:** **No-go** for operational deployment; **maybe** for funded R&D dialogue with academic or NGO facilitator of record, unclassified content only, and full legacy route disclosure.

---

## Recommended Phase A sequence (institutional)

1. **P0 #1–3** — State machine, participant token path, record redaction (blocking credibility).  
2. **Narrative reconcile** — README, CURRENT_STATUS, partner one-pager aligned with platform-description (Phase 0).  
3. **P1 #4–6** — Notifications, audit trail, first live ledger record (pilot evidence).  
4. **External security review** — scoped to v2 path before Track II or government expansion.  
5. **Legacy demotion** — feature-flag or doc-isolate match/squad/CSI from institutional demo builds.

---

## Related documents

| Document | Use when |
| -------- | -------- |
| [`platform-description.md`](../product/platform-description.md) | Full product story |
| [`auth-and-dashboards-audit.md`](auth-and-dashboards-audit.md) | Role and invite deep dive |
| [`public-claims-audit.md`](../security/public-claims-audit.md) | Marketing ↔ engineering claims |
| [`pilot-runbook.md`](../operations/pilot-runbook.md) | Running a real session |
| [`ROADMAP.md`](../../ROADMAP.md) | P0/P1 acceptance criteria |
| [`impact-roadmap.md`](../product/impact-roadmap.md) | 90-day and 12-month strategy |
