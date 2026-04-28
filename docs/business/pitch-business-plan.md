# SquadRidge — Business Plan Pitch
### Comprehensive Pitch Document · Pre-Seed Stage · April 2026

---

## Executive Summary

SquadRidge is a verified-anonymous, cross-border dialogue platform purpose-built for conflict prevention. We securely connect small groups of citizens across geopolitical divides — using zero-knowledge cryptography to protect their identities and AI de-escalation to sustain productive dialogue.

**The problem is urgent.** 1.8 billion people live in fragile or conflict-affected states. The peacebuilding organizations, NGOs, and Track II diplomacy programs trying to reach them are operating with consumer tools — Zoom, Signal, Slack — that expose identities, amplify outrage, and generate no actionable intelligence. There is no purpose-built, encrypted infrastructure for cross-border citizen peacebuilding. SquadRidge fills that gap.

**The platform works.** Our MVP is functional: ZK-verified onboarding, structured squad matching, Realtime encrypted messaging, AI tone detection, and a de-identified sentiment data pipeline are all operational in staging. We are built on React + TypeScript, Supabase (PostgreSQL + Realtime + Edge Functions), and the Enclave[ZK] privacy stack from Enclave Health Technologies Inc. (EHTI).

**The business model is sound.** We monetize through institutional SaaS licensing (B2B/B2G) for NGOs and UN agencies, early warning data subscriptions for think tanks and policy analysts, and non-dilutive grants from USIP, MacArthur, and Open Society Foundations. The citizen-facing core is free — essential for grassroots adoption in low-income conflict zones.

**We are raising $500K** on a SAFE ($5M pre-money cap) to ship production-ready ZK verification, close 3–5 institutional pilot partners, and complete an independent security audit — unlocking a $2–3M seed round within 18 months.

---

## Section 1 — The Problem

### 1.1 The Structural Gap in Peace-Tech Infrastructure

The peace-tech ecosystem has matured significantly — early warning systems (VIEWS, ACLED, GDELT), AI-powered conflict forecasting, and grassroots organizing tools have all advanced. But one critical layer is missing: **a secure, scalable platform for the actual dialogue**.

Today's peacebuilders — facilitators, mediators, NGO workers, diaspora activists — run cross-border dialogue programs using Zoom for video, Signal for secure messaging, and Google Drive for documentation. These tools were designed for corporate productivity. They are actively dangerous in conflict environments.

**Three failure modes define the status quo:**

**Failure 1: Identity Exposure**
In Ukraine, Gaza, Sudan, and dozens of other conflict zones, revealing your name, location, or political views can mean arrest, disappearance, or death. Zoom displays real names. Google Workspace requires institutional email. Signal protects content but not metadata. None of these tools offer verified anonymity — the ability to prove you qualify for a dialogue without revealing who you are.

**Failure 2: Platform Amplification**
Twitter/X, Facebook, and Reddit are optimized for engagement, not understanding. Research consistently shows these platforms deepen affective polarization. When peacebuilders try to use general social platforms for outreach, they compete against algorithmic outrage amplification.

**Failure 3: The Warning-Response Gap**
Policy analysts, UN agencies, and think tanks lack real-time, ground-level sentiment data from conflict zones. Early warnings exist (VIEWS projects record-high conflict risk in 2026 across Ukraine, Palestine/Israel, and the Sahel) but fail to catalyze timely political action because they lack fine-grained, localized human signal. The dialogue sessions happening inside NGO programs today contain exactly that signal — and it evaporates when sessions end.

### 1.2 The Scale of the Problem

- **1.8 billion people** live in fragile or conflict-affected states (World Bank, 2024)
- **~8,000 active peacebuilding organizations** worldwide operate without purpose-built infrastructure
- **VIEWS 2026 projections** flag Ukraine, Palestine/Israel, and the Sahel as highest-risk regions — all three are precisely where state surveillance makes identity-exposing tools unusable

---

## Section 2 — The Solution

### 2.1 Platform Overview

