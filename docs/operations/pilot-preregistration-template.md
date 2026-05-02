# Pilot Pre-Registration

A pre-registration block locks the success thresholds, abort criteria, and reporting cadence for one cohort **before** participants are onboarded. Filling it in is a precondition for the pilot's first session, not a closeout artifact. Pre-registration prevents post-hoc cherry-picking of the metrics that "worked" and gives the partner a clear contract for what success means.

> **Companion docs:** [`docs/product/metrics-spec.md`](../product/metrics-spec.md) defines the metric taxonomy. [`docs/business/impact-metrics.md`](../business/impact-metrics.md) ties metrics to the long-term mission and to the existing `pilot_*` views. The post-session survey instrument that produces the participant- and facilitator-derived metrics is in [`post-session-survey-instrument.md`](./post-session-survey-instrument.md). Named contacts are in [`pilot-owners.md`](./pilot-owners.md).

## How to use this file

1. Before each pilot, copy the **template** below into a fresh dated subsection (mirroring the [`pilot-owners.md`](./pilot-owners.md) flow).
2. Fill in **every** field. If a field is intentionally not measured, write `not measured — <one-sentence reason>` instead of leaving it blank.
3. Have the product owner, technical owner, and facilitator owner all sign the block before the first session.
4. Keep prior pilot blocks for audit history; do not delete them. Mark closed pilots `Status: closed` and add closeout pointers.
5. When a pre-registered threshold is missed, document the reason in the closeout memo. Missing a pre-registered threshold is a learning event, not a reason to retroactively edit the threshold.

## Required fields

Every pre-registration block must capture:

- **Cohort identifier** — the `invite_codes.cohort_key` that ties this cohort's invitations to its participants. The schema lives in [`supabase/migrations/20260501075031_invite_access_control.sql`](../../supabase/migrations/20260501075031_invite_access_control.sql) (`cohort_key TEXT`). One cohort key per pilot block. If a partner runs two cohorts in parallel, write two blocks.
- **Hypothesis** — one or two sentences describing what success would tell you. Not "we expect everyone to love it"; something falsifiable like "verified-anonymous structure produces lower facilitator-rated escalation than the partner's prior video-call format for cohorts of N=8."
- **Pre-declared denominators** — invited / verification-eligible / matched. Without explicit denominators, every percentage downstream is meaningless.
- **Pre-declared success thresholds** for each metric in [`metrics-spec.md`](../product/metrics-spec.md). Operator fills the numeric target; guidance ranges are in the template comments.
- **Pre-declared abort criteria** — quantitative thresholds for the conditions in [`pilot-runbook.md`](./pilot-runbook.md) § "Abort Criteria". E.g. "verification failure rate > 30% in any 24h window" rather than "lots of failures".
- **Reporting dates** — when the per-session, weekly, and end-of-pilot memos go out, and to whom.
- **Survey staging confirmation** — that the participant and facilitator survey instruments from [`post-session-survey-instrument.md`](./post-session-survey-instrument.md) are staged in the chosen tool (paper, Tally, Typeform) with `cohort_key` pre-filled and the privacy guardrails applied.
- **Sign-off** — product owner, technical owner, and facilitator owner names + date.

## Template (copy for each pilot)

