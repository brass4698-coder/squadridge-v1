# Demo walkthrough (`src/demo/`)

Guided product tour for App.v2: side sheet, optional callout/spotlight, **Back / Next / Exit tour**.

- Script: `demoScript.ts` (`DEMO_MAIN_STEPS` + linear `tips`)
- Chrome: `DemoLayout.tsx` + `DemoOverlay.tsx` + `DemoExitConfirm.tsx`
- Provider: `DemoWalkthroughContext.tsx` / `DemoWalkthroughProviderImpl.tsx`
- Docs: `docs/technical/demo-walkthrough.md`

Start via **Try the Demo** on `/sign-in` (launches tour after auth), `/?demo=1`, or `startWalkthrough()`.
