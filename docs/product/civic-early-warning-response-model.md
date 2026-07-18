# SquadRidge — Civic early-warning and response model

**Status:** Product mental model / long-horizon vision · **Last updated:** July 2026  
**Audience:** Founders, contributors, partners, and anyone who needs the end-to-end civic narrative.  
**Companion truth docs:** [`platform-description.md`](platform-description.md) (what ships today) · [`../security/threat-model.md`](../security/threat-model.md) (privacy bounds) · [`../founding/positioning.md`](../founding/positioning.md) (category wedge for public copy)

---

## How to read this document

This is the **full civic “early-warning and response” mental model**: anonymous (directionally anonymous) intake → facilitator-led structuring → PII-redacted ledger → implementation-ready proposals → institutional feedback loops.

| Layer | Meaning |
| ----- | ------- |
| **Mental model (this doc)** | How the product is *meant* to work end-to-end for civic harm prevention and institutional action. |
| **Shipped today** | Facilitator-led protected written rooms, private verification, deliberate outcome release, verification-anchored public ledger — see [`platform-description.md`](platform-description.md). |
| **Roadmap / not yet product-complete** | Automated PII redaction pipelines, proposal-drafting engines, ZK membership gates as the default path, room directories, institutional CRM routing, and validated impact claims. |

**Public marketing must not conflate this vision with surveillance.** Live site copy correctly states SquadRidge is **not** predictive policing or continuous early-warning *monitoring*. This document describes **community-sourced early signal → facilitated structuring → redacted public record → actionable proposals** — human-governed civic response, not automated threat scoring. See [`../design/full-site-visual-direction.md`](../design/full-site-visual-direction.md) and [`SITE_NOT` in `src/data/siteMessaging.ts`](../../src/data/siteMessaging.ts).

**Honesty on anonymity and ZK:** Prefer “without public attribution,” “verified privately,” and “pseudonymous in the room.” Unqualified “anonymous” and “full platform zero-knowledge” are **not** accurate for the shipped stack; see threat model §5.

---

## One-sentence thesis

SquadRidge is a privacy-preserving, facilitator-led civic **early-warning and response** system: it surfaces patterns of harm and tension from protected conversations, then turns them into concrete, PII-redacted proposals that trusted institutions can act on.

You can think of it as **GitHub Issues + civic mediation + anonymous safety hotlines + an open, redacted changelog.**

---

## 1. Core purpose and mental model

At its heart, SquadRidge is trying to solve four problems at once:

- People see violence and harm forming *early*, but have no safe, low-friction way to report or discuss it without retaliation.
- Institutions (schools, cities, campuses, transit, etc.) drown in unstructured “complaints” rather than clear, implementable proposals.
- Traditional reporting tools either deanonymize people or bury them in bureaucratic forms.
- Community peace work is often ad-hoc and ephemeral, with no durable, auditable trail of “what communities actually asked for, and when.”

So the **mental model** is:

1. **Anonymous intake** — People enter themed spaces (rooms) where they can safely surface situations, patterns, and needs without exposing their identity on the public record.
2. **Facilitated structuring** — Trained facilitators guide those discussions into structured problem statements, harms, and candidate solutions.
3. **Ledger and redaction** — The conversation’s accepted outcomes are committed to a PII-redacted, append-only public ledger, so the public can see *issues and ideas*, but never raw identities.
4. **Proposal generation** — From each room’s structured record, the system (and/or facilitator with tooling support) compiles one or more formal, implementation-ready proposals for whoever controls the levers (school boards, agencies, landlords, platform trust & safety, etc.).

**Shipped today:** steps 1–2 as facilitator-led sessions with private verification; step 3 as deliberate outcome release with a verification anchor (human-authored outcome text, not a transcript); step 4 as facilitator-drafted outcomes — not an automated proposal engine.

---

## 2. Entry, identity, and anonymity layer

### 2.1 How a participant arrives

Typical entry paths (vision + pilot-compatible):

- A QR code or link posted in a school, residence, transit hub, or online community.
- An invite from a community partner (mutual aid org, neighborhood association, student org).
- A “join a room by topic” directory embedded in a partner’s site or app.

On arrival, the user sees:

- A **room directory** scoped to their context: for example, “Campus safety: housing,” “Transit harassment on Route 7,” “Conflict at XYZ complex,” or “Police–community encounters in District 3.”
- High-level descriptions of each room’s purpose, expected time commitment, and rules.
- Prominent guarantees about anonymity *bounds*, what’s logged, and who sees what.

**Shipped today:** Invite / token-gated session entry (`/p/*`), not an open civic room directory. Pilot access for facilitators is request + manual review.

### 2.2 Identity, trust, and zero-knowledge posture

**Design goals:**

- The platform **knows enough** to enforce access (e.g., “you’re a student of this school / resident of this building”) without requiring raw identifiers in the conversational UI.
- Other participants see a **stable pseudonym** and role tags (e.g., “Student,” “Resident,” “Bus operator”) but never name, email, phone, or exact address on the public record.
- Facilitators may verify eligibility **privately** (current product truth); ZK / blind-signature gates are the **aspirational** membership pattern.

