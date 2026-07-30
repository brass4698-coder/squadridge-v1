# MENDguild — narrative, traction, and market (draft for applications)

Program deadlines and fit: [program-map.md](program-map.md).

Use this as source material for decks and forms. Claims below are aligned with the engineering notes in [`docs/security/threat-model.md`](../security/threat-model.md). If the product changes, update this document in the same change as the code.

---

## One-sentence description

MENDguild is a **verified-anonymous cross-border dialogue** product: people join matched groups, exchange messages, and can complete **zero-knowledge attribute verification** (Semaphore proofs verified by your backend) so matchmaking and trust do not depend on sharing ID documents in chat.

---

## 1. Problem

People who need to talk across borders or under pressure often face a bad choice: **speak under a real name** and accept retaliation, surveillance, or exclusion—or **stay silent**. Pure anonymity helps, but many contexts still need **some** signal that a participant meets a condition (role, jurisdiction, risk profile) without exposing raw personal data to every peer and every observer.

When platforms handle that tradeoff poorly, the failure modes are predictable: people **walk away**, **stay and get exposed** (metadata, profile fields, or timing), or **never join** because the institution cannot defend the process to its own stakeholders. Retaliation and capture sit on the same spectrum: once trust in the process breaks, the dialogue does not recover easily.

MENDguild is built for settings where **honest engineering** matters as much as intent: the team documents what the server can see, what cryptography proves, and what remains roadmap work.

---

## 2. Product (what exists today vs later)

**In the current codebase (shipped path):**

- **Stack:** Web app (React, Vite, TypeScript), **Supabase** for PostgreSQL, Row Level Security, Auth, Realtime, and Edge Functions.
- **Accounts:** Includes **anonymous** Supabase auth for low-friction flows; the system still assigns a **persistent user id**—this is a product choice, not “no server-side identity.”
- **Verification:** **Semaphore**-based proofs in the browser, verified by the **`verify-zk-proof`** Edge Function; production builds are expected to run **without** the hash-only stub (`VITE_ZK_STUB`). Proof records are **bound to the logged-in account** on the server—users are not uploading ID scans to chat, but the platform records that *this account* completed a given proof scope.
- **Messaging:** Message bodies are encrypted at the **application layer** (AES-GCM) and stored as ciphertext; the **squad key** lives in the database, and **moderators or anyone with service-role access** can read traffic today. That is **not** end-to-end encryption against the operator. Say so plainly in any serious conversation.

**Explicitly not sold as shipped:**

- **End-to-end messaging** against the operator (would require different key distribution and is **not** implemented).
- **zkTLS-style** attribute extraction from websites — **research** behind a labs flag in docs; not a production promise.
- **Tor-only hosting, regional legal playbooks,** and other items called out as out-of-scope in the threat model unless you design them in.

---

## 3. Why now

Regulators and institutions are asking harder questions about **identity, content, and duty of care**. At the same time, privacy-preserving cryptography has moved from papers to **libraries you can ship**. The point is not “ZK for its own sake”; it is **structured dialogue** where participants need **attributes without dossiers**. MENDguild addresses that need—provided you keep the privacy story **accurate**.

---

## 4. Moat (honest account)

- **Workflow and trust:** Matchmaking, squad lifecycle, and moderator tooling embed your assumptions about safety and governance. That is hard to copy overnight if you run serious pilots.
- **Verification integration:** Semaphore plus server-side verification is a real technical path; the defensibility is in **correctness, scope discipline, and operations** (who can see what in the dashboard), not in a label.
- **Roadmap:** True end-to-end messaging, tighter data minimization, and regional hosting would deepen moats but require engineering and capital. Label them as **roadmap**, not as done.

---

## 5. Traction

Claims here must match [`docs/security/threat-model.md`](../security/threat-model.md): do not imply E2E messaging against the operator or anonymity stronger than documented (persistent `user_id`, operator-visible ciphertext with squad key in DB).

**What the repository and README substantiate today (no external cohort numbers in-repo):**

