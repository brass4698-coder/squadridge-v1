# Diligence Overview

This document is a short diligence-oriented overview for partners, funders, and advisors evaluating SquadRidge as it exists today.

## What SquadRidge Is

SquadRidge is a verified-anonymous dialogue platform for small, structured, cross-border cohorts. The current product is best suited for facilitated pilots where trusted organizations need a safer alternative to generic chat or meeting tools for sensitive dialogue work.

## Current Product State

The repository contains a substantial working application with:

- React/Vite/TypeScript frontend
- Supabase backend with PostgreSQL, RLS, Auth, Realtime, and Edge Functions
- ZK verification flow built around Semaphore-style proofs
- Matchmaking, session, ledger, moderator, and profile surfaces
- CI pipelines and deployment workflows
- Documentation covering architecture, security, business positioning, and operations

This is not just a concept repo. It is also not yet a finished institution-grade platform.

## Recommended Initial Wedge

The most credible near-term deployment path is:

- buyer: peacebuilding organizations, research programs, academic labs, Track II operators
- user group: vetted, facilitator-supported participants in bounded cohorts
- job to be done: run structured dialogue sessions with stronger verification, better safety framing, and more purposeful outcomes than generic messaging tools

## Security And Privacy Boundaries

The engineering source of truth is [`docs/security/threat-model.md`](./docs/security/threat-model.md). The most important diligence points are:

- verification is designed to reduce unnecessary exposure of raw identity attributes
- the system still maintains account identifiers and operational metadata
- current message confidentiality is not Signal-style end-to-end encryption against the platform operator
- operator, service-role, moderator, and database-access boundaries matter materially
- production deployments should not rely on demo or stub verification modes

Any external narrative should follow those boundaries exactly.

## What Is Fundable About This

The strongest fundable aspects of SquadRidge today are:

- a distinct thesis: verification plus structured dialogue for sensitive cross-border cohorts
- unusually honest and mature security documentation for an early-stage project
- an already-built product surface rather than only a deck or prototype video
- a plausible institutional wedge where trust, safety, and workflow matter more than mass-market growth

## What Still Needs To Be Proven

To become clearly fundable at a higher level, SquadRidge still needs:

- pilot evidence with real partners or tightly structured external cohorts
- stronger operational tooling for facilitators and moderators
- measurable outcome reporting and retention metrics
- security review beyond internal documentation
- a tighter partner/data-room narrative that distinguishes shipped product from roadmap

## Current Risks

- overclaiming privacy or peace impact ahead of demonstrated evidence
- mixing demo-readiness with pilot-readiness
- insufficient process around incidents, moderation, and partner operations
- institution-facing diligence materials lagging behind the technical maturity of the repo

## Near-Term Milestones

The next 90 days should aim to produce:

1. A narrow pilot thesis and partner-facing collateral
2. Pilot runbooks, incident handling, and facilitator workflow readiness
3. Core metric instrumentation and partner reporting
4. A diligence-ready data room with current-state documentation
5. Either an explicit operator-readable messaging posture or a defined true-E2E roadmap

## Supporting Docs

- Current state summary: [`CURRENT_STATUS.md`](./CURRENT_STATUS.md)
- Product overview: [`docs/product/product-overview.md`](./docs/product/product-overview.md)
- Threat model: [`docs/security/threat-model.md`](./docs/security/threat-model.md)
- Architecture: [`docs/technical/architecture-overview.md`](./docs/technical/architecture-overview.md)
- Production checklist: [`docs/operations/production-checklist.md`](./docs/operations/production-checklist.md)
