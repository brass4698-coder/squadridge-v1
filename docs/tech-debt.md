# Tech debt tracker

Single source of truth for the 15 findings raised in the May 2026 code review.
Update the `Status` and `PR` fields as items land. Statuses:

- `open` — not started
- `in-progress` — under active work in the linked PR
- `resolved` — merged
- `reframed` — original framing was inaccurate; see notes for the actual fix

Phases map to the implementation plan
(`.cursor/plans/code-review-15-findings-phased_*.plan.md`).

## Status snapshot (May 2026 cycle)

| #  | Title                                                                | Phase | Status                  |
| -- | -------------------------------------------------------------------- | ----- | ----------------------- |
| 1  | Plaintext stored in IndexedDB send queue                             | 1     | resolved                |
| 2  | Non-deterministic ZK stub commitment                                 | 1     | resolved                |
| 3  | No runtime enforcement of `is_stub` rejection at the Edge            | 1     | reframed -> resolved    |
| 4  | `SessionPage.tsx` is 1254 lines / 49 KB                              | 5     | in-progress (4 hooks extracted; send-queue/optimistic decomposition follow-up open) |
| 5  | AuthContext.signOut uses raw query keys                              | 2     | resolved                |
| 6  | `parseSnapshot` silently coerces `pool_key`                          | 2     | resolved                |
| 7  | `src/lib/` flat namespace (89 files)                                 | 5     | resolved                |
| 8  | `listPendingSendsForSquad` scans entire IDB store                    | 3     | resolved                |
| 9  | `@xenova/transformers` runtime weight                                | 3     | reframed -> resolved    |
| 10 | `mergeRowsById` perf claim                                           | 3     | reframed -> resolved (real per-event sort hot path optimised)     |
| 11 | E2E suite has only 3 staging-targeted spec files                     | 4     | resolved                |
| 12 | Missing unit tests for major hooks                                   | 4     | resolved (partially reframed) |
| 13 | Legacy supabase re-export files                                      | 2     | resolved                |
| 14 | Middleware scaffolds not wired to production                         | 6     | reframed -> resolved (review based on stale memory; threat-model note added) |
| 15 | No structured fallback logging when Sentry is not configured         | 2     | resolved                |

14 of 15 fully closed; #4 carries one tracked follow-up for the optimistic-send / send-queue / sub-component decomposition.

---

## Phase 1 — Security

### #1 Plaintext stored in IndexedDB send queue

- Status: in-progress (Phase 1)
- Risk: P1 (security & privacy)
- Files: [src/lib/sendQueue.ts](../src/lib/sendQueue.ts), [src/pages/SessionPage.tsx](../src/pages/SessionPage.tsx), [src/lib/sendQueue.test.ts](../src/lib/sendQueue.test.ts)
- Notes: `plainBody` removed from the persisted `PendingSendRecord` shape. Plaintext now lives in a tab-local `MEM_PLAINTEXT` map only. DB version bumped to 2 with an `onupgradeneeded` cursor migration that strips the field from any pre-existing v1 records. SessionPage shows a `(unsent message — preview unavailable after reload)` placeholder for rows restored from IDB after a refresh.
- PR: TBD (Phase 1)

### #2 Non-deterministic ZK stub commitment

- Status: in-progress (Phase 1)
- Risk: P1 (security & privacy)
- Files: [src/lib/zkVerifier.ts](../src/lib/zkVerifier.ts), [src/lib/zkVerifier.stub.test.ts](../src/lib/zkVerifier.stub.test.ts)
- Notes: `commitData` no longer mixes `Date.now()`; both nullifier and commitment are derived deterministically from `(credentialType, rawInput)`. Tests assert determinism plus differentiation across both inputs.
- PR: TBD (Phase 1)

### #3 No runtime enforcement of `is_stub` rejection at the Edge

- Status: reframed -> in-progress (Phase 1)
- Risk: P2 (defense in depth)
- Files: [supabase/functions/_shared/zkRequestGuards.ts](../supabase/functions/_shared/zkRequestGuards.ts), [supabase/functions/_shared/handleZkProofVerification.ts](../supabase/functions/_shared/handleZkProofVerification.ts), [supabase/functions/_shared/zkRequestGuards.test.ts](../supabase/functions/_shared/zkRequestGuards.test.ts)
- Notes: Original framing was wrong — `ZkVerifyRequestBody` does not declare `is_stub`/`isStub` and the handler never reads them. Fixed as a regression-prevention belt: pure `assertNoStubFlags` helper called immediately after `req.json()`, with full Vitest coverage. Returns 400 `INVALID_REQUEST` if either casing is truthy.
- PR: TBD (Phase 1)