**Typical pattern (vision):**

- User proves membership with something like a one-time token, email to a ZK-enabled relay, or an institution-issued credential.
- A **zero-knowledge or blind-signature gate** verifies “in group X” without revealing who they are to SquadRidge core (*roadmap / partial on legacy Semaphore path*).
- Post-verification, the client receives a **room-scoped pseudonymous key** that signs their contributions — integrity and uniqueness without binding to a public identity.

**Binding constraint:** PII is never a required field in the conversational UI. PII can only leak via user-typed free-text; that is the part the system must aggressively redact before external publication (*automated pipeline = roadmap; facilitator-controlled release = shipped*).

---

## 3. Facilitator-led rooms: structure and flow

### 3.1 Role of the facilitator

Facilitators are the backbone of the system. They:

- Set the **scope, norms, and emotional safety** of the room: what it’s for, what it’s not for, and the boundaries.
- Nudge participants from venting into **structured problem solving**.
- Translate raw experiences into the fields that will later become a proposal: harms, stakeholders, constraints, and options.

They’re trained in:

- De-escalation and trauma-informed communication.
- Recognizing and defusing inflammatory language while preserving the core signal.
- Using structured prompts and templates so conversations are “proposal-ready” from the jump.

This aligns with the shipped principle: **the facilitator owns judgment; the platform automates workflow mechanics where safe.**

### 3.2 Room lifecycle

A typical room life:

1. **Creation**  
   - Initiated by a partner (e.g., school, city office, tenant association) or by SquadRidge staff after a pattern of reports.  
   - Configured with topic/scope, implementation partner, timeline (one-off sprint vs ongoing), and required roles.

2. **Onboarding participants**  
   - Short briefing: purpose, confidentiality boundaries, mandatory reporting triggers if any, and how proposals / outcomes will be generated.  
   - Clear visible statement of logging and identity bounds (honest, not overclaimed).

3. **Discussion phases** (facilitator-guided)  
   - **Phase A — Story collection:** Anonymous (pseudonymous) sharing; facilitator clusters similar experiences.  
   - **Phase B — Pattern making:** Root drivers, systemic patterns, hot spots → structured fields.  
   - **Phase C — Solution exploration:** Interventions that feel both just and realistic.  
   - **Phase D — Prioritization and tradeoffs:** Rank options against cost, feasibility, fairness, and risk of harm (including non-carceral alternatives).

4. **Closure**  
   - Facilitator summarizes what the room converged on.  
   - System shows a preview of the **draft proposal / outcome** so participants feel ownership before release.

The entire room is designed so that everything participants say can flow into “something someone can actually do” rather than getting stuck at the venting stage.

**Shipped today:** Configure → Verify → Facilitate → Release session lifecycle with templates; structured rounds are facilitator-driven; Ridge Protocol expands choreography on the roadmap.

---

## 4. Data capture, structure, and PII-redacted ledger

### 4.1 Internal vs public representations

SquadRidge uses two layers of data — the architectural line that must not blur:

| Layer | Contents | Access |
| ----- | -------- | ------ |
| **Internal, access-controlled room record** | Rich, timestamped logs; facilitator annotations and tags. Pseudonymous; may temporarily hold more detail before redaction. | Narrow authorized set (facilitator + governed safety/research access). |
| **Public-facing, PII-redacted ledger** | Summarized, structured view: problem description, aggregated harms, candidate solutions, links to formal proposal(s). Append-only so audiences can see historical evolution. | Anyone with the ledger URL. |

**Unbreakable promises (aligned with shipped product):**

1. No public transcript of session dialogue.
2. Participant identities never appear on the released record.
3. Only deliberate release (facilitator authority) publishes.
4. Tamper-evident verification anchor on every published record.

### 4.2 Automated PII redaction pipeline

**Vision pipeline** (because PII primarily appears in free-text):

1. **Detection** — Pattern rules (emails, phones, SSNs) plus NLP for names, precise addresses, and high-risk org/individual couplings; tuned for civic contexts (“King County Metro” often safe; “John from apartment 3B” not).
2. **Masking / substitution** — Remove or generalize high-precision fields while preserving actionability (“bus stop near 5th & Main” per local policy).
3. **Human review for sensitive rooms** — Domestic violence, gang conflict, minors: facilitators or redaction reviewers confirm before release.
4. **Ledger commit** — Redacted text + structured fields written with a cryptographic hash for auditability.

**Shipped today:** Facilitator-drafted outcome text + SHA-256 verification anchor at release; architectural redaction aids in the outcome editor are on the Phase A roadmap. Do not claim a fully automated production redaction pipeline until it exists and is reviewed.

---

## 5. From conversation to proposal

This is where SquadRidge differentiates itself from simple “feedback” platforms: the goal is not only to store complaints, but to **manufacture ready-to-use proposals**.

### 5.1 Structuring during the conversation

Throughout the room’s lifespan, the facilitator pushes content into a schema aligned with institutional recipients:

