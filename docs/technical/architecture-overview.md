# Architecture Overview

## Introduction

The technical architecture of MENDguild is designed to support verified-anonymous, cross-border dialogue at scale while ensuring the highest levels of security and privacy [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform separates ephemeral messaging streams from aggregated analytics to protect users in high-risk environments [1]. **Strong message confidentiality from the operator is a target, not fully realized in the MVP store**—see [Security and Resilience](#security-and-resilience) and the [threat model](../security/threat-model.md).

## Core Components

The architecture consists of three primary layers: the frontend client, the managed backend (Supabase), and the zero-knowledge (ZK) privacy stack.

### 1. Frontend Client

The frontend is built using React, Vite, and TypeScript, providing a responsive and accessible user interface [1]. It is designed to operate efficiently in low-bandwidth environments, which is critical for users in active conflict zones with degraded internet infrastructure [3].

*   **Framework**: React (with Vite for fast builds).
*   **Language**: TypeScript for type safety and maintainability.
*   **Styling**: TailwindCSS for the design system, adhering to WCAG AA accessibility standards [1].
*   **State Management**: Optimized for ephemeral data handling to minimize data at risk on the client device [3].
*   **Onboarding subtree**: The multi-step onboarding UI lives under `src/onboarding/` as a **scoped design island** (tokens and components separate from the main shell). How it connects to `/verify`, intent, and sessionStorage is summarized in [`onboarding-architecture.md`](onboarding-architecture.md).

### 2. Managed backend (Supabase BaaS)

**What this repository actually ships:** a **pure BaaS (backend-as-a-service) pattern**. There is **no custom Node.js application server** and **no Redis deployment** in the product path described by this repo. The client talks to **Supabase**: PostgreSQL (with Row Level Security), Auth, Realtime, and optional Storage. Domain logic that would live in an app server elsewhere is implemented **in the database** (SQL, RPCs, triggers) and in **Supabase Edge Functions** (Deno), not in a separate long-running Node tier.

*   **Platform**: [Supabase](https://supabase.com/) — managed Postgres, Auth, PostgREST-style APIs via `supabase-js`, and Realtime channels over WebSockets for live updates (e.g. match queue and messaging), replacing a bespoke WebSocket server.
*   **Database**: PostgreSQL for persistent, policy-gated data; RLS is the primary authorization boundary for row access.
*   **Serverless functions**: Edge Functions (e.g. `verify-zk-proof` for Semaphore verification) for operations that must not run in the untrusted browser.
*   **Matchmaking and queues**: Implemented with Postgres-backed RPCs and tables (`matchmaking_*`), not Redis. Optional Redis or dedicated workers may be considered later for extreme scale; `docker-compose.yml` includes an **optional** local Redis stub for experiments, not a dependency of the current Vite client.

**Supabase client entrypoints (frontend):** The browser uses a single `createClient<Database>` from [`src/utils/supabase.ts`](../../src/utils/supabase.ts). Code in `src/lib` should prefer the typed accessor [`getSupabase()`](../../src/lib/supabase.ts), which wraps the same singleton. The onboarding subtree under `src/onboarding/` has its own [`getSupabaseBrowserClient`](../../src/onboarding/lib/supabase/client.ts) to keep the onboarding bundle isolated; new app features outside that tree should not add additional client factories without an architecture review.

Older prospectus-style materials sometimes described a “horizontally scalable Node.js backend” with Redis [1]. **That design is not what this codebase runs today**; treat those references as forward-looking or superseded when reconciling audits against the repo.

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
*   **Resilience**: Uptime and scale depend on Supabase’s managed infrastructure, Postgres tuning, and careful use of Realtime and Edge Functions—not on a separate Node/Redis stack in this repository. Crisis-time spikes still warrant capacity planning with the provider and monitoring (see deployment and operations docs).

## References

[1] MENDguild Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
