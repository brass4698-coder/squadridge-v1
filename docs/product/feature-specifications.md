# Feature Specifications

## Overview

SquadRidge uniquely combines zero-knowledge attribute verification, structured small-group matching, and AI-driven de-escalation into a single peace-tech infrastructure [1]. This document outlines the core features that enable verified-anonymous, cross-border dialogue.

## 1. Zero-Knowledge Attribute Verification

Security is anchored by the Enclave[ZK] stack, employing Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes [1]. This system allows citizens to cryptographically prove attributes like citizenship, age, or organizational roles without storing raw personally identifiable information (PII) from verification in Postgres [3].

*   **Mechanism (shipped)**: In-browser Semaphore proofs and server verification via the **`verify-zk-proof`** Edge Function; engineering detail in [`docs/technical/zk-implementation.md`](../technical/zk-implementation.md).
*   **Mechanism (roadmap)**: Research materials describe privacy-preserving proofs from secure web sources via **zkTLS** [2]. That flow is **not** in the repository today—do not specify it in delivery timelines until implemented.
*   **Purpose**: Participants in authoritarian or active conflict zones need proportionate safety; see [`docs/security/threat-model.md`](../security/threat-model.md) for honest operator-visible metadata [1].
*   **Implementation**: Users prove group membership for configured scopes; the service still stores `user_id` with verification outcomes—see threat model and zk docs [3].

## 2. Structured Small-Group Matching

The platform matches small groups from opposing perspectives into time-bound dialogue sessions [1]. Product vision ties matching to verified signals; **current implementation** includes pool-based matchmaking RPCs in Postgres (see [`supabase/migrations/20260416164823_matchmaking_queue.sql`](../../supabase/migrations/20260416164823_matchmaking_queue.sql), [`src/lib/matchmakingPoolKey.ts`](../../src/lib/matchmakingPoolKey.ts)).

*   **Mechanism**: Matching uses intent pools and sides (A/B); anonymity here means **pseudonymous accounts** and RLS between clients—not invisibility from the operator—see the [threat model](../security/threat-model.md).
*   **Purpose**: This intimate setting fosters deeper connection and understanding, moving away from the chaotic environment of traditional social media that amplifies outrage [1].
*   **Implementation**: In-room prompts guide structured dialogue; squad size and flows may be tuned per product [1].

## 3. AI-Assisted De-escalation

SquadRidge integrates AI-assisted real-time translation and tone detection to intervene during escalations [1].

*   **Mechanism**: The AI system listens to written exchanges, flags rising tension, and gently suggests calmer wording [3].
*   **Purpose**: This embodies the "Power of Pause," slowing down hostile exchanges and allowing for reflection [2].
*   **Implementation**: Features include a one-tap "Slow down" button to pause sending and a temporary "Pull back" feature for immediate message retraction [1].

## 4. Secure Early Warning Signals

To support wider Track II diplomacy efforts, the system aggregates de-identified sentiment metrics to provide early warning insights [1].

*   **Mechanism**: The data pipeline separates ephemeral messaging streams from aggregated analytics [1]; encryption of stored dialogue from the operator is **target** architecture—see [`docs/technical/security-privacy.md`](../technical/security-privacy.md).
*   **Purpose**: This addresses the "warning-response" problem by providing vetted mediators, think tanks, and UN agencies with real-time insights into rising regional tensions [1].
*   **Implementation**: Sentiment analysis tools gauge public mood and polarization, helping policymakers spot rising tensions before violence spreads [3].

## 5. Low-Bandwidth Mode

Recognizing the "digital divide," SquadRidge is designed to support low-bandwidth environments [3].

*   **Mechanism**: The platform minimizes data transfer and prioritizes text-based communication.
*   **Purpose**: Many active conflict zones have severely degraded internet infrastructure; this feature ensures inclusivity [3].
*   **Implementation**: The architecture allows for graceful degradation if AI translation or sentiment moderation services experience downtime [1].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
