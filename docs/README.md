# SquadRidge documentation

This folder is the **canonical** home for product, technical, security, and operations documentation. Start here, then open the linked files — avoid duplicating long-form content.

## Product

| Topic | Document |
| ----- | -------- |
| What SquadRidge is (mission, mechanics) | [product/product-overview.md](product/product-overview.md) |
| Onboarding journey (product view) | [product/onboarding-flow.md](product/onboarding-flow.md) |
| User journeys | [product/user-journeys.md](product/user-journeys.md) |
| Feature specifications | [product/feature-specifications.md](product/feature-specifications.md) |
| Metrics | [product/metrics-spec.md](product/metrics-spec.md) |
| CSI (draft, not shipped) | [product/csi-spec.md](product/csi-spec.md) |

## Business & fundraising

| Topic | Document |
| ----- | -------- |
| Strategic positioning (early warning / prevention narrative) | [business/strategic-positioning-early-warning.md](business/strategic-positioning-early-warning.md) |
| Go-to-market | [business/go-to-market.md](business/go-to-market.md) |
| Partnership strategy | [business/partnership-strategy.md](business/partnership-strategy.md) |
| Pilot one-pager | [business/pilot-partner-one-pager.md](business/pilot-partner-one-pager.md) |
| Impact metrics | [business/impact-metrics.md](business/impact-metrics.md) |

## Technical

| Topic | Document |
| ----- | -------- |
| Architecture (client + Supabase) | [technical/architecture-overview.md](technical/architecture-overview.md) |
| Onboarding implementation | [technical/onboarding-architecture.md](technical/onboarding-architecture.md) |
| Demo / guided tour | [technical/demo-walkthrough.md](technical/demo-walkthrough.md) and [../src/demo/README.md](../src/demo/README.md) |
| Data model | [technical/data-model.md](technical/data-model.md) |
| Auth and sessions | [technical/auth-and-sessions.md](technical/auth-and-sessions.md) |
| API / Edge Functions | [api/edge-functions.md](api/edge-functions.md) |
| React Query caching | [technical/react-query-cache.md](technical/react-query-cache.md) |

## Security & trust

| Topic | Document |
| ----- | -------- |
| Threat model | [security/threat-model.md](security/threat-model.md) |
| Encryption scope | [security/encryption-scope.md](security/encryption-scope.md) |
| Verified / anonymous auth narrative | [auth/anonymous-to-verified.md](auth/anonymous-to-verified.md) |

## Operations & piloting

| Topic | Document |
| ----- | -------- |
| Pilot runbook | [operations/pilot-runbook.md](operations/pilot-runbook.md) |
| Incidents | [operations/incidents.md](operations/incidents.md) |
| Production checklist | [operations/production-checklist.md](operations/production-checklist.md) |

## Design & brand

| Topic | Document |
| ----- | -------- |
| Design system | [design/design-system.md](design/design-system.md) |
| UX patterns | [design/ux-patterns.md](design/ux-patterns.md) |
| Accessibility | [design/accessibility-guide.md](design/accessibility-guide.md) |
| Tone of voice | [brand/tone-of-voice.md](brand/tone-of-voice.md) |

## Architecture decisions (ADRs)

| ADR | Topic |
| --- | ----- |
| [001](adr/001-use-semaphore-zk.md) | Semaphore / ZK direction |
| [002](adr/002-realtime-vs-polling.md) | Realtime vs polling |
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
