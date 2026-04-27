# ADR 003: Defer device-bound ZK keypair bootstrap until after first verified session

## Status

Accepted — **deferred implementation** (pilot scope).

## Context

After OTP or magic-link verification, the product may need a **device-bound** keypair and commitment registration so verified attributes can participate in Semaphore-style proofs without re-exposing raw PII in the client.

Today the app completes auth and profile flows without automatically minting or registering that key material on first login.

## Decision

1. **Do not block** sign-in or onboarding on device keypair generation in the current release.
2. **Track** follow-up work in product backlog: on first **verified** session after OTP callback, bootstrap keypair + commitment registration with clear failure UX (retry, support path).
3. **Code** may reference this ADR instead of open `TODO(ZK)` comments where the gap is intentional.

## Consequences

- Pilots can run with the existing verification and profile model.
- Profile and settings surfaces should not promise full “commitment explorer” UX until the bootstrap path exists; copy stays aligned with [docs/security/encryption-scope.md](../security/encryption-scope.md).

## References

- [docs/auth/anonymous-to-verified.md](../auth/anonymous-to-verified.md)
- [docs/technical/zk-implementation.md](../technical/zk-implementation.md)
