# Post-Session Survey Instrument

Two complete questionnaires — one for participants, one for facilitators — designed to be administered on paper or in any anonymous form tool (Tally, Typeform, Google Forms, KoboToolbox). Question codes (`P1`–`P7`, `F1`–`F6`) are stable identifiers; the **CSV column spec** at the bottom defines the export shape so cohort results can be aggregated regardless of which tool collected them.

> **Companion docs:** [`pilot-preregistration-template.md`](./pilot-preregistration-template.md) sets the cohort-specific success thresholds the medians of these items are compared against. [`docs/product/metrics-spec.md`](../product/metrics-spec.md) defines the metric taxonomy each item maps to.

---

## Privacy guardrails (apply before staging the form)

These are **not** optional. They are the difference between an anonymous instrument and a re-identifiable one.

- **No PII fields.** Do not ask for name, email, phone, organisation role, or location. The participant's identity is already known to the facilitator and the partner; the survey does not need to re-collect it.
- **No IP capture.** In Tally / Typeform / Google Forms / KoboToolbox, **disable** any "collect IP address" or "respondent metadata" setting. The application's own posture is no IP storage ([`docs/operations/ip-logging.md`](./ip-logging.md)); the survey instrument must not undo that.
- **No click-tracking on email distribution.** If the participant survey link is sent by email, the email tool must have click-tracking off; otherwise the click event correlates respondent IP with cohort.
- **Anonymous submission mode on.** Use the tool's "anonymous" or "no respondent identification" mode. The `cohort_key` and `session_id_or_squad_id` should be **pre-filled** by the survey link, not requested from the respondent.
- **Free-text instructions.** Every free-text item displays the line: *"Do not include names, locations, or any detail that could identify a participant."* Reviewers redact during ingestion if a respondent does include identifying detail.
- **Retention.** The raw CSV export is filed in the pilot evidence pack ([`docs/operations/evidence-collection.md`](./evidence-collection.md)); the survey-tool-side responses are deleted after export per partner agreement (default: within 30 days of pilot closeout).

---

## Block 1 — Participant survey

**When:** within 24 hours of the session ending. Earlier is better.
**How long:** ~3 minutes. Seven items.
**Mode:** anonymous. Pre-filled `cohort_key` and `session_id_or_squad_id`. No PII.

Introduce the survey with this exact text:

> Thank you for the session. Seven short questions about how it felt. Your answers are anonymous — we do not collect your name, email, or IP. Free-text answers are reviewed by the facilitator and a SquadRidge moderator; please do not include names, locations, or any detail that could identify a participant.

### P1 — Usefulness *(maps to Participant Usefulness Score)*

> The session felt constructive and worth my time.

Likert 1–5: `1 Strongly disagree`, `2 Disagree`, `3 Neutral`, `4 Agree`, `5 Strongly agree`.

### P2 — Repeat intent *(maps to Repeat Participation Rate)*

> If invited, would you take part in another session in this cohort?

Single choice: `Yes`, `Maybe`, `No`.

### P3 — Safety perception

> I felt safe taking part in this session.

Likert 1–5 as P1.

> **Important.** P3 measures **felt safety**, which is distinct from `participant_reports` (which records action — a participant filing a report). Both signals matter; P3 catches the participant who felt unsafe but did not file. Pair P3 with the `participant_reports` count for the same `squad_id` when reading.

### P4 — Facilitator effectiveness

> The facilitator helped the conversation stay productive.

Likert 1–5 as P1.

### P5 — What worked *(free text)*

> What worked well in this session? *(Do not include names, locations, or any detail that could identify a participant.)*

Free text, max 600 characters.

### P6 — What to change *(free text)*

> What would you change about how this session was run? *(Do not include names, locations, or any detail that could identify a participant.)*

Free text, max 600 characters.

### P7 — Community uptake *(qualitative impact proxy)*

> Would you bring this format to your community / colleagues / programme?

Single choice: `Yes — already considering`, `Maybe — depends on details`, `No — not a fit`.

---

## Block 2 — Facilitator survey

**When:** within 24 hours of the session ending. Same window as participants.
**How long:** ~5 minutes. Six items.
**Mode:** identified-by-role (facilitator name is acceptable here — the facilitator is a named role, not an anonymous participant). `cohort_key` and `session_id_or_squad_id` pre-filled.

Introduce with:

> Six questions about how the session ran from the facilitator side. This survey is for facilitators only and is read by the SquadRidge product and moderation owners as part of the pilot evidence pack.

### F1 — Tooling usability *(maps to Facilitator Satisfaction)*

> The facilitator surfaces (matchmaking, session chrome, moderation tools) made it easier — not harder — to run this session.

Likert 1–5 as P1.

### F2 — Incidents and near-misses *(free text)*

> Any incidents, near-misses, or moments where you considered pausing the session? Reference participants by squad ID or callsign only — never by name. If a participant filed a report, reference the `participant_reports.id`.

