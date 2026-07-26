# Platform evolution — phased action plan

**Status:** Master internal product memo (execution plan) · **Last updated:** 2026-07-25  
**Stance:** SquadRidge is **private deliberation infrastructure** — a **governed civic instrument** (room → gate → record), not a chat app or generic secure SaaS.

**Canon stack (do not fork conflicting stories):**

| Role | Doc |
| ---- | --- |
| What ships today | [`platform-description.md`](platform-description.md) |
| Credibility research (IOA, RFC 3161, caps, roles) | [`institutional-credibility-research.md`](institutional-credibility-research.md) |
| Engineering privacy bounds | [`../security/threat-model.md`](../security/threat-model.md) |
| Public claim ↔ code map | [`../security/public-claims-audit.md`](../security/public-claims-audit.md) |
| Phase A engineering checklist | [`../../ROADMAP.md`](../../ROADMAP.md) |
| Diligence maturity score | [`../audit/institutional-readiness-audit.md`](../audit/institutional-readiness-audit.md) |
| Ops go-live | [`../operations/v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md) |

**Provenance:** Compiled from the Jul 2026 platform-evolution synthesis (positioning, design, room flow, facilitator logic, security claims, ledger, research gaps, repo/Supabase/GitHub) plus the high-stakes dialogue manual and IOA/RFC research brief. No standalone `platform-evolution.md` file existed in-repo; this plan is the durable execution canon. Research substance lives in [`institutional-credibility-research.md`](institutional-credibility-research.md).

**Honesty rule:** SHA-256 `ledger_sha` is live. RFC 3161 is **scaffolded only** until a production TSA path exists and is documented in the threat model. Do not claim IOA certification, legal privilege, court-admissible timestamps, or operator-blind E2E.

---

## What's already done

Checklist of work already in the repo (treat as **done** — do not re-implement):

### Public site / design
- [x] Civic-instrument marketing grammar: **private room → release gate → approved record**
- [x] Scroll-aware frosted nav (`PublicShell` / `AppTopShell` `data-scrolled`)
- [x] Governed-sequence stepped rail (`SystemModelSequence` / `ProcessStagePanel`) — one stage expanded
- [x] Shared `LedgerSpecimen` schema (`src/data/ledgerSpecimens.ts`) across homepage, ledger index, dossier
- [x] Live-vs-planned trust copy split (SHA-256 live · RFC 3161 planned)
- [x] Soft-retired legacy citizen/ZK routes → `/request-access` in `App.v2.tsx`
- [x] Investor-readiness surfaces (pre-launch honesty): `/roadmap` (GTM & readiness), `/pricing` (invite-only, no invented $), `/pipeline` (placeholders — never fabricate traction). Fill `FOUNDER_NOTE` + `PIPELINE_METRICS` in `src/data/siteMessaging.ts` when sourced.

### Facilitator workflow / room
- [x] Spine Configure → Verify → Facilitate → Release (v2 routes + lifecycle guards)
- [x] Invite + participation reason; capacity hard ceiling **12**, soft recommend **4–8** (default 6)
- [x] Pacing / Power of Pause / Slow down / Pull back (`sessionPacing` + RPCs)
- [x] Dialogue stages: preparation → opening → story → framing → options → review → outcome_ready
- [x] Intake brief fields (`issue_goal`, `risk_notes`, `disclosure_boundaries`)
- [x] Participant self-review path (`/p/review/:token`) before release; facilitator cannot proxy-approve participant rows
- [x] Architectural record redaction (no import-from-room; verbatim guard on release)

### Security claims / research
- [x] IOA-aligned confidentiality language (architecture only — not certification)
- [x] Threat model + public-claims audit updated for SHA-256 vs RFC 3161 scaffold
- [x] Timestamp scaffold columns + `src/lib/timestampAnchor.ts` (**no live TSA**)

### Supabase / decks / CI hygiene (partial)
- [x] Gated decks via `serve-deck` + `deck_access_grants` / `has_deck_access()`
- [x] Capacity trigger uses `SELECT … FOR UPDATE` on session row
- [x] Migrations: `20260725071030_*`, `20260725073717_*`, `20260725075656_*`, `20260725080730_*`
- [x] ROADMAP Phase A P0 items marked complete in checklist (state machine, invite path, redaction)

### Known residual gaps (honest — still open)
- [ ] Live RFC 3161 TSA request on `release_outcome`
- [ ] Co-facilitator / sponsor / observer permissions wired into **v2 session** path (role shells exist; session ACL thin)
  - **TODO (I2 / C10 — deferred Jul 25):** v2 `sessions` RLS is facilitator-owner-only (`facilitator_id = auth.uid()`). Safe observer read needs a session-membership (or grant) table, RLS SELECT policies on `sessions` / `outcome_records` / status RPCs, and pgTAP cross-principal denials — not a half-measure. Prefer full I2 over thin UI that implies access.
- [ ] Facilitator per-stage prompt library + in-room redact tooling
- [x] Review-link issuance UX from release console (copy/email per participant)
  - Copy/share shipped; optional Edge `send-session-invite` with Resend when secrets present; manual URL fallback when not
- [ ] Email workflow notifications (prefs exist; delivery not wired for verify/open/release events)
  - Invite/review email scaffold exists; broad workflow notification pipeline still open (P8)
- [ ] First **real** pilot private release in staging/production (operator + partner step)
- [ ] Clean `supabase db reset` / CI pgTAP green through full migration chain (incl. `20260707` incident hold)
- [ ] Optional AI heat → private facilitator signal UI (advisory pacing exists; ConvoWizard-style heat UI not built)
- [ ] Operator-blind room E2E (threat model §13 — out of pilot wedge)

**Pilot hardening shipped (Jul 25–26 session):**
- [x] Branded 404 / 403 / root+route 500 boundaries on `--sr-*` tokens
- [x] `VITE_MAINTENANCE_MODE` kill-switch + `MaintenancePage`
- [x] Edge `health-check` (no JWT) + `send-session-invite` (JWT, rate-limit, CORS)
- [x] Hot-path indexes: `participants(session_id)`, `outcome_records(session_id)`, `outcome_approvals(outcome_id)`, `session_messages(session_id, sent_at)`
- [x] `.env.example` documents Edge-only `RESEND_*` / `SITE_URL` / maintenance flag

---

## Phase 1 — MVP (ship / harden now)

Goal: one NGO facilitator can run **intake → invite → verify → staged room → participant review → private anchored release** on a clean local/staging DB without overclaiming trust features.

| ID | Owner area | Deliverable | Acceptance criteria | Dependencies |
| -- | ---------- | ----------- | ------------------- | ------------ |
| **M1** | supabase | Apply Jul 25 migrations + regenerate types; prove capacity + stages pgTAP locally | `db reset` applies through latest; `v2_dialogue_stages_review` + `v2_mvp_capacity_deck_pacing` pass; generated types include `dialogue_stage`, `participation_reason`, timestamp scaffold cols | Local Supabase CLI |
| **M2** | supabase | Append-only **repair** for `20260707_001_incident_dialogue_rooms.sql` order bug **or** documented skip path that keeps CI green | Clean CI `supabase db reset` no longer fails on incident helpers-before-table; incident routes stay **unmounted** on v2 | Do not edit historical migration in place |
| **M3** | facilitator-workflow | End-to-end dry-run script for NGO template on staging | Facilitator completes create → invite(+reason) → verify → advance stages → pacing → outcome → `/p/review` → private release; `ledger_sha` set; record **not** on public ledger unless opted in | M1 |
| **M4** | facilitator-workflow | Review-link issuance from release / outcome UI | Facilitator can copy per-participant review URL; disputed items block release with clear UI | **Done (Jul 25):** copy/share + optional email scaffold (`send-session-invite`); Resend live only when Edge secrets set |
| **M5** | security-claims | Sweep public + deck copy: live vs planned | `check:banned-copy` green; Security/landing never imply live TSA, IOA certification, or E2E-against-operator | [`public-claims-audit.md`](../security/public-claims-audit.md) |
| **M6** | public-site | Homepage density pass (diagrams/rails only if still dense after stepped rail) | First viewport + governed sequence remain scannable; no new claim surfaces | Stepped rail already shipped — polish only |
| **M7** | design | Specimen + released-record consistency QA | Homepage / `/ledger` / dossier share `LedgerSpecimen` fields; live API rows never look “illustrative” | `ledgerSpecimens.ts` shipped |

**Phase 1 exit:** Staging demo of private anchored release with honest Security page; CI db job green or explicitly waived with ticket for M2.

---

## Phase 2 — Pilot-ready

Goal: bounded NGO / peacebuilding pilot with MOU-disclosed operator-readable rooms, audit export, and operational runbook — still **no** live TSA requirement.

| ID | Owner area | Deliverable | Acceptance criteria | Dependencies |
| -- | ---------- | ----------- | ------------------- | ------------ |
| **P1** | facilitator-workflow | Pilot MOU + ground-rules pack (IOA-aligned **exception template**, operator-readable disclosure, crisis off-platform protocol) | Partner signs doc citing threat-model bounds; exceptions are policy text, not product automation | [`institutional-credibility-research.md`](institutional-credibility-research.md) §1 |
| **P2** | facilitator-workflow | Runbook drill: facilitator + 4–6 participants on staging | Completes [`v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md); metrics pre-registered | Phase 1 exit |
| **P3** | supabase | Session audit export verified in pilot path | `export_session_audit_trail` returns metadata-only ordered events; no message bodies | Audit table already shipped |
| **P4** | public-site | Soft-retire / hide legacy surfaces from pilot demos | `/match`, ZK verify, CSI admin not in facilitator CTA or deck narrative | Soft-retire redirects already exist |
| **P5** | design | In-room stage map + briefing clarity pass | Participants always see current `dialogue_stage` and next action; reduced-motion safe | **Done (Jul 25):** stage map + next-action on briefing / waiting / room; empty / loading / reconnect / error hardened |
| **P6** | security-claims | Partner diligence one-pager (evaluable-now vs planned) | Lists SHA-256, RLS, release gate, audit export as live; RFC 3161 / E2E / co-fac roles as planned | M5 |
| **P7** | facilitator-workflow | First **real** private released outcome (staging or prod with consent) | Non-sample `outcome_records` row with `ledger_sha`; public ledger only if partner opts in | ROADMAP P1 #6 operator step |
| **P8** | supabase | Email notification pipeline **or** explicit pilot waiver | Invite/review email scaffold (`send-session-invite`) + MOU in-app-only path; full verify/open/release notification pipeline still optional | Prefs table exists; Resend secrets are ops |

