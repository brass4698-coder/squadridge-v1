# `src/demo` — guided walkthrough

Scripted presenter tour (provider, step list, `DemoLayout`, auto-actions with human-paced **`type`** steps, minimal telemetry).

The main script includes the **full onboarding** wizard at `/onboarding?demo=1&owt=0` … `owt=5` (URL-synced), then **`/verify?demo=1`**, then intent → match → offline session (`/session/demo-session-001`) → ledger → security → profile.

**Mission (`ob=1`)** does not auto-advance — use **Next** / **Space** when ready. **Callsign, role, language, region, time window, tags, and era** are driven by **`DEMO_PERSONA`** in `demoPersona.ts` so onboarding and the profile step show the same story.

**How to remove the tour** (delete this folder and unwind integrations): see **`docs/technical/demo-walkthrough.md`** → *Removing the tour completely*.
