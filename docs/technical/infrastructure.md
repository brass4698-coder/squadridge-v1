# Infrastructure

## Overview

The infrastructure of SquadRidge is designed to support verified-anonymous, cross-border dialogue at scale while ensuring the highest levels of security, privacy, and resilience [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform separates ephemeral, encrypted messaging streams from aggregated analytics to protect users in high-risk environments [1].

## Cloud-Native Deployment

**Production shape in this repository:** a static **frontend** (Vite build) plus a **Supabase project** (hosted by Supabase). The database, Auth, Realtime, and Edge Functions run on Supabase’s platform; there is **no first-party Node.js API fleet or Redis cluster** required for the app as implemented here. Spikes and crisis-time load are handled in practice by **Supabase/Postgres capacity**, connection hygiene, and monitoring—not by a custom horizontal Node tier [1][3].

### 1. High Availability and Scalability

Real-time features use **Supabase Realtime** (WebSockets) over Postgres change feeds, not a bespoke WebSocket service in this repo. Matching uses **Postgres RPCs** and tables (`matchmaking_*`). The client is designed to work in **low-bandwidth** environments [3]; resilience is a combination of edge-cached static assets, efficient queries, and provider SLAs.

### 2. State and queues

**Queues and session state** for matching live in **PostgreSQL** (with RLS), not Redis. Optional **Redis** in `docker-compose.yml` is for **local experiments** (e.g. future workers) and is **not** part of the documented production path. Rate limiting at scale belongs at the edge or in dedicated workers if added later—see [`tech-stack.md`](tech-stack.md).

### 3. Data Separation and Ephemerality

The data pipeline strictly separates ephemeral, encrypted messaging streams from aggregated analytics [1]. This ensures graceful degradation if the AI translation or sentiment moderation services experience downtime [1].

## Security and Privacy

The infrastructure incorporates best practices for digital safety in conflict zones, including threat-aware planning, strong encryption, and disciplined operational security [3].

### 1. Verified Anonymity via Zero-Knowledge Proofs

Security is anchored by the Enclave[ZK] stack, which employs Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes without exposing raw personally identifiable information (PII) [1].

### 2. End-to-End Encryption and Ephemerality

To minimize data at risk, SquadRidge employs end-to-end encryption for all sensitive exchanges [3]. Messages are designed for ephemerality; they are automatically deleted after a session concludes or upon user request [1].

### 3. "Do No Harm" Data Architecture

The infrastructure implements "do no harm" principles from the design phase, ensuring that the data serves community needs without extractive practices [2]. The platform aggregates de-identified sentiment metrics to provide early warning insights, strictly separated from the ephemeral messaging streams [1].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
