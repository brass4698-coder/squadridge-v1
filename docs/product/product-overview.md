# Product Overview

## Introduction

SquadRidge is a verified-anonymous, cross-border dialogue platform designed to prevent conflict by securely connecting small groups of citizens across geopolitical divides [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform's core mission is to enable small, verified-anonymous squads to build bridges safely and at scale [1]. By prioritizing structured dialogue over public broadcasting, SquadRidge aims to de-escalate geopolitical tensions while providing secure early warning signals without relying on state surveillance [1].

## Core Mechanics

The platform utilizes zero-knowledge cryptography to match four to six participants from opposing sides of a conflict into secure, time-bound dialogue sessions [1]. This ensures that users can connect across conflict lines without fear of state retaliation, while peace practitioners can run structured sessions safely [1].

### Key Features

1.  **Zero-Knowledge Attribute Verification**: We employ Semaphore-based zero-knowledge proofs to verify user attributes like citizenship or organizational roles without exposing raw personally identifiable information (PII) [1]. This is a critical feature, as participants in authoritarian or active conflict zones face real danger if their identities are exposed [3].
2.  **Structured Small-Group Matching**: Users are matched into squads of four to six individuals from opposing sides of a conflict [1]. This intimate setting fosters deeper connection and understanding compared to the chaotic environment of traditional social media.
3.  **AI-Assisted De-escalation**: The platform integrates AI-assisted real-time translation and tone detection to intervene during escalations [1]. It gently suggests calmer wording and slows down hostile exchanges, embodying the "Power of Pause" essential for collective wellbeing [2].
4.  **Secure Early Warning Signals**: To support wider Track II diplomacy efforts, the system aggregates de-identified sentiment metrics [1]. These insights are provided to vetted mediators, think tanks, and UN agencies, addressing the "warning-response" problem identified in the peace-tech ecosystem [2].

## The UX Paradigm

The onboarding flow prioritizes norm-setting by clearly explaining the platform's non-violence principles and the mechanics of verified anonymity [1]. UX copy emphasizes safety and reflection, utilizing interventions like a one-tap "Slow down" button to pause sending and a temporary "Pull back" feature for immediate message retraction [1]. In-room prompts actively guide users through structured digital dialogue frameworks, such as exploring mutual fears and shared goals, to foster sustained empathy [1].

## Architecture and Scalability

The product is delivered as a **React + Vite + TypeScript** web client on a **Supabase backend-as-a-service** stack: managed PostgreSQL (with Row Level Security), Auth, Realtime, PostgREST-style access via `supabase-js`, and **Supabase Edge Functions** (Deno) for verification and other server-side steps. There is **no separate Node.js application server or Redis layer in the shipped product path** documented in this repository; matchmaking and messaging use Postgres and Realtime. Security is anchored by the Enclave[ZK] stack [1]. The data pipeline separates messaging from aggregated analytics where implemented; see [`docs/technical/architecture-overview.md`](../technical/architecture-overview.md) for the engineering-accurate picture.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
