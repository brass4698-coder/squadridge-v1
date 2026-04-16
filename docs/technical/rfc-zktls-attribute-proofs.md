# RFC: zkTLS-style attribute proofs (Phase 5 research)

## Status

Research spike / **not implemented** in the application. Product copy must not promise this flow until code and legal review exist ([`docs/product/feature-specifications.md`](../product/feature-specifications.md)).

## Goal

Explore privacy-preserving extraction of attributes from **TLS-protected web sources** and integration with the existing **Semaphore** verification path (`verify-zk-proof` Edge Function, client proving in `src/lib/zk/`).

## Open questions

- Trust model for the **origin** of attributes vs today’s group-membership proofs.
- Legal and jurisdictional constraints on automated retrieval from third-party sites.
- UX: user consent, failure modes, and fallback to manual verification.
- Performance and reliability in low-bandwidth environments (core product constraint).

## Suggested spike outputs

1. Annotated bibliography / vendor landscape (2–4 pages).
2. Threat sketch: what a malicious client, operator, or origin could learn.
3. Prototype behind **`VITE_ZKTLS_LABS`** (default off): no production traffic; feature-flagged UI only.

## Exit criteria

- RFC accepted or deferred with explicit product decision.
- No default-on code path until security and legal review.
