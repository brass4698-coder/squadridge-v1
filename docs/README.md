# SquadRidge documentation

This folder is the **canonical** home for product, technical, security, and operations documentation. Start here, then open the linked files — avoid duplicating long-form content.

## Glossary (canonical domain terms)

The product surface uses three closely-related words inconsistently across the codebase (see Phase 3.1 of the audit remediation plan). New code and docs **must** use the canonical meanings below; older call-sites are migrating in stages.

| Term        | Canonical meaning                                                                                                                                                                                                                                                                                                            | Where it shows up today                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Squad**   | A persisted cohort of two or more verified-anonymous participants matched into the same dialogue. Identified by `public.squads.id`. Outlives any single meeting; carries `message_encryption_key`, membership, message history.                                                                                              | DB tables `squads`, `squad_members`, `squad_peer_profiles`; client wrappers `src/lib/squad.ts`. |
| **Session** | One time-bounded _meeting_ of a squad — the bracket between "we entered the room" and "we left or archived". May be the only one a squad ever has, or one of a recurring series. The current MVP collapses session ≈ squad lifecycle, but new analytics (`metrics-spec.md`) and the pilot runbook talk about session counts. | "Pre-session checklist", "session metrics", `getDemoSession()`, `useSessionAccess`.             |
| **Room**    | The _UI surface_ a participant inhabits while a session is in progress (chat list, phase rail, reactions, alert button). A room renders one session of one squad.                                                                                                                                                            | `SessionPage.tsx`, `SessionStrategyRoomChrome.tsx`, "Exit to hub" link.                         |

**Renaming policy:**

- New code: use these meanings exactly.
- Existing code/DB: do not rename in flight. Rename in three sequenced PR cycles (docs → API/RPC → DB columns with views as compatibility shims) so existing migrations and external integrations have time to adopt.
- PR reviewers: flag accidental misuse (e.g. "session" used to mean "matched cohort") and link to this glossary.

The naming inconsistency is logged as Phase 3.1 of the [audit remediation plan](../README.md). Examples to flag:

- `LAST_SQUAD_KEY = 'squadridge_last_squad_id'` — correct (squad).
- `getDemoSession()` returning a state machine that mixes onboarding + verification + squad pointer — should split into `getDemoOnboardingState()` + `getDemoSquadPointer()` in a follow-up.
- `SessionPage.tsx` — name is fine (UI surface for a session) but `squadId` prop is the canonical identifier.

## Product

| Topic                                   | Document                                                               |
| --------------------------------------- | ---------------------------------------------------------------------- |
| **Full platform description (start here)** | [product/platform-description.md](product/platform-description.md)   |
| Impact & differentiation roadmap          | [product/impact-roadmap.md](product/impact-roadmap.md)               |
| Phase A engineering checklist             | [../ROADMAP.md](../ROADMAP.md)                                       |
| Ridge Protocol spec (B1)                  | [product/ridge-protocol-spec.md](product/ridge-protocol-spec.md)     |
| Short pitch (30s / 2min)                | [product-one-pager.md](product-one-pager.md)                           |
| What SquadRidge is (summary index)      | [product/product-overview.md](product/product-overview.md)             |
| Onboarding journey (product view)       | [product/onboarding-flow.md](product/onboarding-flow.md)               |
| User journeys                           | [product/user-journeys.md](product/user-journeys.md)                   |
| Feature specifications                  | [product/feature-specifications.md](product/feature-specifications.md) |
| Metrics                                 | [product/metrics-spec.md](product/metrics-spec.md)                     |
| CSI (draft, not shipped)                | [product/csi-spec.md](product/csi-spec.md)                             |

## Business & fundraising

| Topic                                                        | Document                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Strategic positioning (early warning / prevention narrative) | [business/strategic-positioning-early-warning.md](business/strategic-positioning-early-warning.md)                                |
| Go-to-market                                                 | [business/go-to-market.md](business/go-to-market.md)                                                                              |
| Partnership strategy                                         | [business/partnership-strategy.md](business/partnership-strategy.md)                                                              |
| Pilot one-pager                                              | [business/pilot-partner-one-pager.md](business/pilot-partner-one-pager.md)                                                        |
| Pitch Deck Hub (app + static HTML)                           | In-app `/pitch-deck-hub`; [`public/pitch-deck-hub/`](../public/pitch-deck-hub/) · [`src/pitch-deck-hub/`](../src/pitch-deck-hub/) |
| Impact metrics                                               | [business/impact-metrics.md](business/impact-metrics.md)                                                                          |

## Technical

| Topic                            | Document                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Architecture (client + Supabase) | [technical/architecture-overview.md](technical/architecture-overview.md)                                          |
| Onboarding implementation        | [technical/onboarding-architecture.md](technical/onboarding-architecture.md)                                      |
| Demo / guided tour               | [technical/demo-walkthrough.md](technical/demo-walkthrough.md) and [../src/demo/README.md](../src/demo/README.md) |
| Data model                       | [technical/data-model.md](technical/data-model.md)                                                                |
| Auth and sessions                | [technical/auth-and-sessions.md](technical/auth-and-sessions.md)                                                  |
| API / Edge Functions             | [api/edge-functions.md](api/edge-functions.md)                                                                    |
| React Query caching              | [technical/react-query-cache.md](technical/react-query-cache.md)                                                  |

## Security & trust

| Topic                                | Document                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Threat model                         | [security/threat-model.md](security/threat-model.md)                         |
| Encryption scope                     | [security/encryption-scope.md](security/encryption-scope.md)                 |
| npm audit disposition & supply chain | [security/dependency-advisories.md](security/dependency-advisories.md)       |
| Sentry / client observability        | [security/observability-and-sentry.md](security/observability-and-sentry.md) |
| Verified / anonymous auth narrative  | [auth/anonymous-to-verified.md](auth/anonymous-to-verified.md)               |

## Operations & piloting

| Topic                | Document                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| Pilot runbook        | [operations/pilot-runbook.md](operations/pilot-runbook.md)               |
| Incidents            | [operations/incidents.md](operations/incidents.md)                       |
| Production checklist | [operations/production-checklist.md](operations/production-checklist.md) |

## Design & brand

| Topic         | Document                                                       |
| ------------- | -------------------------------------------------------------- |
| Design system | [design/design-system.md](design/design-system.md)             |
| UX patterns   | [design/ux-patterns.md](design/ux-patterns.md)                 |
| Accessibility | [design/accessibility-guide.md](design/accessibility-guide.md) |
| Tone of voice | [brand/tone-of-voice.md](brand/tone-of-voice.md)               |

## Architecture decisions (ADRs)

| ADR                                            | Topic                        |
| ---------------------------------------------- | ---------------------------- |
| [001](adr/001-use-semaphore-zk.md)             | Semaphore / ZK direction     |
| [002](adr/002-realtime-vs-polling.md)          | Realtime vs polling          |
| [003](adr/003-zk-device-bootstrap-deferred.md) | Deferred ZK device bootstrap |

## Short entrypoints (same folder)

Stable filenames that point to the canonical docs above:

- [architecture-overview.md](architecture-overview.md)
- [product-overview.md](product-overview.md)
- [demo-flow.md](demo-flow.md)
- [onboarding-spec.md](onboarding-spec.md)
- [trust-safety.md](trust-safety.md)
- [threat-model.md](threat-model.md)
- [deployment.md](deployment.md)
- [testing.md](testing.md)
- [decisions.md](decisions.md)