---

## Phase 2 — Quick wins / correctness

### #5 AuthContext.signOut uses raw query keys

- Status: resolved (Phase 2)
- Risk: P3 (maintainability)
- Files: [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx), [src/lib/queryKeys.ts](../src/lib/queryKeys.ts)
- Notes: Replace raw `['profile']` / `['messages']` strings with predicate-based removal anchored on the centralized `queryKeys` shape; or extend `queryKeys` with `.all` prefix arrays.
- PR: TBD

### #6 `parseSnapshot` silently coerces `pool_key`

- Status: resolved (Phase 2)
- Risk: P2 (correctness; masks RPC contract violations)
- Files: [src/lib/matchmakingClient.ts](../src/lib/matchmakingClient.ts)
- Notes: Replace bespoke type-narrowing with a Zod discriminated union. Surface parse failures via `captureAppError` + `null` return; throw in dev/test for fail-loud behaviour.
- PR: TBD

### #13 Legacy supabase re-export files

- Status: resolved (Phase 2)
- Risk: P3 (maintainability)
- Files: [src/lib/supabaseClient.ts](../src/lib/supabaseClient.ts), [src/utils/supabase.ts](../src/utils/supabase.ts), [src/pages/SupabaseHealthPage.tsx](../src/pages/SupabaseHealthPage.tsx)
- Notes: Only one consumer remains (`SupabaseHealthPage.tsx`). Codemod redirects to `src/lib/supabase.ts`, then delete both legacy files. Add an ESLint `no-restricted-imports` rule to prevent regression.
- PR: TBD

### #15 No structured fallback logging when Sentry is not configured

- Status: resolved (Phase 2)
- Risk: P3 (DX / observability)
- Files: [src/lib/sentry.ts](../src/lib/sentry.ts)
- Notes: When `!sentryInitialized && import.meta.env.DEV`, also `console.info('[telemetry] …')` with whitelisted structured data. Keep prod no-op behaviour unchanged.
- PR: TBD

---

## Phase 3 — Performance

### #8 `listPendingSendsForSquad` scans entire IDB store

- Status: resolved (Phase 3)
- Risk: P3 (perf, low impact at current scale)
- Files: [src/lib/sendQueue.ts](../src/lib/sendQueue.ts)
- Notes: Add `store.createIndex('by_squad', 'squadId')` in `onupgradeneeded`, bump DB version, switch the read path to `index('by_squad').getAll(IDBKeyRange.only(squadId))`. Combine with the Phase 1 schema change in a single migration step.
- PR: TBD

### #9 `@xenova/transformers` runtime weight

- Status: reframed -> resolved (Phase 3)
- Risk: P3 (bundle hygiene)
- Files: [src/lib/ai/pipeline.ts](../src/lib/ai/pipeline.ts), [vite.config.ts](../vite.config.ts), [.github/workflows/ci.yml](../.github/workflows/ci.yml)
- Notes: Already deferred via `await import('@xenova/transformers')` and gated by `isAiPipelineEnabled()`. Plan adds: explicit chunk-name comment, a Vitest assertion that `pipeline.ts` does not import the package at module top-level, and a CI bundle-size budget for the main entry chunk.
- PR: TBD

### #10 `mergeRowsById` perf claim

- Status: reframed -> resolved (Phase 3)
- Risk: P4 (perf, very low impact)
- Files: [src/hooks/useRealtimeMessages.ts](../src/hooks/useRealtimeMessages.ts)
- Notes: Original framing was wrong — `mergeRowsById` runs only on reconnect backfills, NOT on every realtime event. Real per-event hot path is the `[...last, row].sort(...)` at lines 339–353, which is O(n log n) over the last page. Replace with linear append when `sent_at >= last`, fallback to sort otherwise. Add a code comment near `mergeRowsById` explaining its narrow use.
- PR: TBD

---

