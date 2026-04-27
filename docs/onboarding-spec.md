# Onboarding specification

**Product flow:** [product/onboarding-flow.md](product/onboarding-flow.md)

**Implementation (routes, storage, Supabase):** [technical/onboarding-architecture.md](technical/onboarding-architecture.md)

**Product rules reflected in the app:**

- Top chrome uses a **linear progress bar** only (no step numbers).
- **Identity** and **Placement** (language / region / timezone) use **two-column** layouts at large breakpoints; other steps default to single column.
- **Logo + wordmark** appear above the card on the left via `OnboardingLayout`.
- **Back / forward** controls are arrow-forward (and optional text) patterns.
- Forward path: `/onboarding/mission` → … → `dryrun` (see `onboardingStepsConfig.ts`).