Free text, max 1200 characters.

### F3 — Moderation surface adequacy

> The moderation surfaces were sufficient to act on what came up.

Likert 1–5 as P1. Add a follow-up:

> If you answered 1 or 2, what was missing? *(free text, max 400 chars)*

### F4 — Preparation cost *(operational signal)*

> Roughly how many minutes of preparation did this session take you, end-to-end (briefing, setup, cohort comms, post-session notes)?

Numeric, integer minutes. Optional follow-up: "What drove the time?" *(free text, max 400 chars)*

### F5 — What worked *(free text)*

> What worked well in this session that you'd repeat?

Free text, max 800 characters.

### F6 — What to change before next session *(free text)*

> What would you want changed — in the product, the runbook, or the cohort design — before the next session?

Free text, max 800 characters.

---

## CSV column spec (export shape)

Both surveys export to a CSV that the operator can grep / aggregate without re-engineering the source tool. Columns are stable; tools are not.

### Common columns (every row, both surveys)

| Column | Type | Notes |
| --- | --- | --- |
| `survey_kind` | enum: `participant` \| `facilitator` | Which instrument produced the row. |
| `cohort_key` | text | Pre-filled from the invite link / facilitator dashboard. Matches `invite_codes.cohort_key`. |
| `session_id_or_squad_id` | text (UUID acceptable) | The session this response is about. Squad ID is fine when there is no separate session record. |
| `submitted_at_utc` | ISO 8601 timestamp | Survey-tool submission time. Not the session time. |
| `cohort_window` | text | E.g. `2026-05-01..2026-05-15`. Pre-filled. |

### Participant survey columns

| Column | Item | Type |
| --- | --- | --- |
| `P1_usefulness` | Usefulness | int 1–5 |
| `P2_repeat_intent` | Repeat intent | enum: `yes` \| `maybe` \| `no` |
| `P3_safety` | Safety perception | int 1–5 |
| `P4_facilitator` | Facilitator effectiveness | int 1–5 |
| `P5_worked` | What worked | text (≤ 600) |
| `P6_change` | What to change | text (≤ 600) |
| `P7_community_uptake` | Community uptake | enum: `yes_considering` \| `maybe_depends` \| `no_not_fit` |

### Facilitator survey columns

| Column | Item | Type |
| --- | --- | --- |
| `F1_tooling` | Tooling usability | int 1–5 |
| `F2_incidents` | Incidents and near-misses | text (≤ 1200) |
| `F3_moderation` | Moderation surface adequacy | int 1–5 |
| `F3_missing` | Follow-up if F3 ≤ 2 | text (≤ 400) or empty |
| `F4_prep_minutes` | Prep minutes | int |
| `F4_prep_drivers` | Prep drivers | text (≤ 400) or empty |
| `F5_worked` | What worked | text (≤ 800) |
| `F6_change` | What to change | text (≤ 800) |

### Aggregation hints

- **Per-cohort medians for P1, P3, F1**: compare against thresholds set in [`pilot-preregistration-template.md`](./pilot-preregistration-template.md).
- **Repeat-intent denominator**: P2's `yes + maybe` count over total respondents is the survey-side input to Repeat Participation Rate; pair with `squad_members` membership data for the actual return rate.
- **Free-text review**: P5 / P6 / F2 / F5 / F6 are reviewed by the moderation owner before the closeout memo. Redactions for any inadvertent identifying detail are made on the export, with a `_redacted` suffix on the column for the row.

---

## Future work (out of scope of this instrument)

- **A `session_feedback` table** would let pre-registration thresholds be evaluated by SQL alongside the existing `pilot_*` views. The CSV column spec above is the schema sketch for that future migration. Not built today; this instrument is paper / external-tool only by design (see scoping decision in the originating pre-registration discussion).
- **Auto-export to the pilot evidence pack** would remove the operator step of downloading CSV and filing it. Requires the table above to exist first.
- **Per-question phrasing iteration** is fine between pilots, but **changing a question code** (`P1`..`F6`) breaks cross-pilot comparability. If a phrasing change is significant enough to invalidate a code, allocate a new one (`P1b`) rather than reusing the old one.

## See also

- [`docs/product/metrics-spec.md`](../product/metrics-spec.md) — metric taxonomy this instrument feeds.
- [`docs/business/impact-metrics.md`](../business/impact-metrics.md) — how these metrics map to the long-term mission and to existing `pilot_*` views.
- [`pilot-preregistration-template.md`](./pilot-preregistration-template.md) — paired pre-registration block with success thresholds for P-codes and F-codes.
- [`evidence-collection.md`](./evidence-collection.md) — where the raw CSV export lands at pilot closeout.
- [`pilot-runbook.md`](./pilot-runbook.md) § "After Each Session" — facilitator-side capture flow this instrument supports.