```
### Pilot <YYYY-MM-DD> — <partner / cohort name>

Status: planned | active | closed
Cohort key (matches invite_codes.cohort_key): <cohort_key>
Partner organisation: <name>
Pilot window: <start UTC>  ->  <end UTC>
Number of sessions planned: <N>

Hypothesis
  <1–2 sentences. Falsifiable. What would success tell us that we don't
  already know? Example: "Verified-anonymous structure with a facilitator
  produces a higher participant-rated safety score for cohorts of 6–10
  cross-border participants than the partner's prior video-call format,
  measured by P3 (Block 1 of post-session-survey-instrument.md)."

Pre-declared denominators
  Invited (count of invite_codes issued for this cohort_key):  <N>
  Verification-eligible (invited and onboarded to the verify step): <N>
  Matched (assigned to a squad for at least one session):            <N>

Pre-declared success thresholds
  Metrics-spec source: docs/product/metrics-spec.md

  - Verification Completion Rate
      target: >= <X>%   (guidance: pilots with eligible cohorts have
                         seen 60–85% in early runs; lower targets are
                         fine if the cohort is selected for a high-bar
                         credential)
      denominator: verification-eligible above

  - Time To Match (median across the cohort)
      target: <= <Y> minutes   (guidance: under 5 min for cohorts under
                                30 participants; cohort-side scheduling
                                drives the upper bound)
      source: pilot_match_latency_24h view

  - Session Entry Success
      target: >= <Z>%   (guidance: target >= 90% on a tested
                         environment; record env / network constraints
                         that change this)
      denominator: matched above

  - Session Completion Rate
      target: >= <W>%   (guidance: facilitator-set; depends on session
                         length and abort posture)
      source: facilitator closeout per session

  - Repeat Participation Rate
      target: >= <V>%   (guidance: early pilots see 30–60%; partner-side
                         scheduling can be a confounder)
      source: squad_members + survey item P2

  - Participant Usefulness Score (P1)
      target: median >= <U> on a 1–5 Likert
      source: post-session participant survey, item P1

  - Participant Safety Perception (P3)
      target: median >= <S> on a 1–5 Likert
      source: post-session participant survey, item P3

  - Facilitator Satisfaction (F1)
      target: median >= <T> on a 1–5 Likert
      source: post-session facilitator survey, item F1

  - Incident Rate
      target: 0 SEV-0; <= <K> SEV-1 across the pilot window
      source: incident log + participant_reports + crisis_alerts

  - Stretch metrics actively measured this pilot
      <name and source — or "none" — for each. Default: none.>

Pre-declared abort criteria (quantitative)
  Mirrors pilot-runbook.md § Abort Criteria but with thresholds.

  - Verification failure rate > <X>% in any 24h window during the pilot
    window -> pause until root cause identified.
  - SEV-0 incident -> stop, do not resume without partner-facing
    communication and a written go-decision from the incident lead.
  - Repeated session-entry failures (>3 distinct participants in one
    session window) -> pause that session; investigate before next.
  - Moderator decrypt count above the pilot_decrypt_audit_24h alert
    threshold (>25 in any hour, or >10 distinct squads in any hour)
    -> incident lead investigates before next session.
  - Partner or facilitator withdraws confidence in writing -> stop.

Reporting dates and recipients
  Per-session memo:    <within X hours of session end>; sent to <recipients>
  Weekly memo:         <day of week, UTC>; sent to <recipients>
  Closeout memo:       <within X days of pilot end>; sent to <recipients>

Survey staging confirmation
  - [ ] Participant survey staged in <tool> with cohort_key pre-filled
        and click-tracking / response metadata disabled.
  - [ ] Facilitator survey staged in <tool> with cohort_key pre-filled.
  - [ ] CSV column spec from post-session-survey-instrument.md
        validated against the staged tool's export format.

Sign-off
  Product owner:     <name>          Date: <YYYY-MM-DD>
  Technical owner:   <name>          Date: <YYYY-MM-DD>
  Facilitator owner: <name>          Date: <YYYY-MM-DD>

Closeout pointers (fill at pilot end)
  Closeout memo: <link or path>
  Survey export (raw CSV): <link or path>
  Incident summary: <link or path>
  Threshold misses (with reasons): <list or "none">
```

## Anti-patterns

- **Editing thresholds after data starts arriving.** If a threshold turns out to be wrong for the cohort, document it in the closeout memo and use the corrected threshold for the next pilot. Do not edit history.
- **Skipping fields because the answer feels obvious.** Write the obvious answer down. The point of pre-registration is to reduce ambiguity for the next reader, not the current author.
- **Counting demo traffic in pilot denominators.** Demo squads (`create_demo_squad` flow) and pilot squads must be counted separately. The `cohort_key` discipline is what makes that separation reliable.
- **Letting an unfilled survey staging checkbox slide.** If the survey is not staged before the first session, the first session's evidence is gone — there is no retroactive way to capture P1–P7 / F1–F6 from a session that already happened.

## See also

- [`pilot-runbook.md`](./pilot-runbook.md) — pre-pilot, in-pilot, abort, closeout flow.
- [`pilot-owners.md`](./pilot-owners.md) — named contacts for the active pilot window.
- [`post-session-survey-instrument.md`](./post-session-survey-instrument.md) — paired survey instrument that produces P-codes and F-codes referenced above.
- [`production-checklist.md`](./production-checklist.md) — environment posture before the pilot starts.
- [`evidence-collection.md`](./evidence-collection.md) — where filled-in pre-registration blocks land in the pilot evidence pack.