SquadRidge is a verified-anonymous, cross-border dialogue platform. It matches 4–6 participants from opposing sides of a geopolitical conflict into secure, time-bound dialogue sessions — with no PII ever exposed.

The platform has three integrated layers:

**Layer 1 — Verified Anonymity (Zero-Knowledge Proofs)**
Participants prove relevant attributes (citizenship, organizational role, conflict-affected status) using Semaphore-based zero-knowledge proofs. The system confirms eligibility. It never knows who the participant is. Proofs are generated client-side in the browser — no raw credentials ever reach the server.

**Layer 2 — Structured Small-Group Dialogue**
Participants are matched into squads of 4–6 across conflict lines using a configurable matching algorithm. Sessions follow structured dialogue frameworks (mutual fears, shared goals, common narratives) rather than open-ended chat. Facilitators have real-time dashboards to monitor session health and intervene with prompts.

**Layer 3 — AI De-escalation and Early Warning**
An in-browser AI tone monitor runs continuously. When tension rises, participants see a "Slow down" prompt — a one-tap pause on message sending. A "Pull back" feature allows message retraction within a grace window. De-identified sentiment aggregates are optionally contributed to a Data Commons, feeding early warning signals to vetted mediators and policy analysts.

### 2.2 Key Differentiators

| Feature | SquadRidge | Zoom + Signal | Twitter/Reddit | Platform4Dialogue |
|---|---|---|---|---|
| Verified anonymity (ZK proofs) | ✅ | ❌ | ❌ | ❌ |
| Cross-border structured matching | ✅ | ❌ | ❌ | Partial |
| AI de-escalation | ✅ | ❌ | ❌ | ❌ |
| Facilitator dashboard | ✅ | ❌ | ❌ | Partial |
| Early warning data pipeline | ✅ | ❌ | ❌ | ❌ |
| Designed for authoritarian contexts | ✅ | ❌ | ❌ | ❌ |
| Purpose-built for Track II diplomacy | ✅ | ❌ | ❌ | Partial |

### 2.3 The UX Philosophy

Every design decision in SquadRidge is anchored by two principles: **safety first** and **the Power of Pause**.

Onboarding surfaces non-violence norms explicitly — not buried in a ToS checkbox. Participants are told exactly how their identity is protected before they verify anything. The session interface prioritizes reflection over reaction: structured prompts, de-escalation interventions, and an intimate squad size that makes anonymous strangers feel like people.

---

## Section 3 — Market Analysis

### 3.1 Market Size

SquadRidge operates at the intersection of peace-tech, civic tech, and privacy tech. The addressable market is defined by institutional demand for secure dialogue infrastructure and early warning data.

**Tier 1 — Track II / NGO SaaS (Beachhead)**
~8,000 active peacebuilding organizations worldwide. Estimated ~2,000 with digital dialogue programs and budget for tooling. Conservative ASP of $15K/yr per org yields a $30M SAM. TAM at full market penetration: ~$400M.

**Tier 2 — Early Warning Data Subscriptions**
~500 active think tanks, UN agencies, and government policy offices consuming conflict intelligence. ASP of $40K/yr yields a $20M SAM. TAM: ~$200M.

**Tier 3 — Grassroots B2C (Long-term optionality)**
1.8 billion people in conflict-affected states. Even modest premium feature conversion on a free-tier population represents enormous upside. Not modeled in near-term projections.

**Total near-term TAM: ~$600M+**

### 3.2 Competitive Landscape

No direct competitor exists. The competitive landscape divides into three categories:

**General-purpose tools repurposed for dialogue (Zoom, Signal, Google Workspace):** Dominant in current NGO practice. Zero anonymization, zero facilitation tooling, zero structured matching. High switching motivation once an alternative exists.

**Niche civic/peace platforms (Platform4Dialogue, CitizeX, Hush Line):** Exist but are not designed for cross-border anonymity, not structured for small-group dialogue, and not built for the Track II institutional use case.

**Adjacent privacy tools (Threema, Briar):** Strong cryptographic guarantees, but no facilitation layer, no matching, and no peace-tech positioning.

