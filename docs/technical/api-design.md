# API Design

## Overview

SquadRidge’s “API” for the shipped product is **not** a standalone Node.js HTTP service in this repository. The frontend uses the **Supabase client** (`supabase-js`) against:

* **PostgREST** — table and view access with RLS as the authorization layer.
* **Postgres RPCs** — `supabase.rpc(...)` for matchmaking, message windows, waitlist, and moderation helpers.
* **Realtime** — `supabase.channel(...).on('postgres_changes', ...)` for live updates (e.g. match queue, messages).
* **Edge Functions** — `supabase.functions.invoke(...)` for operations that must run server-side (e.g. `verify-zk-proof` for Semaphore verification).

Older materials described a “horizontally scalable Node.js backend” with Redis and REST paths like `/api/v1/...` [1]. **That is not how this codebase is wired.** The sections below map **product domains** to **actual surfaces** in the repo. For the full stack picture, see [`architecture-overview.md`](architecture-overview.md).

## Architectural Principles

### 1. Security and Anonymity

Authorization is enforced primarily with **Row Level Security** in PostgreSQL, plus Auth session identity. ZK verification uses the **`verify-zk-proof`** Edge Function (see [`zk-implementation.md`](zk-implementation.md)). Traffic uses HTTPS to Supabase; see the [threat model](../security/threat-model.md) for what the operator can and cannot see.

### 2. Ephemerality and Data Minimization

Ephemeral behavior is implemented through **schema, retention rules, and client flows**—not through a separate “ephemeral API tier.” See [`data-retention-zk.md`](data-retention-zk.md) and the threat model.

### 3. Scalability and Performance

Scale-out is **Supabase-managed Postgres + Realtime**, with domain logic in SQL/RPCs. Self-hosted Redis is **not** part of the production API path; the only Redis in the product path is **Upstash Redis REST** called from `supabase/functions/rate-limit/` (see [`tech-stack.md`](tech-stack.md)).

## Core API Domains (concept → implementation)

Domains below are **logical**; concrete names are representative—grep `src/` and `supabase/migrations/` for the current list.

### 1. Authentication and Verification

| Concept | Implementation in this repo |
| -------- | ---------------------------- |
| Session | Supabase Auth (`signInAnonymously`, session JWT, `getSession`) |
| ZK proof verification | Edge Function `verify-zk-proof` via `supabase.functions.invoke('verify-zk-proof', { body })` — see `src/lib/zkAdapter.ts` |
| Logout | `supabase.auth.signOut()` |

There is no `POST /api/v1/auth/verify-proof` route in this codebase.

### 2. Squad Management and Matching

| Concept | Implementation in this repo |
| -------- | ---------------------------- |
| Enqueue / pool snapshot / cancel | Postgres RPCs such as `matchmaking_enqueue_and_try`, `matchmaking_pool_snapshot`, `matchmaking_cancel_waiting` — see `src/lib/matchmakingClient.ts` |
| Live queue updates | Realtime subscriptions on relevant tables (e.g. `match_queue`) |

### 3. Messaging and Interventions

| Concept | Implementation in this repo |
| -------- | ---------------------------- |
| Message history / windows | RPCs such as `messages_latest_window`, `messages_older_than` — see `src/hooks/useRealtimeMessages.ts` |
| Live messages | Realtime on message tables as implemented |
| Moderation (staff) | RPCs such as `moderator_flag_message`, `moderator_archive_squad` — see `src/pages/ModDashboardPage.tsx` |

There is no `WebSocket /api/v1/ws/squads/{id}` endpoint; the client uses Supabase Realtime channels.

### 4. Waitlist and counts

| Concept | Implementation in this repo |
| -------- | ---------------------------- |
| Signup counter | RPC `waitlist_signup_count` — see `src/components/HeroWaitlistCounter.tsx` |

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
