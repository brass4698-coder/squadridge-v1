# API Design

## Overview

The API design for SquadRidge supports verified-anonymous, cross-border dialogue by providing a secure, robust interface for the frontend client and external services [1]. Built on a horizontally scalable Node.js backend using Postgres and Redis, the API handles real-time messaging, zero-knowledge (ZK) attribute verification, and AI-assisted de-escalation [1].

## Architectural Principles

The API follows a RESTful architecture for standard operations and utilizes WebSockets for real-time, low-latency messaging.

### 1. Security and Anonymity

The API is designed to protect users in authoritarian or active conflict zones who face real danger if their identities are exposed [3]. It employs Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes like citizenship or organizational roles without exposing raw personally identifiable information (PII) [1]. All endpoints are secured with HTTPS, and sensitive data is encrypted in transit and at rest [3].

### 2. Ephemerality and Data Minimization

To minimize data at risk, the API supports ephemeral messaging streams [1]. Messages are encrypted and automatically deleted after a session concludes or upon user request (e.g., the "Pull back" feature) [1]. The API separates these streams from aggregated analytics, ensuring graceful degradation if the AI translation or sentiment moderation services experience downtime [1].

### 3. Scalability and Performance

The API is designed to handle spikes in traffic during crises, utilizing Redis for managing ephemeral session state, rate limiting, and real-time matching queues [1]. The horizontally scalable Node.js backend ensures the platform remains responsive and accessible, even in low-bandwidth environments [3].

## Core API Domains

The API is divided into three primary domains: Authentication and Verification, Squad Management and Matching, and Messaging and Interventions.

### 1. Authentication and Verification

This domain handles the generation and verification of ZK proofs, ensuring users can cryptographically prove attributes while keeping their underlying personal data hidden [3].

*   `POST /api/v1/auth/verify-proof`: Submits a Semaphore-based zero-knowledge proof for verification [1].
*   `GET /api/v1/auth/status`: Checks the authentication status of the current user session.
*   `POST /api/v1/auth/logout`: Terminates the user session and clears all ephemeral data.

### 2. Squad Management and Matching

This domain manages the creation, matching, and lifecycle of dialogue sessions, ensuring users are paired with four to six participants from opposing sides [1].

*   `POST /api/v1/squads/match`: Enqueues a user for matching based on their verified attributes [1].
*   `GET /api/v1/squads/{squadId}`: Retrieves the metadata and status of a specific squad session.
*   `POST /api/v1/squads/{squadId}/leave`: Allows a user to securely exit a squad session.

### 3. Messaging and Interventions

This domain handles the real-time, encrypted messaging streams and integrates AI-assisted de-escalation tools [1].

*   `WebSocket /api/v1/ws/squads/{squadId}`: Establishes a real-time connection for sending and receiving encrypted messages.
*   `POST /api/v1/messages/send`: Sends an encrypted message to a squad, triggering AI analysis for tone detection and translation [1].
*   `POST /api/v1/messages/{messageId}/pull-back`: Initiates the temporary "Pull back" feature for immediate message retraction [1].
*   `GET /api/v1/interventions/suggest`: Retrieves AI-generated suggestions for calmer wording when tension is flagged [3].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
