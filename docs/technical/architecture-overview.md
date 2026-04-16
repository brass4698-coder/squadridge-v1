# Architecture Overview

## Introduction

The technical architecture of SquadRidge is designed to support verified-anonymous, cross-border dialogue at scale while ensuring the highest levels of security and privacy [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform separates ephemeral messaging streams from aggregated analytics to protect users in high-risk environments [1]. **Strong message confidentiality from the operator is a target, not fully realized in the MVP store**—see [Security and Resilience](#security-and-resilience) and the [threat model](../security/threat-model.md).

## Core Components

The architecture consists of three primary layers: the frontend client, the backend services, and the zero-knowledge (ZK) privacy stack.

### 1. Frontend Client

The frontend is built using React, Vite, and TypeScript, providing a responsive and accessible user interface [1]. It is designed to operate efficiently in low-bandwidth environments, which is critical for users in active conflict zones with degraded internet infrastructure [3].

*   **Framework**: React (with Vite for fast builds).
*   **Language**: TypeScript for type safety and maintainability.
*   **Styling**: TailwindCSS for the design system, adhering to WCAG AA accessibility standards [1].
*   **State Management**: Optimized for ephemeral data handling to minimize data at risk on the client device [3].

### 2. Backend Services

The backend is a horizontally scalable Node.js application, designed to handle real-time messaging and AI integration [1].

*   **Runtime**: Node.js.
*   **Database**: PostgreSQL (via Supabase) for persistent, non-PII data storage, utilizing Row Level Security (RLS) policies.
*   **Cache/State**: Redis for managing ephemeral session state, rate limiting, and real-time matching queues [1].
*   **API**: A combination of REST endpoints for standard operations and WebSockets for real-time, low-latency messaging.

### 3. Zero-Knowledge Privacy Stack (Enclave[ZK])

Security is anchored by the Enclave[ZK] stack, which employs Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes without storing raw personally identifiable information (PII) from verification in Postgres [1].

*   **Identity verification (shipped):** In-browser Semaphore proving and server verification through the **`verify-zk-proof`** Edge Function; see [`docs/technical/zk-implementation.md`](zk-implementation.md) and [`docs/security/threat-model.md`](../security/threat-model.md) for request shape, `user_id` linkage, and release assumptions.
*   **zkTLS-style extraction (roadmap):** Product materials describe pulling attributes from secure web sources via **zkTLS** [2]. That integration is **not present in this repository** until dedicated client and backend code lands; do not document it as live architecture.
*   **Anonymity**: ZKPs support proving statements about attributes while limiting what raw data the service persists [3]; this is not the same as hiding *all* activity from the operator—see the threat model.
*   **Data separation**: Identity verification storage and messaging tables are separate; message confidentiality from the operator still depends on the encryption model (see below).

## Data Pipeline and AI Integration

The data pipeline separates ephemeral messaging streams from aggregated analytics [1]; encryption posture for stored messages is described under [Security and Resilience](#security-and-resilience). This ensures graceful degradation if the AI translation or sentiment moderation services experience downtime [1].

*   **AI Services**: Integration with AI models for real-time translation and tone detection [1]. These services analyze the text stream to flag rising tension and suggest calmer wording [3].
*   **Analytics**: Aggregated, de-identified sentiment metrics are processed and stored separately to provide early warning insights for vetted mediators and policy analysts [1].

## Security and Resilience

The architecture incorporates best practices for digital safety in conflict zones [3].

*   **Encryption**: **Target:** end-to-end encryption for sensitive exchanges [3]. **Current:** MVP message payloads are structured JSON at rest (`src/lib/messagePayload.ts`); see [`docs/technical/security-privacy.md`](security-privacy.md) and the [threat model](../security/threat-model.md) before claiming E2E to users or partners.
*   **Data Minimization**: Ephemeral messaging and retraction reduce exposure; retention policies should align with [`docs/technical/data-retention-zk.md`](data-retention-zk.md) and the threat model [3].
*   **Resilience**: The horizontally scalable Node.js backend and the use of Redis for state management ensure the platform can handle spikes in traffic during crises.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