**Phase 2 exit:** One completed facilitated session with private anchored memo + audit export; partner can evaluate without mistaking samples or planned TSA for live proof.

---

## Phase 3 — Institutional-ready

Goal: diligence-grade process integrity for multi-stakeholder / Track II–adjacent buyers. Still honest: TSA is live only after production integration; E2E remains a separate program.

| ID | Owner area | Deliverable | Acceptance criteria | Dependencies |
| -- | ---------- | ----------- | ------------------- | ------------ |
| **I1** | security-claims + supabase | **Live RFC 3161** path: Edge Function or server RPC → TSA; store token beside `ledger_sha` | Release writes `timestamp_token` / `timestamp_authority` / `timestamped_at`; verify UI shows trusted-time status; threat model §5 updated; **no** “court-admissible” claim without counsel | Scaffold migration + `timestampAnchor.ts`; choose production TSA |
| **I2** | facilitator-workflow | Co-facilitator (+ optional observer) session ACL | Second facilitator can pace/advance; observer read-only to room or outcomes per policy; RLS + UI | Role shells exist; v2 session grants needed |
| **I3** | facilitator-workflow | Per-stage prompt library + redact controls | Facilitator posts stage prompts; redact path audited; no autonomous AI enforcement | Advisory AI rule remains |
| **I4** | supabase | Stronger public/private schema boundary review | Documented RLS matrix for `session_messages` vs `outcome_records`; pgTAP cross-principal denials in CI | Pilot RLS checklist |
| **I5** | public-site | Institutional IA: Security / About / ledger verify as diligence suite | Live TSA status accurate; IOA language stays “aligned with practice standards” | I1 for timestamp copy |
| **I6** | design | Released-record dossier polish for external readers | Verify page + dossier readable without app account; specimen vs live never conflated | Ledger verify already partial |
| **I7** | security-claims | External security review / ASVS-oriented checklist against threat model | Written residual-risk memo; no implied audit-complete | Phase 2 evidence |
| **I8** | supabase / GitHub | Repo cleanup: migration hold resolved, deck assets only via `serve-deck`, dead workflow stubs gone | CI lint/test/build/db green; no public static deck URLs | private/ + serve-deck pattern |