## Phase 4 — Tests

### #11 E2E suite has only 3 staging-targeted spec files

- Status: resolved (Phase 4)
- Risk: P2 (regression risk on core flows)
- Files: [e2e/](../e2e/)
- Notes: Add hermetic Playwright specs (mocked Supabase fixtures) for onboarding, matchmaking, session messaging, and ledger. Keep existing `*-staging.spec.ts` separated under a Playwright project so the default `pnpm e2e` is hermetic.
- PR: TBD

### #12 Missing unit tests for major hooks

- Status: resolved (Phase 4) - partially reframed
- Risk: P3 (coverage)
- Files: [src/hooks/](../src/hooks/)
- Notes: `useRealtimeMessages` already has substantive coverage (`useRealtimeMessages.test.tsx`, ~440 LOC) and `useAppNavContext` is also tested. Add tests for `useSquad`, `useMessagePlaintexts`, `useSquadPresence`, `useSquadTyping` using the existing `createSupabaseMessagesStub` pattern. Direct `SessionPage` testing deferred to Phase 5 (decomposition first).
- PR: TBD

---

## Phase 5 — Large refactors

### #4 `SessionPage.tsx` is 1254 lines / 49 KB

- Status: in-progress (Phase 5)
- Risk: P3 (maintainability)
- Files: [src/pages/SessionPage.tsx](../src/pages/SessionPage.tsx)
- Notes: Phase 5a extracted four self-contained hooks — `useSquadEncryptionKey`, `useInfiniteScrollSentinel`, `useOwnMessageReviewStatus`, `useSendCooldown` — bringing the file from 1254 to 1192 LOC. The remaining and largest concern is the optimistic-sends + send-queue retry loop + cross-tab broadcast (`tryInsertMessage`, `tryInsertWithBackoff`, `flushPendingMessages`, the BroadcastChannel wiring, and the merge-from-IDB effect, ~300 LOC total). Extracting that as `useOptimisticSends` + `useSendQueueRetryLoop` requires careful API design and should land as its own follow-up PR with tests around the locking, dedup-on-realtime, and retry semantics. Sub-component extraction (message list, composer, intervention banners, review queue) is also pending.
- PR: TBD (Phase 5a follow-up)

### #7 `src/lib/` flat namespace (89 files)

- Status: resolved (Phase 5)
- Risk: P3 (maintainability)
- Files: [src/lib/](../src/lib/)
- Notes: Created five new sub-domain folders mirroring the existing `zk/`, `redaction-engine/`, `moderation/`, `ephemeral/`, `ai/` pattern: `matchmaking/`, `crypto/`, `realtime/`, `auth/`, `csi/`. All moves done via `git mv` so blame is preserved. Internal imports inside moved files were updated to `../<sibling>` and consumer paths in `src/lib/index.ts` plus the few non-barrel imports (`AdminCsiPage.tsx`, `messageDecryption.worker.ts`, `modDecrypt.ts`/`.test.ts`) were retargeted. 47/47 test files / 221 tests still pass; lint stays clean.
- PR: TBD

---

## Phase 6 — Ops & observability

### #14 Middleware scaffolds not wired to production

- Status: reframed -> resolved (Phase 6)
- Risk: P3 (documentation accuracy)
- Files: [docs/security/threat-model.md](./security/threat-model.md), [src/lib/rateLimitEdge.ts](../src/lib/rateLimitEdge.ts)
- Notes: Investigated and reframed. The source files referenced in the original review (`src/middleware/anonymizeRequest.ts`, `src/middleware/rateLimiter.ts`) **do not exist** in the repo and never did — the review was based on stale memories. A grep of the canonical [docs/security/threat-model.md](./security/threat-model.md) also showed it never claimed an in-app IP-anonymizer or rate-limit middleware. The actual rate-limit defense flows entirely through `assertEdgeRateLimit` in [src/lib/rateLimitEdge.ts](../src/lib/rateLimitEdge.ts) -> `rate-limit` Edge Function -> Upstash. The threat model was updated with an explicit note (May 2026 revision-log entry) so the next reviewer doesn't re-raise this finding from the same stale memory. Vendor-side IP exposure remains a §3 tier-5 residual risk, not an in-app control.
- PR: TBD (Phase 6)
- PR: TBD
