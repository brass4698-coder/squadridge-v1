# Room experience (v2 facilitated sessions)

This is the product room model for facilitator-led dialogue. It extends **`sessions` / `session_messages` / dialogue stages** — it is **not** a parallel `rooms` / `room_messages` schema.

Legacy `incident_rooms` tables (if present in older migrations) are a separate experiment and are **not** the pilot spine.

## Mental model

| Concept | Implementation |
|--------|----------------|
| Room | A `sessions` row (`status` + `dialogue_stage`) |
| Feed | `session_messages` (AES-GCM ciphertext when a room key exists) |
| Phase | `dialogue_stage` (`DIALOGUE_STAGES` in `src/lib/dialogueStages.ts`) |
| Deadline | Per-session `phase_budgets` + live `phase_started_at` / `phase_duration_seconds` |
| Hard end | Optional `session_ends_at` (nullable wall-clock) |
| Floor | `floor_holder_participant_id` on `sessions` |
| Audit | `session_audit_events` (timer / floor / recess / tone band — metadata only) |

**Every room can have different deadlines.** Budgets are seeded from the session template (`ngo_deliberation`, `community_mediation`, …) at create time and stored on that session’s `phase_budgets` jsonb. Facilitators may start, pause, or extend the live timer without changing other rooms.

## Phase timer

- Server-authoritative: remaining = `phase_duration_seconds` − elapsed since `phase_started_at` (paused rows freeze remaining in `phase_duration_seconds`).
- Advancing a dialogue stage resets the timer from that session’s budget for the new stage (budget `0` → idle).
- **Timer zero does not auto-advance.** The client/facilitator marks elapsed, posts a system-style “Room note” through the **encrypted** message path, and the facilitator advances manually.
- UI: `PhaseTimer` (neutral / amber &lt;25% / red &lt;10%), reduced-motion safe.

RPCs: `facilitator_start_phase_timer`, `facilitator_extend_phase_timer`, `facilitator_pause_phase_timer`, `facilitator_mark_phase_elapsed`, `facilitator_set_floor`, `facilitator_invoke_recess`.

## Intervention tiers (human-in-the-loop)

1. **Level 1 — private author nudge** — local `analyzeToneLocal` / optional in-browser Transformers. Suggestion stays with the author; optional quiet `tone_signal` on the participant row for the facilitator roster (`HeatIndicator`). No public shame labels.
2. **Level 2 — pacing** — Slow down / Pull back / Power of Pause (`session_room_pacing`).
3. **Level 3 — recess** — `facilitator_invoke_recess` wraps pause + short visible “Pause — 90s” overlay. Facilitator clears pacing when ready.
4. **Level 4 — process** — step back / advance stage, end session, outcome review. Never automated from heat or timer.

There is **no** remote LLM Edge path for tone in this slice.

## Why cues stay private

Heat and tone signals are advisory de-escalation aids. Publishing “heat” to the room would invite performative shame and chill speech. Facilitators see a quiet roster cue; participants see only their own Level 1 suggestion.

## Message status / redaction

`session_messages` bodies are immutable ciphertext (`Update: never`). Draft / submitted / redacted columns are **not** added in this pass — draft UX remains client-local (Review → Confirm send). Redaction of stored ciphertext would need a new audited rewrite path; not shipped here.

## Preview

1. Create a session (default template `ngo_deliberation` seeds longer story/options budgets than `community_mediation`).
2. Verify participants → open control room → **Start session** (advances toward Opening and starts the phase timer from budgets).
3. Watch `PhaseTimer`; use **Pause timer** / **Extend +5 min** with an optional reason (audit).
4. Let a short budget elapse (or temporarily lower `phase_budgets` / start with a small duration) → “Room note” + elapsed banner; advance stage manually.
5. Join as participant via invite token → same docket/feed/timer; private tone nudge on heated draft.

## UI entry points

- Facilitator: `/app/sessions/:sessionId/control` → `RoomShell` + `DeliberationFeed`
- Participant: `/p/room/:token` → same shell, participant composer

See also: [`docs/security/threat-model.md`](security/threat-model.md) §5 (room encryption honesty), `src/lib/phaseTimer.ts`, migration `20260727020256_session_phase_timer_floor.sql`.