**Phase 3 exit:** Institutional readiness audit score materially up from ~4–5/10; live integrity **and** trusted-time (if I1 shipped) documented; co-facilitation viable; claims remain within threat model.

---

## Owner-area map (how to split work)

| Area | Owns | Does not own |
| ---- | ---- | ------------ |
| **design** | Stepped rails, specimens, nav frost, dossier/room visual clarity | Threat-model claims, TSA vendor choice |
| **security-claims** | Threat model, public-claims audit, IOA/RFC honesty, banned-copy | Shipping features that don’t exist yet |
| **supabase** | Migrations (append-only), RLS, RPCs, pgTAP, Edge Functions, types | Marketing IA |
| **facilitator-workflow** | Intake, invites, stages, pacing, review, release UX, pilot runbook | Public homepage composition |
| **public-site** | Landing/Security/About/ledger marketing copy & IA | Session RPCs |

---

## Suggested next five actions

1. **M1 + M2** — Make local/CI `db reset` green with Jul 25–26 migrations; repair or isolate `20260707` incident hold.  
2. **M3** — Staging dry-run of full spine (review-link copy + optional email scaffold shipped as M4).  
3. **Ops** — Deploy Edge `health-check` + `send-session-invite`; set `SITE_URL`; optionally `RESEND_*` or keep manual-link pilot.  
4. **P1 + P2** — MOU + runbook drill with pre-registered metrics.  
5. **P7** — Complete one real private anchored release (operator + partner).

Defer **I1 (live TSA)** and **I2 (co-facilitator / observer session ACL)** until after Phase 2 exit unless a diligence partner explicitly blocks. I2 needs membership + RLS + pgTAP — do not half-wire.

**Rejected greenfield (do not build):** Vue/Zustand rewrite; Hydra Teal / Satoshi design; `organizations` / `conflicts` / `qr_signups` schema; pnpm CI rewrite; PDF/confetti org-SaaS onboarding.

---

## Out of scope until Phase 2 exit

- Citizen matchmaking / public ZK as product surface  
- Operator-blind E2E encryption program  
- Civic early-warning / CSI as public product  
- Autonomous AI mute or release  
- “Court-admissible” or “IOA-certified” marketing language  
- Broad Track II / government procurement packaging
