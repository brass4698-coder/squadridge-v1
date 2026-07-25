# Guided demo walkthrough

The live product tour is an **App.v2 institutional spine**: public story → facilitator
workspace → seeded session control → outcome → release gate.

Chrome includes a **side sheet** (primary explanation), optional **anchored callout** +
spotlight, progress (step + tip ordinal), and **Back / Next / Exit tour** controls.

Implementation lives in **`src/demo/`**.

## How to start

1. Ensure the demo account is seeded (`docs/operations/demo-account.md`).
2. Open `/sign-in` and choose **Try the Demo** (or visit `/sign-in?demo=1`).
3. After auth, the tour starts at `/?demo=1` and advances through `DEMO_MAIN_STEPS`
   in `src/demo/demoScript.ts`.

You can also call `startWalkthrough()` from `useDemoWalkthrough()` (see
`src/pages/admin/AdminDemoPage.tsx`), or open any spine route with `?demo=1`
(e.g. `http://localhost:5173/?demo=1`).

## Interaction model

| Surface | When |
| ------- | ---- |
| Side sheet | Primary tip copy for the current screen (Hide collapses to “Show guide”) |
| Callout + spotlight | Short anchored hint when a tip has `type: 'callout'` and a `target` |
| Exit modal | Blocking confirm only when leaving the tour |
| Footer Back / Next / Exit | Always labeled; Next advances tips before routes |

Tips are **linear**: Next walks tips on the current route, then navigates to the next
scripted path. Tip index resumes via `sessionStorage` (`demoWalkthroughTip`).

## Chrome

| Control | Behavior |
| ------- | -------- |
| Progress bar | Tip ordinal across the full script |
| **Back** | Previous tip, or last tip of previous step |
| **Next** / Space | Next tip, or next scripted step |
| **Exit tour** | Confirm, then clear tour flag and return to `/` |

`DemoLayout` is mounted from `PublicShell` and `AuthenticatedShell`.

## Script steps (summary)

Welcome → How it works → Security → Ledger → Facilitator dashboard → Participant →
Moderator → Sessions → **Configure** → **Invite** → **Verify** → Session control →
Outcome draft → Release gate → Tour complete.

In-app pilot ops (live facilitators, not the demo tour): `/app/pilot-guide` with the
interactive Configure → Verify → Facilitate → Release walkthrough.

## Removing the tour

See historical notes in git history for deleting `src/demo/` entirely. Prefer keeping the
package and updating `demoScript.ts` when the product spine changes.
