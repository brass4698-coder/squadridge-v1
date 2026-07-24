# Guided demo walkthrough

The live product tour is an **App.v2 institutional spine**: public story → facilitator
workspace → seeded session control → outcome → release gate. Chrome includes directional
bubbles, a spotlight ring, and **Back / Next / Skip** controls.

Implementation lives in **`src/demo/`**.

## How to start

1. Ensure the demo account is seeded (`docs/operations/demo-account.md`).
2. Open `/sign-in` and choose **Try the Demo** (or visit `/sign-in?demo=1`).
3. After auth, the tour starts at `/?demo=1` and advances through `DEMO_MAIN_STEPS`
   in `src/demo/demoScript.ts`.

You can also call `startWalkthrough()` from `useDemoWalkthrough()` (see
`src/pages/admin/AdminDemoPage.tsx`).

## Chrome

| Control | Behavior |
| ------- | -------- |
| Direction bubble | Overlay copy + optional spotlight on `data-demo` / selector targets |
| **← Back** | Previous scripted step |
| **Next →** | Next scripted step (Space also advances when not typing) |
| **Skip** | Clears tour flag and returns to `/` |

`DemoLayout` is mounted from `PublicShell` and `AuthenticatedShell`.

## Script steps (summary)

Welcome → How it works → Security → Ledger → Facilitator dashboard → Sessions →
**Configure** (new session) → **Invite** → **Verify** (participant review) →
Session control (seeded live room) → Outcome draft → Release gate → Tour complete.

In-app pilot ops (live facilitators, not the demo tour): `/app/pilot-guide` with the
interactive Configure → Verify → Facilitate → Release walkthrough.

## Removing the tour

See historical notes in git history for deleting `src/demo/` entirely. Prefer keeping the
package and updating `demoScript.ts` when the product spine changes.
