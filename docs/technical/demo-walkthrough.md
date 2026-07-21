# Guided demo walkthrough

> **Legacy diligence only.** The live product path is `/request-access` → `/app` → `/p/*` → private release (NGO deliberation). Citizen matchmaking, `/verify`, and offline squad mocks are soft-retired from `App.v2` routing — do not use this document as the default contributor or partner demo script. Prefer [`docs/operations/v2-pilot-checklist.md`](../operations/v2-pilot-checklist.md).

The product tour is a **demo-only** layer: scripted routes, optional auto-actions on `data-demo` hooks, banner + bottom chrome, and **Space** to advance when the tour is active (not while typing in fields). It is **not** required for production traffic.

Implementation lives in **`src/demo/`** (script, provider, layout, telemetry helpers).

## What ships in every build

| Surface | Route | Notes |
| ------- | ----- | ----- |
| Offline squad mock | `/session/demo-session-001` | [`DemoSessionPage`](../../src/pages/DemoSessionPage.tsx): no Supabase Realtime; copy links to `/security`. **Not** gated on `VITE_ENABLE_DEMO_SQUAD`. |
| ZK verification (standalone) | `/verify` | Real Semaphore + Edge path when configured; the tour adds **`/verify?demo=1`** as a step with overlay copy aligned to the threat model. |
| Profile in tour | `/settings/profile?demo=1` | [`ProfileSettingsPage`](../../src/pages/ProfileSettingsPage.tsx) calls `ensureAnonymousSession()` when `demo=1` so the step works without visiting Match first. |

## Investor-facing behavior

- **Pitch / diligence:** The offline session is explicitly a **mock**; live squad rooms use [`SessionPage`](../../src/pages/SessionPage.tsx) with Realtime and app-layer encryption (see [`threat-model.md`](../security/threat-model.md)).
- **`VITE_ENABLE_DEMO_SQUAD`:** Optional. Only enables **developer** shortcuts (e.g. creating a test squad from the session hub), not the public `/session/demo-session-001` route.

## Removing the tour completely

Follow these steps in order; after each step, run `npm run build` and smoke-test `/`, `/match?demo=1`, and intent/match flows.

1. **Delete the demo package**  
   Remove the entire directory **`src/demo/`** (including `demoScript.test.ts`).

2. **`src/App.tsx`**  
   - Remove the `DemoWalkthroughProvider` import and unwrap the tree so `AuthProvider` is directly inside `BrowserRouter` (no provider wrapper).  
   - Remove the route **`/onboarding/demo`** (if present) or its **`Navigate`** to **`/onboarding?demo=1&ob=1`**.  
   - Remove the route **`/session/demo`** (`Navigate` to `demo-session-001`) if you added it only for the tour alias.

3. **`src/components/layout/AppLayout.tsx`**  
   - Remove `DemoLayout`, `useDemoWalkthrough`, and the `showDemoChrome` / `demoMainPad` padding logic.  
   - Render the previous structure: `ZkStubBanner`, `OfflineBanner`, `AuthIssueBanner`, `AppHeaderNav`, `main` with `Outlet`, `footer` — **without** wrapping children in `DemoLayout`.

4. **`src/pages/LandingPage.tsx`**  
   - Remove `useDemoWalkthrough` / `startWalkthrough`.  
   - Remove the **Start guided tour** button (and any copy that exists only for the tour).

5. **`src/pages/Match.tsx`**  
   - Remove the import from **`../demo/demoScript`** (`DEMO_WALKTHROUGH_STORAGE_KEY`).  
   - In the `guidedDemo` effect, remove the **`walkthroughActive`** branch so offline guided demo again uses only the original timeout → **`/session/demo-session-001`** behavior (unless you intentionally keep pacing changes).  
   - Optionally remove **`data-demo="match-guided-root"`** from the guided-demo container.

6. **`src/pages/IntentPage.tsx`** and **`src/pages/DemoSessionPage.tsx`**  
   - Remove **`data-demo="..."`** attributes that were added for scripted auto-actions (safe to leave, but removal avoids dead hooks).

7. **Verify**  
   Run:

   ```bash
   rg "demo/DemoWalkthrough|DemoWalkthroughProvider|useDemoWalkthrough|DemoLayout|demoWalkthrough|DEMO_WALKTHROUGH_STORAGE_KEY|onboardingTourPath" src
   ```

   There should be **no** matches except unrelated uses of the word “demo” (e.g. `DemoSessionPage`, ledger fixtures, `demo=` query params on match).

### Runtime state

The tour sets **`sessionStorage.demoWalkthrough = "1"`** while active. Removing the code does not clear existing tabs; users can clear site data or session storage, or ignore it (nothing will read the key after removal).

### What to keep

Do **not** remove unless you are dropping investor/offline demos entirely:

- **`DemoSessionPage`**, **`/session/demo-session-001`**, **`lib/demoSession.ts`**, **`?demo=1`** on Match — these are separate from the **walkthrough** package and support offline/story demos without the scripted tour.