**The gap is uncontested.** SquadRidge is the first platform that combines verified anonymity, structured matching, AI de-escalation, and an institutional facilitation layer in a single product.

### 3.3 Market Timing

Three forces make 2026 the right moment:

1. **ZK cryptography is production-ready.** Browser-native Semaphore proofs are feasible today. The stack that was experimental in 2021 is shippable in 2026.
2. **Conflict is accelerating.** VIEWS 2026 projections flag the highest global conflict risk in a decade. The demand signal is not hypothetical.
3. **Peace-tech investment is surging.** The sector is projected to reach $1B by 2025. The PeaceTech Accelerator launched in 2026 specifically targeting pre-seed infrastructure plays. Specialized funders are actively searching for the platform layer.

---

## Section 4 — Business Model

### 4.1 Revenue Streams

**Revenue Stream 1 — Institutional SaaS Licensing**
Annual licenses for NGOs, peacebuilding organizations, UN agencies, and Track II programs. License includes facilitator dashboard, session management, organizational analytics, and configurable dialogue frameworks.

*Pricing tiers (indicative):*
- Starter (up to 5 facilitators, 50 sessions/yr): $10,000/yr
- Professional (up to 20 facilitators, 200 sessions/yr): $35,000/yr
- Enterprise (unlimited, white-label, API access): $75,000+/yr

*Target customers:* Search for Common Ground, Interpeace, USIP affiliates, regional NGO networks

**Revenue Stream 2 — Early Warning Data Subscriptions**
Annual subscriptions for vetted mediators, think tanks, and policy analysts. Provides access to de-identified, aggregated sentiment streams from consenting SquadRidge sessions. Covers regional tension indices, escalation pattern alerts, and narrative shift signals.

*Pricing tiers (indicative):*
- Analyst access (single region): $25,000/yr
- Institutional access (multi-region + API): $75,000–$100,000/yr

*Target customers:* UN DPPA, ACLED-adjacent research bodies, foreign policy think tanks, diplomatic missions

**Revenue Stream 3 — Non-Dilutive Grants and Philanthropic Funding**
Peace-tech social enterprises routinely secure significant non-dilutive capital. This is not grant dependency — it is how the market is structured at early stage.

*Active pipeline:*
- USIP annual grant competition: $70K–$100K
- MacArthur Foundation (Fund for Peace): $200K–$500K range
- Open Society Foundations (transparency tech): $100K–$250K range
- AI for Peace (AI4P) / DeepFunding: $50K–$150K
- SBIR/STTR (DoD or NIH): Up to $1.25M phased

**Free Tier (Mission-Critical)**
The core matching, verification, and dialogue experience is permanently free for individual citizens. This is non-negotiable: the platform's mission requires participation from people in low-income, low-bandwidth conflict zones. Premium B2C features (enhanced verification badges, community organizer analytics) are a future consideration.

### 4.2 Financial Projections

*Pre-revenue. The following represents target milestones, not guaranteed performance.*

| Milestone | Target Date | Revenue Signal |
|---|---|---|
| First institutional pilot (free) | Month 3 post-raise | Validation |
| 3–5 pilot partners signed | Month 6 post-raise | $0 (pilots) |
| Convert 2 pilots to paid licenses | Month 12 post-raise | ~$50K ARR |
| First data subscription contract | Month 15 post-raise | ~$50K ARR |
| First USIP/MacArthur grant received | Month 9–12 post-raise | ~$100K non-dilutive |
| **Total ARR at Series A trigger** | **Month 18** | **~$150K–$200K ARR** |
| Series A raise target | Month 18–24 post-raise | $2–3M |

### 4.3 Ethical Constraints on Monetization

SquadRidge operates as a social enterprise. Our revenue model is bounded by explicit "do no harm" principles:

- We do not sell, license, or expose raw PII from any session, ever.
- We do not sell de-identified data to actors whose use case could endanger participants (state intelligence agencies, conflict parties, surveillance vendors).
- Data Commons participation is always opt-in, with participant-level consent managed per session.
- We will not introduce advertising or engagement-optimization mechanics that could compromise dialogue quality.

