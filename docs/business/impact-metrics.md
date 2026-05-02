# Impact Metrics

## Overview

Measuring the impact of SquadRidge is critical to our mission as a social enterprise. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), our platform is designed to replace conflict-amplifying social networks with trust-building digital infrastructure [1]. Our impact metrics evaluate our success in enabling verified-anonymous, cross-border dialogue and providing secure early warning signals without relying on state surveillance [1].

## Current measurement (MVP)

These are the **small diligence-safe set** aligned with [squadridge-pitch.md](../pitch/squadridge-pitch.md) §6—what you can plausibly cite *today* using Supabase and light process. As of `20260506120000_pilot_metrics_views.sql` they are computable from documented SQL views and surfaced at `/admin/metrics` (moderator-only).

| Metric | Why it matters | How to measure today |
| ------ | -------------- | --------------------- |
| **Time to match** | Queue latency and dropout before match | View `pilot_match_latency_24h` (`20260428270000`) — avg/max match seconds per pool over the last 24h. |
| **Verification success rate** | Semaphore + Edge path vs errors or abandonment | View `pilot_verification_success_rate_30d` — successful verifications and distinct verified users in 30d, derived from `zk_proof_submissions` (production builds reject `VITE_ZK_STUB`). |
| **Active squads / messages (volume)** | Baseline usage signal | `SELECT` counts on `squads`, `messages` for a date range; restrict to non-demo data if you exclude demo squads by convention. |
| **Return rate** | Second session or squad | View `pilot_user_return_rate_30d` — active vs returning users (joined ≥2 squads in 30d). |
| **Power-of-Pause / Pull-back utilization** | UX intervention engagement | View `pilot_intervention_usage_30d` — counts per `interventions.intervention_type`. Surfaces zero rows until the client telemetry hooks publish into the `interventions` table. |
| **Participant report rate** | Safety signal | View `pilot_participant_report_rate_30d` — counts per `reason_code` with open vs closed breakdown. |
| **Moderator hours per squad** | Operator load | View `pilot_moderator_hours_per_squad_30d` — heuristic (distinct hour buckets in which a moderator wrote an audit row about the squad). The heuristic over-counts low-touch squads with frequent short audits and under-counts work that does not write audit rows; treat it as a starting point. |

**Still not claimed as instrumented in-app:** validated AI sentiment shift in user-visible analytics (the CSI ingestion in `csi-ingest-snapshot` consumes facilitator-coded signals and `sentiment_metrics` if populated, but a calibrated user-visible "sentiment shift" KPI requires governance + bias review per [csi-spec.md](../product/csi-spec.md)). Refresh this section when more lands.

## Key Performance Indicators (KPIs)

Our metrics are divided into three primary categories: Platform Engagement, De-escalation Effectiveness, and Early Warning Utility.

### 1. Platform Engagement and Inclusivity

These metrics track the reach and diversity of "The Concerned Citizen" and "The Diaspora Member" participating in our structured dialogue sessions [1].

*   **Active Squads**: The number of active, matched dialogue sessions consisting of four to six participants from opposing sides [1].
*   **Cross-Border Connections**: The volume of interactions occurring across verified geopolitical divides.
*   **Language and Regional Diversity**: The percentage of sessions conducted in non-dominant languages or originating from low-bandwidth regions, addressing the "digital divide" and lack of localization [3].
*   **Verification Rate**: The percentage of users successfully completing **Semaphore-based** zero-knowledge verification (browser proof + `verify-zk-proof` Edge verification) without exposing personally identifiable information (PII) [1]. Future **zkTLS**-style flows are roadmap; they are not the shipped metric until implemented.

### 2. De-escalation Effectiveness

These metrics evaluate the success of our UX interventions and AI-assisted real-time translation and tone detection [1].

*   **"Power of Pause" Utilization**: The frequency with which users engage the one-tap "Slow down" button or the temporary "Pull back" feature to retract messages [1].
*   **Sentiment Shift**: The measured change in aggregated emotional tone within a squad session over time, utilizing AI analytics to track tension levels [1].
*   **Report Rate**: The volume of flagged exchanges or severe escalations requiring moderator intervention, providing a baseline for platform safety [1].

### 3. Early Warning Utility

These metrics assess our contribution to Track II and Track 1.5 diplomacy and our ability to address the "warning-response" problem [1].

*   **Data Commons Contributions**: The volume of aggregated, de-identified sentiment metrics provided to vetted mediators, think tanks, and UN agencies [1].
*   **Actionable Insights**: The number of early warning signals generated by our platform that are successfully integrated into broader forecasting models (e.g., VIEWS or ACLED) [3].
*   **Institutional Adoption**: The number of peacebuilding organizations (e.g., SFCG, Interpeace) actively utilizing our facilitator tools and organizational dashboards [3].

## Ethical Evaluation

We continuously monitor our systems to ensure they adhere strictly to "do no harm" principles [2]. This includes regular audits of our AI algorithms to identify and mitigate biases, ensuring our models do not misrepresent or misclassify conflict narratives from non-Western contexts [3].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
