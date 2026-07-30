# AI Pipeline

## Overview

The AI pipeline in MENDguild is designed to integrate advanced natural language processing (NLP) and sentiment analysis models into the platform's real-time messaging streams [1]. This architecture ensures that AI-assisted de-escalation tools and aggregated early warning signals operate securely and efficiently [1].

## Current implementation (codebase)

- **Translation (core UX)** — Incoming messages can be translated in the browser via a dedicated Web Worker and Transformers.js (`src/hooks/useTranslation.ts`, `src/workers/translation.worker.ts`). This path does **not** require `VITE_ENABLE_AI` and does not call a custom AI backend today.
- **De-escalation (core UX)** — “Slow down,” “Pull back,” and intervention logging use local UI state and Supabase tables such as `interventions`; they are not gated by `VITE_ENABLE_AI`.
- **`VITE_ENABLE_AI`** — Only enables optional persistence of a **client-side** tone heuristic to the `sentiment_metrics` table (`recordLocalToneAndMaybePersist` in `src/lib/ai/pipeline.ts`). A future remote model or Edge Function would be an additional layer, not a prerequisite for translation or in-room de-escalation.
- **`VITE_ENABLE_REMOTE_TONE`** — When `true`, `fetchRemoteToneInsight` in `src/lib/ai/pipeline.ts` may call a remote/Edge path in the future; until wired it returns `null` and the local heuristic is used when `VITE_ENABLE_AI` persists metrics.

## AI Integration Strategy

MENDguild uniquely combines zero-knowledge attribute verification, structured small-group matching, and AI-driven de-escalation into a single peace-tech infrastructure [1]. The AI pipeline strictly separates ephemeral, encrypted messaging streams from aggregated analytics, ensuring graceful degradation if the AI translation or sentiment moderation services experience downtime [1].

### 1. Real-Time Translation and Tone Detection

The AI pipeline integrates models for real-time translation and tone detection to intervene during escalations [1]. These tools gently suggest calmer wording and slow down hostile exchanges, embodying the "Power of Pause" essential for collective wellbeing [2].

*   **Mechanism**: The AI system listens to written exchanges, flags rising tension, and provides real-time feedback [3].
*   **Implementation**: Features include a one-tap "Slow down" button to pause sending and a temporary "Pull back" feature for immediate message retraction [1].

### 2. Aggregated Sentiment Analysis

To support wider Track II diplomacy efforts, the system aggregates de-identified sentiment metrics [1]. These insights provide early warning signals for vetted mediators, think tanks, and UN agencies, addressing the "warning-response" problem [2].

*   **Mechanism**: Sentiment analysis tools gauge public mood and polarization, tracking shifts in popular support or fear [3].
*   **Implementation**: The data pipeline processes and stores these metrics separately from the core messaging streams, ensuring user privacy is maintained while providing valuable intelligence [1].

## Security and Privacy

The AI pipeline incorporates "do no harm" principles from the design phase, ensuring that the data infrastructure serves community needs without extractive practices [2].

The platform's architecture ensures that even if the analytics database is compromised, the raw dialogue and user identities remain secure, as the AI analysis only aggregates anonymized data [1].

## References

[1] MENDguild Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
