# Infrastructure

## Overview

The infrastructure of SquadRidge is designed to support verified-anonymous, cross-border dialogue at scale while ensuring strong security, privacy, and resilience [1]. Built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), the platform separates ephemeral messaging streams from aggregated analytics to reduce exposure for users in high-risk environments [1].

## Cloud-Native Deployment

**Production shape in this repository:** a static **frontend** (Vite build) plus a **Supabase project** (hosted by Supabase). The database, Auth, Realtime, and Edge Functions run on Supabase’s platform; there is **no first-party Node.js API fleet** required for the app as implemented here. Spikes and crisis-time load are handled in practice by **Supabase/Postgres capacity**, connection hygiene, and monitoring—not by a custom horizontal Node tier [1][3].

### 1. High Availability and Scalability

Real-time features use **Supabase Realtime** (WebSockets) over Postgres change feeds, not a bespoke WebSocket service in this repo. Matching uses **Postgres RPCs** and tables (`match_queue`, `matchmaking_*`). The client is designed to work in **low-bandwidth** environments [3]; resilience is a combination of edge-cached static assets, efficient queries, and provider SLAs.

### 2. State and queues

**Queues and session state** for matching live in **PostgreSQL** (with RLS). Optional **Redis** in `docker-compose.yml` is for **local experiments** (e.g. future workers) and is **not** part of the documented production path. **Edge rate limiting** for sensitive actions can use **Upstash Redis** via the `rate-limit` Edge Function when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set.

### 3. Data Separation and Ephemerality

The data pipeline separates encrypted messaging payloads from aggregated analytics [1]. This allows graceful degradation if optional AI translation or sentiment services experience downtime [1].

## Security and Privacy

The infrastructure incorporates best practices for digital safety in conflict zones, including threat-aware planning, strong encryption, and disciplined operational security [3].

### 1. Verified Anonymity via Zero-Knowledge Proofs

Security is anchored by the Enclave[ZK] stack, which employs Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes without exposing raw personally identifiable information (PII) [1].

### 2. Application-layer encryption and retention

**Current security model (as implemented):**

- **Application-layer AES-GCM** for message payloads: squad keys are generated server-side and readable by squad members via RLS (`squads.message_encryption_key`); this is **not** end-to-end encryption in the sense of keys held only on user devices.
- **7-day message TTL** with `expires_at` on `public.messages`, set by trigger, plus hourly **`pg_cron`** cleanup when the extension is available (see migration `20260418090000_ttl_cleanup.sql`).
- **RLS** on user-facing tables; **SECURITY DEFINER** RPCs for narrow moderation and matchmaking surfaces.
- **Semaphore v4** identity and ZK proofs verified by Edge Functions; CORS restricted via **`ALLOWED_ORIGINS`** on those functions.

Earlier drafts sometimes referred loosely to “end-to-end encryption” or “automatic message deletion.” The accurate statements are above: encryption is application-layer with server-mediated keys, and deletion/TTL are enforced in Postgres (not implicit in the client).

### 3. "Do No Harm" Data Architecture

The infrastructure implements "do no harm" principles from the design phase, ensuring that the data serves community needs without extractive practices [2]. The platform aggregates de-identified sentiment metrics to provide early warning insights, strictly separated from message payloads [1].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
