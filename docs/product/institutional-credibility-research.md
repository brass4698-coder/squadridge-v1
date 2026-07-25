# Institutional credibility research brief

**Status:** Proprietary product research synthesis · **Last updated:** July 2026  
**Audience:** Founders, product, security reviewers, pilot diligence  
**Public-facing claims:** Must stay within [`docs/security/threat-model.md`](../security/threat-model.md) and [`docs/security/public-claims-audit.md`](../security/public-claims-audit.md). This brief informs architecture and copy; it does **not** create legal privilege, court-admissible timestamps, or IOA certification.  
**Execution plan:** Phased MVP → pilot → institutional tasks live in [`platform-evolution-action-plan.md`](platform-evolution-action-plan.md).

---

## 1. Ombuds Confidentiality Precedent (IOA)

### What we draw from

The [International Ombuds Association Standards of Practice](https://www.ombudsassociation.org/assets/docs/IOA_Standards_of_Practice_Oct09.pdf) (also mirrored in NASA’s hosted copy: [IOA Standards of Practice (NASA)](https://www.nasa.gov/wp-content/uploads/2019/05/ioa_standards_of_practice_tagged.pdf)) describe a professional confidentiality architecture built on four principles:

| Principle | Meaning in ombuds practice | SquadRidge mirror (product, not legal) |
| --------- | -------------------------- | -------------------------------------- |
| **Independence** | The office is structurally free of line management pressure over case handling | Facilitator-led rooms; release is not an open feed or auto-publish path |
| **Impartiality** | Fair process advocacy, not party advocacy | Facilitator owns stages and release; AI is advisory only |
| **Informality** | Off-record channel distinct from formal grievance / litigation tracks | Private room ≠ released record; no public transcript |
| **Confidentiality** | Protect identity and substance to the maximum extent permitted by law | Identity isolation on the ledger; room content stays in the room |

### Records practice → room ≠ record

IOA standards emphasize that the ombuds **keeps no records with identifying information on behalf of the organization**, and maintains a consistent destruction / non-retention practice for identifying notes. That professional norm **supports** SquadRidge’s product line: the dialogue room is not a transcript archive for public export; only an approved outcome may leave after facilitator release.

### Privilege held by the office (model, not claim)

In ombuds standards, confidentiality privilege is generally described as held by the **office**, not waived unilaterally by a visitor. That is a useful **design analogy** for facilitator authority over release (distinct from per-participant consent to publish). SquadRidge **does not claim** attorney–client, ombuds, or mediation privilege. Counsel decides privilege for each matter.

### Narrow exceptions template (process language)

Ombuds practice typically reserves narrow exceptions such as:

1. **Imminent risk of serious harm** where no reasonable alternative exists  
2. **Self-defense** against formal misconduct claims involving the office  
3. **Explicit permission** from the person concerned  

Pilot MOUs and facilitator ground rules may adopt a similar **exception template** as operational policy — not as a substitute for applicable law.

### Honest phrasing (required)

- Prefer: **“aligned with established ombuds practice standards”** / **“mirrors IOA confidentiality architecture principles”**
- Avoid: “we are an IOA-certified ombuds,” “ombuds privilege,” “legally privileged communications,” or any implication that SquadRidge *is* an ombuds office

Threat-model honesty still stands: operator-readable rooms today; not E2E against the operator; not full anonymity.

---

## 2. Trusted Timestamping for Verification Anchors (RFC 3161)

### What SHA-256 proves today (shipped)

On release, SquadRidge stores `ledger_sha` — a **SHA-256** digest of the canonicalised approved instrument. Anyone with the released text can recompute the digest and confirm **integrity since publication**.

SHA-256 alone does **not** independently prove *when* the hash was computed to a third-party Time Stamp Authority. Platform `published_at` is operational metadata, not an RFC 3161 token.

### What RFC 3161 would add (planned)

[RFC 3161](https://datatracker.ietf.org/doc/html/rfc3161) Time-Stamp Protocol lets a trusted TSA bind a hash to a trusted time. Layering a TSA token beside `ledger_sha` would support stronger **when** claims for diligence partners — still not automatic “court-admissible” status without jurisdiction-specific evidence rules and a real production TSA.

### Implementation status (honest)

| Layer | Status |
| ----- | ------ |
| SHA-256 `ledger_sha` on release | **Shipped** |
| Optional columns: `timestamp_token`, `timestamp_authority`, `timestamped_at`, `timestamp_status` | **Scaffold** (migration) |
| Typed client interfaces in `src/lib/timestampAnchor.ts` | **Scaffold** |
| Live TSA request in `release_outcome` | **Not implemented** — do not claim in marketing |

Never claim court-admissible timestamps until a real TSA path exists and is documented in the threat model.

---

## 3. Participant cap research

Small-group facilitation research and ADR practice favor compact rooms for high-stakes written dialogue.

| Guidance | Value |
| -------- | ----- |
| Soft default / recommended range | **4–8** participants |
| Product default (NGO pilot template) | **6** |
| Soft warning threshold | **> 8** (co-facilitated institutional cases) |
| Hard ceiling (enforced in DB + UI) | **12** |

UI warns when setting `max_participants` above 8 or inviting past 8. Hard ceiling remains 12 via `sessions_max_participants_range` and capacity triggers.

---

## 4. Anonymity as system property, not legal guarantee

Directional anonymity on the **public record** (no names on the ledger; verified privately by the facilitator) is a **system design property**. It is **not**:

- A guarantee of anonymity from the operator  
- Legal anonymity or witness-protection equivalence  
- Proof against traffic analysis, compelled disclosure, or style-based re-identification by other participants  

Public Security copy must keep this distinction explicit.

---

## 5. AI heat-monitoring: advisory only

Existing optional tone heuristics (`src/lib/ai/pipeline.ts`) and facilitator pacing (`src/lib/sessionPacing.ts`) align with this rule:

| Allowed | Not allowed |
| ------- | ----------- |
| Private suggestion to the **author** (rephrase / slow down) | Autonomous mute or ban |
| Private **heat / tension signal** to the facilitator | AI-initiated release or outcome drafting |
| Facilitator-controlled Slow down / Pause / Pull back | Punitive or public shaming UI |

Do not build autonomous “ConvoWizard”-style enforcement. Core room posting must work when AI is disabled.

---

## 6. Room flow / RSD-style stages → dialogue_stage machine

Restorative / staged dialogue patterns (preparation → hearing → framing → options → agreement) map onto the shipped `dialogue_stage` enum:

| Research / RSD-style phase | SquadRidge `dialogue_stage` |
| -------------------------- | --------------------------- |
| Preparation / intake | `preparation` |
| Opening / process consent | `opening` |
| Story / perspective | `story` |
| Framing / synthesis | `framing` |
| Options | `options` |
| Review / agreement testing | `review` |
| Outcome / release gate | `outcome_ready` |

Lifecycle spine remains **Configure → Verify → Facilitate → Release**. Dialogue stages structure the room; they do not replace approval / release RPCs.

---

## 7. Role split

| Role | Owns | Does not own |
| ---- | ---- | ------------ |
| **Facilitator** | Stages, pacing controls, verification gate, outcome draft, **release** | Legal privilege determinations |
| **Mediator** (where distinct from facilitator) | Confidentiality norms, de-escalation craft, party process | Unilateral public publish |
| **AI** | Advisory tone / heat signals only | Mute, release, or binding decisions |

---

## 8. Research-to-spec mapping

| Research finding | Spec / code surface |
| ---------------- | ------------------- |
| Ombuds confidentiality architecture | Security / About copy; this brief; room≠record architecture |
| No identifying transcript export | `release_outcome` verbatim guard; ledger shows approved text only |
| Office-held confidentiality analogy | Facilitator release authority (not legal privilege claim) |
| Narrow harm / permission exceptions | Pilot MOU / ground-rules template (ops), not product automation |
| SHA-256 integrity | `ledger_sha`, Security verification-anchor section |
| RFC 3161 timestamping | Scaffold columns + `timestampAnchor.ts`; **planned** live TSA |
| Cap 4–8 / hard 12 | `roomCapacity.ts`, templates, invite UI warnings, DB check |
| Anonymity ≠ legal guarantee | Security “Not anonymity”; threat model §5 |
| AI advisory only | `ai/pipeline.ts`, facilitator pacing RPCs |
| Staged dialogue | `dialogueStages.ts` + session RPCs |
| Role split | Facilitator dashboard / control pages; mediator dashboards as navigation shells |

---

## Sources

1. [IOA Standards of Practice (Oct 2009 PDF)](https://www.ombudsassociation.org/assets/docs/IOA_Standards_of_Practice_Oct09.pdf)  
2. [IOA Standards of Practice — NASA-hosted copy](https://www.nasa.gov/wp-content/uploads/2019/05/ioa_standards_of_practice_tagged.pdf)  
3. [RFC 3161 — Internet X.509 Public Key Infrastructure Time-Stamp Protocol (TSP)](https://datatracker.ietf.org/doc/html/rfc3161)  
4. Internal product spine: [`platform-description.md`](platform-description.md), [`dialogueStages.ts`](../../src/lib/dialogueStages.ts), [`threat-model.md`](../security/threat-model.md)

NASA Ombuds Program materials reference IOA standards as the professional baseline for confidentiality, neutrality, informality, and independence; they are cited here as **institutional precedent for architecture language**, not as SquadRidge affiliation.
