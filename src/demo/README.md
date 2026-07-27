# Demo walkthrough (`src/demo/`)

Guided product tour for App.v2: **spotlight + adjacent callout**, corner progress pill,
dismissible badge, **Back / Next / Exit**.

- Script: `demoScript.ts` (`DEMO_MAIN_STEPS` + linear `tips`)
- Chrome: `DemoLayout.tsx` + `DemoOverlay.tsx` + `DemoExitConfirm.tsx`
- Provider: `DemoWalkthroughContext.tsx` / `DemoWalkthroughProviderImpl.tsx`
- Styles: scoped under `body[data-demo-active]` / `.demoActive` in `globals.css`
- Docs: `docs/technical/demo-walkthrough.md`

Start via **/demo** → role start, **Try the Demo** on `/sign-in`, `/?demo=1`, or
`startWalkthrough()`.
