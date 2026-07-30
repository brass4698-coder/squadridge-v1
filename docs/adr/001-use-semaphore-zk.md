# ADR 001: Semaphore-based ZK verification

## Status

Accepted

## Context

MENDguild needs **verified-anonymous** participation: operators must trust that users cleared a bar (e.g. attribute / membership) without learning raw identity on the client or in public logs.

## Decision

Use **Semaphore** identities and proofs in the browser, and verify via the Supabase Edge Function `verify-zk-proof`. Development may use `VITE_ZK_STUB=true` for hash-only stubs (non-ZK), gated from production builds in `vite.config.ts`.

## Consequences

- **Positive:** Strong privacy story; proofs are portable and auditable without exposing preimages.
- **Negative:** Heavier client bundle (Semaphore + crypto deps) and operational dependency on the Edge verifier; stub mode must never ship to production.
