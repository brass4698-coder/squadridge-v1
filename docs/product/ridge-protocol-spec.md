# Ridge Protocol — Round Choreography Spec (B1)

**Status:** Design spec (pre-implementation) · **Last updated:** July 2026  
**Parent roadmap:** [impact-roadmap.md](impact-roadmap.md) · **Platform rules:** [squadridge_platform_spec.json](../../squadridge_platform_spec.json)

The **Ridge Protocol** is SquadRidge’s signature facilitation mode: structured **written rounds** that embody a controlled crossing between parties — not a free-form chat flood. This spec defines UX, data model sketch, and constraints before engineering B1.

---

## Goals

1. **Reduce escalation** — async written structure beats real-time message piles under stress.
2. **Protect attribution** — parties respond to facilitator synthesis, not raw opposing quotes in early rounds.
3. **Embody the name** — a narrow, load-bearing path (the ridge) with facilitator as gatekeeper.
4. **Preserve room/record line** — round content stays in room; only drafted outcome may release.

## Non-goals

- Video, audio, or parallel call tools.
- Auto-publishing round content to the ledger.
- AI-authored public outcomes (facilitator remains author of release text).
- Replacing facilitator judgment on when to advance.

---

## Round types

| Round | ID | Participant sees | Facilitator sees |
| ----- | -- | ---------------- | ---------------- |
| **Position** | `position` | Own draft only until submitted; then waiting state | All submitted positions after round closes |
| **Response** | `response` | Facilitator-synthesized summary of other side(s) — not verbatim quotes | Full messages + synthesis editor |
| **Joint** | `joint` | Shared thread under facilitator prompt (optional final round) | Full thread |
| **Cooling** | `cooling` | Read-only room; breathing copy; no compose | Timer + optional extend |

### Position round

1. Facilitator opens round with prompt (e.g. “State your position on principle X in ≤500 words”).
2. Each party submits independently; **other parties’ drafts are hidden**.
3. After submit, participant sees “Submitted — waiting for facilitator.”
4. Facilitator closes round when all required parties submitted (or explicitly ends early with note).

### Response round

1. Facilitator posts **synthesized positions** per side — paraphrase, not copy-paste from room (UI encourages synthesis field separate from raw view).
2. Prompt: “Respond to the summarized positions below.”
3. Parties submit responses; may be visible to facilitator only until round closes (configurable per template).

### Joint round (optional)

1. Facilitator-posted prompt visible to all verified participants.
2. Messages appear in shared thread **only after facilitator releases** each message batch, OR standard realtime with facilitator moderation queue — **default for v1 of Ridge Protocol: facilitator approves each message before visible to other side** (strongest de-escalation).

### Cooling interval

1. Triggered by facilitator or template auto-schedule between rounds.
2. Duration: template default (e.g. 15 min – 24 h); facilitator can extend.
3. Compose disabled; display calm copy (Power of Pause).
4. Optional: participant “Slow down” self-request extends cooling by fixed increment (facilitator notified, not auto-granted).

---

## Power of Pause (ported from legacy session UX)

Reuse patterns from [`SessionPage.tsx`](../../src/pages/SessionPage.tsx):

| Control | Actor | Effect |
| ------- | ----- | ------ |
| **Slow down** | Participant | Request pause; shows breathing overlay on own composer; notifies facilitator |
| **Pull back** | Participant | Retract last unsubmitted draft or last message within short window (if facilitator policy allows) |
| **Pause room** | Facilitator | Entire room read-only for cooling interval |
| **Advance round** | Facilitator | Only path to next round state |

Copy tone: calm, de-escalation-centered — no alarmist or militarized language per design rules.

---

## Session state extension

Extend session status or add `round_state` JSON on `sessions`:

```typescript
interface RidgeProtocolState {
  protocolVersion: 1;
  currentRoundIndex: number;
  rounds: Array<{
    id: string;
    type: 'position' | 'response' | 'joint' | 'cooling';
    prompt: string;
    status: 'pending' | 'open' | 'cooling' | 'closed';
    coolingUntil?: string; // ISO timestamp
    visibility: 'isolated' | 'synthesized' | 'shared' | 'moderated';
  }>;
}
```

**Lifecycle integration:**

- Ridge Protocol runs during **Facilitate** stage only.
- Transition to **Release** requires all configured rounds `closed` OR facilitator override with documented reason (audit event).

---

## Message visibility model (RLS sketch)

| Visibility | Rule |
| ---------- | ---- |
| `isolated` | `session_messages` row visible to author + facilitator only until round closes |
| `synthesized` | Participants see facilitator’s synthesis message id, not source ids |
| `shared` | All verified participants in session |
| `moderated` | Messages `pending` until facilitator `approved_at` set |

New columns (future migration):

- `session_messages.round_id`
- `session_messages.visibility`
- `session_messages.approval_status` (`pending` | `approved` | `rejected`)

Threat-model update required before shipping `isolated` / side-specific briefings (B5 overlap).

---

## Facilitator control panel (UX)

**SessionControlPage** additions:

1. **Round rail** — vertical stepper: Position → Cooling → Response → … → Ready for outcome.
2. **Synthesis workspace** — side-by-side raw submissions (facilitator only) + synthesis editor for response round.
3. **Advance gate** — primary CTA disabled until round completion rules met.
4. **Participant status** — submitted / waiting / in cooling per party.

**ParticipantRoomPage** additions:

1. Current round banner with prompt and word limit.
2. Single compose area when round `open`; hidden during `cooling`.
3. Clear “Your submission is private until the facilitator closes this round.”

---

## Template defaults

| Template | Default rounds |
| -------- | -------------- |
| Community mediation | Position → Cooling (24h) → Response → Joint (moderated) |
| NGO deliberation | Position → Response → Joint |
| Track II dialogue | Position → Cooling (48h) → Response → Position (optional second) → Joint (moderated) |

Templates in [`sessionTemplates.ts`](../../src/lib/sessionTemplates.ts) gain optional `ridgeProtocol: { rounds: [...] }` when implemented.

---

## Automation boundaries

| Automate | Do not automate |
| -------- | ----------------- |
| Round timer expiry → cooling state | Choosing synthesis text |
| Notify participants when round opens/closes | Advancing round without facilitator click |
| Block compose when cooling active | Releasing positions to other side early |
| Audit log round transitions | Drafting public outcome from round text |

Aligns with `must_not_automate` in platform spec.

---

## Acceptance criteria (B1 done)

1. Facilitator can run Position → Cooling → Response on a test session with two participants.
2. Party A cannot read Party B’s position draft before round close.
3. Response round shows synthesis only, not raw opposing submission.
4. Cooling interval blocks compose for all participants.
5. No round content appears in outcome editor via import.
6. Facilitator must click Advance between rounds.
7. pgTAP or e2e covers visibility rules for `isolated` messages.

---

## Implementation phases (suggested)

1. **B1a** — Round state on session + facilitator round rail (no RLS change; facilitator-only visibility).
2. **B1b** — `isolated` message visibility + participant submit flow.
3. **B1c** — Synthesis workspace + response round.
4. **B1d** — Cooling interval + Power of Pause UI.
5. **B1e** — Moderated joint round (optional).

Do not ship B1b+ until P0 state machine and participant invite fix from [ROADMAP.md](../../ROADMAP.md) are complete.

---

## Related documents

- [impact-roadmap.md](impact-roadmap.md) — B1 in 12-month plan
- [platform-description.md](platform-description.md) — Facilitate stage today
- [threat-model.md](../security/threat-model.md) — visibility claims
- [component-rules.mdc](../../.cursor/rules/component-rules.mdc) — UI accessibility for round rail
