# Onboarding UI and adjacent routes

This document explains how the **`src/onboarding/`** subtree relates to the rest of the SPA, where **real zero-knowledge verification** runs, and how **ephemeral client storage** supports intent and matchmaking. For product copy and step narrative, see [`docs/product/onboarding-flow.md`](../product/onboarding-flow.md).

## Why `src/onboarding/` is a separate subtree

The onboarding experience uses a **scoped design island**: duplicated shadcn-style primitives under `src/onboarding/app/components/ui/`, onboarding-specific motion and copy, and CSS variables that differ from the main shell (`AppLayout`, session pages). That keeps the multi-step flow shippable without refactoring the entire app to one token system.

**Integration points with the main app are intentional but narrow**, for example:

- `src/pages/OnboardingPage.tsx` wraps the flow in `dark onboarding-page-root font-onboarding-ui` and renders `<Onboarding />`.
- `src/App.tsx` may import shared UI from the onboarding tree (e.g. `Toaster` from `src/onboarding/app/components/ui/sonner`).

New work should **reuse onboarding components inside this subtree** unless you are deliberately aligning the whole product to a single design system.

## Scoped styling (Tailwind / tokens)

Onboarding-specific tokens live in `src/styles/onboarding.css` (and related onboarding theme files under `src/onboarding/styles/`). Variables are applied under **`.dark.onboarding-page-root`** so shadcn-style components inside onboarding do not override globals used elsewhere.

## Routes: education vs verification vs matching

| Route | Role |
| ----- | ---- |
| `/onboarding` | Multi-step **education and commitment** UI (`OnboardingPage` → `src/onboarding/...`). Copy may include **simulated or narrative** language in places; align strings in `src/onboarding/.../copy.ts` when behavior changes. |
| `/verify` | **Production verification entry**: calls `runVerification` via `src/lib/zk` → `src/lib/zkAdapter.ts` (Semaphore + `verify-zk-proof` Edge Function, or hash stub when `VITE_ZK_STUB=true`). This is the code path to treat as **authoritative** for “user completed ZK verification” in the current build. |
| `/intent` | Intent text/tags + perspective; writes **sessionStorage** (see below) and calls matchmaking APIs. |
| `/ledger` | Ledger / proposals UI (evolves independently; not the same subsystem as onboarding tokens). |
| `/session/:squadId` | Active squad chat after match (see session components under `src/components/` and `src/pages/SessionPage.tsx`). |

**Important:** Long-term product vision (e.g. zkTLS-style attribute extraction) is described in product docs but is **not** implemented end-to-end in this repository until corresponding code exists. See [`zk-implementation.md`](zk-implementation.md) and [`docs/product/onboarding-flow.md`](../product/onboarding-flow.md) step 3.

## End-to-end ZK references

- **Implementation and Edge Function contract:** [`docs/technical/zk-implementation.md`](zk-implementation.md)
- **Trust boundaries and operator-visible linkage:** [`docs/security/threat-model.md`](../security/threat-model.md)

## Ephemeral client storage (intent + matchmaking)

These are **not** Postgres schemas; they are **browser sessionStorage** contracts used in the current build. They minimize server persistence of free-text intent while matching is exercised.

| Concern | Module | Storage key(s) | Notes |
| ------- | ------ | -------------- | ----- |
| Session intent (text + tags + timestamp) | `src/lib/intentStorage.ts` | `squadridge_session_intent` (see `INTENT_SESSION_KEY`) | JSON; entries **expire** after 30 minutes on read. Comment in module describes future hashed/vector pipelines if product moves beyond session-only storage. |
| Match pool + side (A/B) | `src/lib/matchmakingSession.ts` | `squadridge_match_pool_key`, `squadridge_match_side` | Set after enqueue / navigation as needed for the match flow. |

If you add new keys or change payload shape, update this table and the file-level comments in those modules so implementers and security reviews stay aligned.

## Related source files (quick index)

- Onboarding shell: `src/pages/OnboardingPage.tsx`, `src/onboarding/app/components/onboarding/Onboarding.tsx`, `OnboardingContext.tsx`
- Verification page: `src/pages/VerificationPage.tsx`, `src/lib/zkAdapter.ts`, `src/lib/zk/`
- Intent + matchmaking: `src/pages/IntentPage.tsx`, `src/lib/intentStorage.ts`, `src/lib/matchmakingSession.ts`, `src/lib/matchmakingClient.ts`
