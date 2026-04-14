# Tech Stack

## Overview

SquadRidge is built upon a modern, highly secure technology stack designed to support verified-anonymous, cross-border dialogue at scale [1]. The architecture is anchored by the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), prioritizing performance, security, and low-bandwidth accessibility [1].

## Frontend Client

The frontend is designed to be responsive, accessible, and performant, ensuring users in active conflict zones with degraded internet infrastructure can participate [3].

*   **Framework**: React
*   **Build Tool**: Vite (for rapid development and optimized production builds)
*   **Language**: TypeScript (for type safety and robust code maintainability)
*   **Styling**: TailwindCSS (for utility-first, accessible, and responsive design) [1]
*   **Typography**: Space Grotesk and DM Sans (utilizing fluid typography via CSS `clamp()`) [1]

## Backend Services

The backend is horizontally scalable to manage real-time messaging, user matching, and AI integration [1].

*   **Runtime**: Node.js [1]
*   **API Framework**: Express or Fastify (REST and WebSockets)
*   **State Management & Caching**: Redis (for ephemeral session state, rate limiting, and matching queues) [1]
*   **Database**: PostgreSQL (via Supabase, utilizing Row Level Security for fine-grained access control) [1]

## Zero-Knowledge Privacy Stack

Security is the cornerstone of SquadRidge, employing advanced cryptographic techniques to protect user identities [1].

*   **Core Protocol**: Enclave[ZK] privacy stack [1]
*   **Proof System**: Semaphore-based zero-knowledge proofs (ZKPs) [1]
*   **Data Extraction**: zkTLS (Zero-Knowledge Transport Layer Security) for privacy-preserving extraction of attributes from secure web sources [2]
*   **Identity Verification**: Mechanisms to cryptographically prove attributes (e.g., citizenship, age) without exposing personally identifiable information (PII) [3]

## AI and Data Pipeline

The platform integrates AI for real-time de-escalation and sentiment analysis, separating these streams from core messaging [1].

*   **Natural Language Processing (NLP)**: Models for real-time translation and tone detection [1]
*   **Sentiment Analysis**: Tools to gauge public mood and polarization, providing aggregated early warning insights [3]
*   **Data Architecture**: A pipeline that strictly separates ephemeral, encrypted messaging streams from aggregated analytics, ensuring graceful degradation if AI services experience downtime [1]

## Infrastructure and Security

The infrastructure is designed to withstand attacks and protect users in high-risk environments [3].

*   **Hosting**: Cloud-native deployment (e.g., AWS, GCP, or specialized secure hosting)
*   **Encryption**: End-to-end encryption for all sensitive exchanges [3]
*   **Data Minimization**: Ephemeral messaging and strict adherence to "do no harm" principles [2]
*   **Accessibility**: UI components built to adhere strictly to WCAG AA accessibility standards [1]

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
