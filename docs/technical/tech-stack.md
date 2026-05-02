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
*   **Optional presenter tour**: Scripted demo walkthrough in `src/demo/`; how to remove it without affecting core routes is documented in [`demo-walkthrough.md`](demo-walkthrough.md)

## Backend Services

The **shipped** application backend is **Supabase**: PostgreSQL with Row Level Security (RLS), Auth (including anonymous sessions), Realtime, and **Edge Functions** (Deno) for privileged operations such as ZK verification [1]. The SPA talks to Supabase over HTTPS; there is no separate Node.js API server in this repository.

*   **Database & API**: PostgreSQL via Supabase; RLS for client-scoped access; migrations under `supabase/migrations/` [1]
*   **Edge Functions**: e.g. `verify-zk-proof` — see [`zk-implementation.md`](zk-implementation.md)
*   **Future / optional**: dedicated workers or self-hosted Redis for rate limiting and matchmaking at scale appear in older product docs but are **not** required for the current Vite + Supabase layout; Edge rate limits use Upstash Redis REST from `supabase/functions/rate-limit/` [1]

## Zero-Knowledge Privacy Stack

Security is the cornerstone of SquadRidge, employing advanced cryptographic techniques to protect user identities [1].

*   **Core protocol**: Enclave[ZK] privacy stack [1]
*   **Proof system (shipped in repo)**: Semaphore-based ZKPs; client proving in `src/lib/zk/` + `src/lib/zkVerifier.ts`; server verification in `supabase/functions/_shared/handleZkProofVerification.ts` [1]
*   **zkTLS-style data extraction (roadmap)**: Privacy-preserving extraction from secure web sources via **zkTLS** is described in research materials [2] but **is not implemented** in this codebase—see [`zk-implementation.md`](zk-implementation.md)
*   **Identity verification**: Cryptographic proofs of coarse attributes without storing raw ID documents in Postgres for the Semaphore path; operator-visible metadata (`user_id`, scopes) is documented in [`../security/threat-model.md`](../security/threat-model.md) [3]

## AI and Data Pipeline

The platform integrates AI for real-time de-escalation and sentiment analysis, separating these streams from core messaging [1].

*   **Natural Language Processing (NLP)**: Models for real-time translation and tone detection [1]
*   **Sentiment Analysis**: Tools to gauge public mood and polarization, providing aggregated early warning insights [3]
*   **Data architecture**: Messaging and analytics are conceptually separated; **strong encryption of stored message bodies from the operator is a target**, not the current MVP store—see [`security-privacy.md`](security-privacy.md) and the [threat model](../security/threat-model.md). Graceful degradation when AI services are down remains a design goal [1]

## Infrastructure and Security

The infrastructure is designed to withstand attacks and protect users in high-risk environments [3].

*   **Hosting**: Static frontend (e.g. Vercel, Netlify, Cloudflare Pages) plus Supabase project; see [`architecture-overview.md`](architecture-overview.md)
*   **Encryption**: **Target:** end-to-end encryption for sensitive exchanges [3]. **Current:** MVP payloads documented in `src/lib/messagePayload.ts`; do not claim full E2E to users without an engineering sign-off [3]
*   **Data minimization**: Ephemeral messaging and "do no harm" principles [2]; ZK retention notes in [`data-retention-zk.md`](data-retention-zk.md)
*   **Accessibility**: UI components built to adhere strictly to WCAG AA accessibility standards [1]

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
