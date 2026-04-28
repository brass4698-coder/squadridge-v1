# Security

SquadRidge handles sensitive dialogue workflows. This document describes how to report issues and where to read the technical posture.

## Reporting a vulnerability

**Please do not** open a public GitHub issue for undisclosed security problems.

1. Email maintainers with a clear description, affected routes or components, and reproduction steps if safe to share.
2. Allow a reasonable window for triage and fix before any public disclosure.
3. We will acknowledge receipt and coordinate remediation; credit can be discussed if you want it.

For participant-facing boundaries (encryption scope, operator visibility, what is not E2E today), see the in-app **Security & privacy** page at `/security` and the engineering write-ups below.

## Authoritative technical references

- [Threat model](docs/security/threat-model.md) — assets, adversaries, current guarantees and non-goals.
- [Encryption scope](docs/security/encryption-scope.md) — what ciphertext and keys mean in this codebase.
- [Secrets rotation](docs/security/secrets-rotation.md) — operational key handling.
- [Production checklist](docs/operations/production-checklist.md) — release-oriented controls.

## Safe harbor

We support good-faith research that follows this reporting process and avoids harm to users or production data. Do not access accounts or data that are not yours, and do not perform destructive testing without written agreement.

## Dependency and supply chain

Keep dependencies current; run `npm audit --omit=dev` and read [dependency advisories disposition](docs/security/dependency-advisories.md) before pilot deployments. Dependabot proposes weekly updates (`.github/dependabot.yml`). CI runs lint, unit tests, production build, database migrations, **dependency review on pull requests** (blocks newly introduced high/critical issues), and an informational production audit summary — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Client error reporting posture (Sentry): [Observability and Sentry](docs/security/observability-and-sentry.md).