- **Product:** Shipped development path: React/Vite client, Supabase (Postgres, RLS, Auth including anonymous, Realtime, Edge Functions), Semaphore proofs verified by `verify-zk-proof`, application-layer message crypto per threat model. CI deploys database migrations ([`.github/workflows/deploy-supabase-production.yml`](../../.github/workflows/deploy-supabase-production.yml)); frontend build runs with `VITE_ZK_STUB` off for production-style verification ([`README.md`](../../README.md)). Evaluation flows: `/session/demo-session-001` (offline demo UI), **Start guided tour** (see [`src/demo/demoScript.ts`](../../src/demo/demoScript.ts)), `/admin/health` for moderator connectivity checks.
- **Users or conversations:** Add here before each investor or accelerator conversation: real counts (squads, messages, date range, pilot vs production). Until you have them, say so plainly—e.g. internal QA and guided-tour validation only—rather than vague “traction.”
- **Discovery:** Add structured interview or pilot counts and roles when you have them (mediators, civic orgs, diaspora organizers, etc.).
- **Partners:** Name advisors, LOIs, or design partners you can reference in diligence—avoid unnamed “interest.”

Small numbers with context beat empty superlatives: “Four squads in a two-week closed test” is stronger than “strong engagement.”

---

## 6. Impact metrics (diligence-safe)

Pick a **small set** you can instrument honestly. For **what we measure today** (queries, dashboards, manual baselines), see [`docs/business/impact-metrics.md`](../business/impact-metrics.md) — *Current measurement (MVP)*.

| Metric | Why it matters |
| ------ | ---------------- |
| **Squad completion rate** | Did groups reach a defined end state or goal? |
| **Return rate** | Did participants come back for a second session or squad? |
| **Time to match** | Queue latency and dropout before match. |
| **Moderator hours per active squad** | Operational load for institutional buyers. |
| **Incidents / reports** | Safety signal—define severity and response time. |
| **Verification success rate** | Semaphore + Edge path vs errors or abandonment. |

Avoid vanity metrics unless you define them tightly (e.g. “messages per squad” with cohort size).

---

## 7. Market framing (no invented TAM)

**Who benefits:** Participants in sensitive dialogues; facilitators and institutions that need auditability without publishing private dossiers.

**Who might pay:** NGOs and foundations running programs, platforms hosting facilitated conversations, enterprises with internal or cross-border dialogue use cases—**if** you prove operational fit and safeguarding.

**Illustrative scale (optional):** You can cite **public** estimates for online mediation, corporate training, or civic-tech budgets as **context**, not as “MENDguild TAM.” Label any number as illustrative and name the source. Do not multiply headline figures into fake precision.

---

## 8. Solo founder — reusable paragraph

**General:**

I am a solo founder: decisions are fast, and there is no ambiguity about ownership of the product vision. I hire or partner for what I do not do full-time—design, field partnerships, security review—so that specialists cover gaps without diluting focus. The constraint is real; the mitigation is explicit roles and a short list of advisors I actually call.

**Accelerator variant (emphasis: speed, users, scale):**

I run the company alone, which has kept the build tight and the feedback loop short. As usage grows, I will add capacity in sales/partnerships and operations before I optimize for headcount elsewhere. I can name the first functions I will hire or contract once the first institutional pilot or seed milestone we define together is hit.

**Grant variant (emphasis: milestones, openness, stewardship):**

I am the primary maintainer of the codebase and the accountable person for security claims. Milestones, documentation, and public artifacts will be delivered under my name with named contributors where applicable; I will not overstate community size or maintenance capacity.

---

## 9. Grant vs accelerator — emphasis shift

| Topic | Grant application | Accelerator application |
| ----- | ------------------- | ------------------------- |
| **Lead with** | Concrete deliverables, open artifacts, how funds map to milestones | User growth, revenue path, weekly progress |
| **Security** | Threat model, reproducible builds, what you will publish | Same honesty, plus “what breaks if we scale 10×” |
| **Team** | Maintenance and governance | How you recruit after acceptance |

---

## Revision note

Internal engineering source of truth: [`docs/security/threat-model.md`](../security/threat-model.md). If marketing copy diverges from section 5 there, fix the copy or the code—not the investor story alone.