- Problem statement (short, crisp)
- Evidence / lived experiences (clustered stories)
- Stakeholders and roles (who is harmed, who has power, who is absent)
- Root causes / contributing factors
- Options surfaced by participants
- Risks and concerns (including unintended consequences)
- Preferred options and ranking
- Constraints (budget, legal limits, operational barriers)

### 5.2 Proposal drafting engine

At room closure (or designated milestones), a **proposal engine** (*vision*) would:

1. **Synthesize narratives into findings** — Cluster similar incidents; write concise findings.
2. **Formal problem definition** — Institutional language that preserves community voice; scope and urgency.
3. **Option analysis** — Impact, pros/cons, equity analysis per option.
4. **Recommended actions** — Numbered steps, suggested timeline, responsible party, resource estimate (even qualitative).
5. **Implementation-ready attachments** — Draft policy language, sample signage, CPTED-style mock-ups where appropriate.

Every proposal stays tied to public ledger entries (hashes / references) so recipients can verify fidelity to room content.

**Shipped today:** Human-authored outcomes with approval workflow (`outcome_approvals` → `release_outcome`). Automated synthesis and attachment generation are **not** shipped.

---

## 6. Routing to decision-makers and feedback loop

### 6.1 Submission targets

For each room, the implementation target is set at creation, for example:

- **Campus:** Dean of Students, Title IX office, campus safety, or a joint task force.
- **City:** Department of Transportation, Office of Violence Prevention, Parks & Rec.
- **Housing:** Property management, tenant union, fair housing office.
- **Platform:** Internal T&S / policy team, product team.

The proposal package includes:

- Executive summary
- Full proposal document
- Appendices referencing ledger entries
- Optional de-identified quotes illustrating lived experience

Delivery uses channels these actors actually respond to (email, ticketing, shared drive, CRM upload).

**Shipped today:** Public ledger record + verification anchor; institution-specific packaging and CRM routing are roadmap.

### 6.2 Accountability and public visibility

Because of the public ledger:

- Communities can see that “a proposal was delivered on date X to recipient Y for room Z.”
- If institutions respond (approve, partially adopt, reject), that response can be logged as a new ledger event, closing the loop.

Potential follow-up rooms:

- **Implementation review** rooms: Did the change reduce harm? Unintended side-effects?
- New proposals iterate — a civic continuous-integration cycle.

---

## 7. Example: End-to-end walk-through

Imagine a mid-size city corridor where youth fights and intimidation have been rising near a light-rail station.

1. **Room creation** — City’s violence prevention office and a youth nonprofit co-sponsor a “Station safety for teens” room.
2. **Participants join** — Students and nearby residents scan QR codes or visit a link; prove locality without public identity; receive pseudonyms; enter.
3. **Facilitated conversation** — Teens describe feeling unsafe waiting for trains; residents describe noise and occasional property damage. Facilitator clusters themes: after-school crowding, lack of supervision, under-lit areas, aggressive policing.
4. **Solution work** — Options explored (youth workers at peak hours, lighting, restorative programs, etc.); group converges on interventions that avoid over-policing while making the space safer.
5. **Redacted ledger** — Stories and decisions run through PII redaction (vision) / facilitator-approved outcome release (shipped) and commit to the public ledger. Patterns visible; identifiers gone.
6. **Proposal** — Package to transit authority and city: youth outreach workers 2–5 PM; lighting in two blind spots; co-designed de-escalation signage.
7. **Submission and follow-up** — Delivery logged; institutional response logged; three months later an implementation-review room evaluates real-world effects.

---

## 8. Mapping vision → shipped product

| Vision step | Shipped (July 2026) | Gap / roadmap |
| ----------- | ------------------- | ------------- |
| Themed room directory + QR intake | Token invites; facilitator session create | Partner-embedded directories |
| ZK / blind membership gate | Facilitator private verify; Semaphore on legacy path | Default ZK membership for civic cohorts |
| Facilitated phases A–D | Facilitator-led written room + templates | Ridge Protocol structured rounds |
| Automated PII redaction | Human-authored release; no public transcript | Detection → mask → human review pipeline |
| Proposal drafting engine | Facilitator drafts outcome; approvals; release | Synthesis, option analysis, attachments |
| Institutional routing + response loop | Public ledger + anchor | Delivery packaging, response events, review rooms |

---

## 9. Related documents

| Document | Use when |
| -------- | -------- |
| [`platform-description.md`](platform-description.md) | Honest shipped product description |
| [`../business/strategic-positioning-early-warning.md`](../business/strategic-positioning-early-warning.md) | Prevention / early-warning category framing for decks |
| [`../founding/positioning.md`](../founding/positioning.md) | Public category wedge and message guardrails |
| [`../founding/north-star.md`](../founding/north-star.md) | Contributor decision tests |
| [`csi-spec.md`](csi-spec.md) | Conflict Severity Index (roadmap; not partner-facing product) |
| [`../security/threat-model.md`](../security/threat-model.md) | What privacy claims are allowed |
| [`impact-roadmap.md`](impact-roadmap.md) | Differentiation timeline |
| [`../../ROADMAP.md`](../../ROADMAP.md) | Near-term engineering checklist |
