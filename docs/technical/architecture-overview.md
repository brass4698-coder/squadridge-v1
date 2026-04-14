# Architecture Overview

## Introduction

The technical architecture of SquadRidge is designed to support verified-anonymous, cross-border dialogue at scale while ensuring the highest levels of security and privacy [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform separates ephemeral, encrypted messaging streams from aggregated analytics to protect users in high-risk environments [1].

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

Security is anchored by the Enclave[ZK] stack, which employs Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes without exposing raw personally identifiable information (PII) [1].

*   **Identity Verification**: Users generate privacy-preserving proofs from secure web sources (e.g., legal identity, education records) via zkTLS [2].
*   **Anonymity**: ZKPs allow citizens to cryptographically prove attributes (e.g., citizenship, age) while keeping the underlying personal data hidden [3].
*   **Data Separation**: The architecture strictly separates the identity verification layer from the messaging layer.

## Data Pipeline and AI Integration

The data pipeline separates ephemeral, encrypted messaging streams from aggregated analytics [1]. This ensures graceful degradation if the AI translation or sentiment moderation services experience downtime [1].

*   **AI Services**: Integration with AI models for real-time translation and tone detection [1]. These services analyze the text stream to flag rising tension and suggest calmer wording [3].
*   **Analytics**: Aggregated, de-identified sentiment metrics are processed and stored separately to provide early warning insights for vetted mediators and policy analysts [1].

## Security and Resilience

The architecture incorporates best practices for digital safety in conflict zones [3].

*   **Encryption**: End-to-end encryption for all sensitive exchanges [3].
*   **Data Minimization**: Ephemeral messaging ensures that data is not stored longer than necessary, minimizing the risk of exposure if a device is seized or a server is compromised [3].
*   **Resilience**: The horizontally scalable Node.js backend and the use of Redis for state management ensure the platform can handle spikes in traffic during crises.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