---

## Section 5 — Operations

### 5.1 Technical Infrastructure

**Frontend:** React 18 + TypeScript + Vite. Deployed on Vercel (preferred) or Netlify. Static build; all sensitive logic runs either client-side (ZK proofs, AI tone detection) or server-side (Edge Functions).

**Backend:** Supabase — managed PostgreSQL with Row Level Security, Auth (including Anonymous sign-in for the demo flow), Realtime (WebSocket-based session messaging), and PostgREST-style data access via `supabase-js`.

**Server-side logic:** Supabase Edge Functions (Deno runtime) — ZK proof verification (`verify-zk-proof`), sentiment aggregation, and session lifecycle management.

**AI pipeline:** In-browser Web Worker for tone detection and translation. No remote AI API required for core de-escalation features. `VITE_ENABLE_AI` flag optionally enables `sentiment_metrics` persistence. Architecture is designed to be cost-controlled and privacy-preserving by default.

**Privacy stack:** Enclave[ZK] by Enclave Health Technologies Inc. (EHTI). Semaphore-based ZK proofs for attribute verification. Ephemeral message data deleted per configurable retention policy.

**DevOps:** GitHub Actions CI/CD. Supabase migrations deployed automatically on merge to `main`. Frontend artifact built and deployable via separate pipeline (Vercel/Netlify project settings). Docker Compose available for local development.

### 5.2 Security Architecture

SquadRidge's threat model is documented in `docs/security/threat-model.md`. Key design decisions:

- **No PII stored on the server.** ZK proofs are verified; credentials are not retained.
- **Row Level Security (RLS)** enforced at the database layer — not just application logic.
- **Ephemeral messaging.** Session content is time-bounded and deleted per policy.
- **Separation of concerns.** Ephemeral message streams are architecturally separated from aggregated analytics pipelines.
- **Independent security audit** is a funded milestone in this raise.

### 5.3 Scalability Path

Supabase provides managed horizontal scaling for PostgreSQL and Realtime. The stateless frontend (React/Vite, deployed to CDN) scales to unlimited concurrent users at near-zero marginal cost. Edge Functions scale automatically on Deno Deploy infrastructure. The primary scaling constraint at MVP stage is matchmaking queue throughput — addressed in the roadmap via a dedicated matching engine (either Edge Function or lightweight worker).

### 5.4 Team

*Sole founder at pre-seed stage. No team yet.*

Engineering, product, and business development are currently founder-led. First hires (funded by this raise) will be:
1. **Contract security engineer** — ZK proof stack and audit preparation
2. **Contract backend engineer** — Matching engine and production hardening
3. **Business development** (part-time or advisory) — Institutional partnership outreach

---

## Section 6 — Funding Strategy

### 6.1 Current Round

**Instrument:** SAFE (Simple Agreement for Future Equity)
**Raise:** $500,000
**Pre-money valuation cap:** $5,000,000
**Discount:** None
**Target close:** 60 days from first term sheet

### 6.2 Use of Funds

| Category | Allocation | Amount |
|---|---|---|
| Product & engineering (contractors, ZK audit) | 50% | $250,000 |
| Institutional BD & first pilots | 25% | $125,000 |
| Independent security audit | 15% | $75,000 |
| Operations, legal, incorporation | 10% | $50,000 |
| **Total** | **100%** | **$500,000** |

### 6.3 18-Month Milestones (This Raise)

- [ ] Ship production-ready ZK verification (live Semaphore proofs, not stub)
- [ ] Complete independent security audit of ZK stack and data pipeline
- [ ] Close 3–5 institutional pilot partners (targeting SFCG, Interpeace, USIP affiliate)
- [ ] Convert 2 pilot partners to paid licenses (~$50K ARR)
- [ ] Close first data subscription contract (~$50K ARR)
- [ ] Receive first grant award (USIP or MacArthur; ~$100K non-dilutive)
- [ ] Hit ~$150–200K ARR + grant funding
- [ ] Raise $2–3M seed round

