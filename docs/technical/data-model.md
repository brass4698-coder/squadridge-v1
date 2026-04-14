# Data Model

## Overview

The data model for SquadRidge is designed to enforce verified anonymity, support real-time structured dialogue, and generate aggregated early warning signals without compromising user privacy [1]. Built on PostgreSQL via Supabase, the schema heavily utilizes Row Level Security (RLS) and strict data minimization principles to protect participants in high-risk environments [3].

## Core Entities

The data model is divided into three primary domains: Identity and Verification, Dialogue Sessions, and Analytics and Moderation.

### 1. Identity and Verification

This domain manages user access and zero-knowledge (ZK) proofs, ensuring that personally identifiable information (PII) is never stored directly in the database [1].

*   **Users**: A minimal table containing a hashed identifier (e.g., a decentralized identifier or DID) and account status. No names, emails, or phone numbers are stored.
*   **ZK_Proofs**: Stores the Semaphore-based zero-knowledge proofs submitted by users [1]. These proofs cryptographically verify attributes like citizenship or organizational role without revealing the underlying data [3].
*   **Verified_Attributes**: A table linking a user's DID to specific, verified attributes (e.g., "Verified Citizen of Region A") derived from the ZK proofs. This is used exclusively for matching and access control.

### 2. Dialogue Sessions

This domain handles the ephemeral, encrypted messaging streams and the matching of users into small squads [1].

*   **Squads**: Represents a time-bound dialogue session. It contains metadata such as the session topic, creation time, status (active, completed, flagged), and the required attributes for participants.
*   **Squad_Members**: A junction table linking users (via DID) to a specific squad. This table enforces the rule that squads consist of four to six participants from opposing sides [1].
*   **Messages**: Stores the encrypted text of the dialogue. Crucially, this table is designed for ephemerality. Messages are automatically deleted after a session concludes or upon user request (e.g., the "Pull back" feature) [1].

### 3. Analytics and Moderation

This domain aggregates de-identified sentiment metrics and manages AI interventions, separating these streams from core messaging [1].

*   **Sentiment_Metrics**: Stores aggregated, anonymized data derived from the AI analysis of dialogue sessions. This includes tone, tension levels, and key themes, providing early warning insights for vetted analysts [1].
*   **Interventions**: Logs instances where the AI-assisted de-escalation tools (e.g., the "Slow down" prompt) were triggered [1]. This data is used to improve the AI models and track the effectiveness of interventions, without linking back to specific users or messages.
*   **Reports**: A table for users to flag inappropriate behavior or severe escalations. Reports are anonymized and reviewed by moderators to ensure the safety of the platform.

## Data Pipeline and Security

The data pipeline strictly separates ephemeral, encrypted messaging streams from aggregated analytics [1]. This ensures that even if the analytics database is compromised, the raw dialogue and user identities remain secure. The use of Supabase's Row Level Security (RLS) ensures that users can only access data relevant to their active sessions, further mitigating the risk of unauthorized access.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
