# Demo flow

Guided demos use query parameters and optional demo squad flags — not a separate `/match/guided_demo` route.

**Canonical technical spec:** [technical/demo-walkthrough.md](technical/demo-walkthrough.md)

**Script and steps:** [../src/demo/demoScript.ts](../src/demo/demoScript.ts) and [../src/demo/README.md](../src/demo/README.md)

**Highlights:**

- Landing can start a scripted tour; onboarding uses `/onboarding/...?demo=1`.
- Match demo: **`/match?demo=1`** (requires demo shortcuts in production builds: `VITE_ENABLE_DEMO_SQUAD=true`; in local dev, shortcuts are on by default).
- Offline session UI: **`/session/demo-session-001`** (no backend required).
- Ledger sample: see demo proposal id in app constants and ledger page.