### 6.4 Subsequent Funding Phases

**Seed Round ($2–3M, Month 18–24):** Scale institutional partnership team, build matching engine, expand into 2–3 additional conflict regions, hire full-time engineering lead.

**Series A ($8–12M, Year 3):** Global expansion, Data Commons formalization, government procurement pipeline (UN agencies, State Dept. adjacent), AI pipeline enhancement for multi-language support.

**Non-dilutive grants** are pursued in parallel at every stage — this is standard and expected in peace-tech; it does not indicate commercial weakness.

---

## Section 7 — Appendix

### A — MVP Demo Summary

The SquadRidge MVP is operational in staging. Available for live demo on request. Key flows:

**Citizen flow:**
1. Land on `/intent` screen → select "Find my squad"
2. Complete ZK attribute verification (citizenship / org role)
3. Enter matching queue
4. Join squad session → structured dialogue with AI tone monitoring
5. Access "Slow down" and "Pull back" de-escalation tools

**Facilitator / admin flow:**
1. Access `/admin/health` for connectivity and system status
2. Create and manage sessions via Session Hub
3. Monitor real-time session sentiment dashboard
4. Insert structured prompts; pause or close sessions
5. Export de-identified session analytics

**Developer flow:**
1. `npm install && cp .env.example .env`
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
3. `npm run dev` → full local environment
4. Migrations apply via `supabase db push` or GitHub Actions CI

*Staging URL and credentials available on request under NDA.*

### B — ZK Verification Technical Summary

SquadRidge implements Semaphore-based zero-knowledge proofs for attribute verification. The flow:

1. **Client generates proof** — Browser-side WASM (Semaphore library) generates a ZK proof that the user possesses a valid credential for the required attribute, without revealing the credential.
2. **Proof submitted** — Proof and public signals sent to `verify-zk-proof` Supabase Edge Function.
3. **Server verifies** — Edge Function validates proof cryptographically. On success, user is granted a session-scoped anonymous identity.
4. **No PII retained** — Neither the credential nor any identifying data is stored after proof verification.

*For full technical specification, see `docs/technical/zk-implementation.md` and `docs/technical/data-retention-zk.md`.*

### C — Regulatory and Ethical Considerations

**GDPR / Data Privacy:** By design, SquadRidge stores no PII. ZK proofs verify without retaining credentials. Ephemeral session content is deleted per configurable policy. GDPR compliance is architecturally enforced, not policy-only.

**"Do No Harm" principles:** Documented in `docs/security/threat-model.md`. All data monetization decisions are gated by an ethical review process. Data Commons participation requires explicit, session-level participant consent.

**Export controls / dual-use:** Cross-border dialogue platforms operating in conflict zones may intersect with export control considerations (e.g., OFAC-sanctioned regions). Legal counsel will be retained as part of this raise to assess applicable constraints.

**IRB and research ethics:** Partner organizations running facilitated programs on SquadRidge may have IRB obligations. SquadRidge's consent management infrastructure is designed to support — not replace — organizational IRB compliance.

### D — Risk Factors

| Risk | Mitigation |
|---|---|
| State actor interference / censorship | ZK stack makes platform resilient to subpoena; Tor-compatible routing on roadmap |
| ZK proof scalability at volume | Semaphore is production-proven in other contexts; scaling benchmarks planned pre-Series A |
| Participant safety in high-risk zones | Threat model reviewed continuously; security audit funded in this raise |
| NGO sales cycles are long (6–18 months) | Pilot-first model reduces friction; grant capital provides runway buffer |
| Solo founder execution risk | First contractor hires are day-one post-close; advisory board recruitment underway |
| Peace-tech market remains niche | B2G and UN procurement paths provide institutional revenue floor independent of NGO market |

---

*SquadRidge · Pre-Seed Business Plan · April 2026*
*Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI)*
*All financial projections are forward-looking estimates, not guarantees.*
*Contact: [founder] · github.com/brass4698-coder/squadridge-v1*
