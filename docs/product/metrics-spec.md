# Metrics Specification

This document defines the first metrics that matter for pilot readiness, partner reporting, and investor diligence. These metrics are intentionally operational and conservative. Do not invent impact claims beyond what the product or pilot process can actually measure.

## Principles

- prefer metrics that can be collected now
- distinguish system health from social impact
- define denominators clearly
- keep demo traffic separate from pilot traffic where possible

## Core Metrics

### Signup Or Invite Activation

- Definition: percentage of invited or exposed users who begin onboarding
- Why it matters: indicates whether the entry proposition is understandable and trusted
- Source: landing/onboarding events, invitation logs, or partner rosters

### Verification Completion Rate

- Definition: percentage of users who start verification and complete it successfully
- Why it matters: proves whether the trust layer is usable in practice
- Source: verification events, `zk_proof_submissions`, client error logs

### Time To Match

- Definition: elapsed time from entering the queue or cohort-ready state to squad assignment
- Why it matters: slow matching causes dropout and weakens partner confidence
- Source: `match_queue`, `squads`, cohort assignment records

### Session Entry Success

- Definition: percentage of assigned participants who successfully reach the session room
- Why it matters: this is the minimum threshold between a promising system and a usable one
- Source: session load events, session membership data, facilitator record

### Session Completion Rate

- Definition: percentage of started sessions that complete as designed
- Why it matters: shows operational stability and facilitator viability
- Source: facilitator closeout, session status, moderator notes

### Repeat Participation Rate

- Definition: percentage of participants who join a second session or indicate intent to return
- Why it matters: early proxy for trust and usefulness
- Source: `squad_members`, follow-up survey, repeat invite acceptance

### Incident Rate

- Definition: number of incidents per session or cohort, tagged by severity
- Why it matters: safety and partner trust are core to the product thesis
- Source: incident log, moderator actions, facilitator notes

### Facilitator Satisfaction

- Definition: facilitator rating of session usability, control, and trustworthiness
- Why it matters: facilitator adoption is likely the fastest wedge to institutional credibility
- Source: post-session facilitator survey

### Participant Usefulness Score

- Definition: participant rating of whether the session felt constructive, safe, and worth repeating
- Why it matters: closest near-term proxy to real user value
- Source: post-session participant survey

## Stretch Metrics

Treat these as pilot-phase research metrics unless instrumentation is clearly live:

- tone shift over time
- moderation workload per participant
- average time to intervention
- proposal or ledger publication rate
- partner renewal or expansion intent

## Measurement Notes

- keep pilot and demo data separate
- annotate whether data came from product telemetry, SQL, facilitator notes, or surveys
- use exact date windows in partner and investor reporting
- never present anecdotal outcomes as generalized peace impact

## Reporting Cadence

Recommended cadence for early pilots:

- after each session: operational summary
- weekly during pilot: health and incident summary
- end of pilot: concise results memo with caveats
