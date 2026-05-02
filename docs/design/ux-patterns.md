# UX Patterns

## Overview

The User Experience (UX) patterns in SquadRidge are designed to establish trust, facilitate structured dialogue, and de-escalate tension [1]. By prioritizing safety and reflection, these patterns counteract the rapid reaction times demanded by traditional social platforms, fostering an environment of verified-anonymous, cross-border dialogue [1].

## Core Patterns

### 1. The "Power of Pause"

This pattern emphasizes reflection and collective wellbeing, slowing down hostile exchanges [2]. It is the foundational UX principle for de-escalation [1].

*   **Implementation**: A one-tap "Slow down" button allows users to pause sending a message if they feel it is escalating [1].
*   **Implementation**: A temporary "Pull back" feature provides immediate message retraction, typically available for 5 seconds after sending [1].
*   **Purpose**: This intervention gently suggests calmer wording and allows users to reconsider their tone [1].

### 2. Norm-Setting and Guided Onboarding

The onboarding flow prioritizes norm-setting by clearly explaining the platform's non-violence principles and the mechanics of verified anonymity [1].

*   **Implementation**: UX copy emphasizes safety and reflection, avoiding urgent or alarmist language [1].
*   **Implementation**: Users are introduced to the concept of the "Pluriverse of Peace," emphasizing diversity and accessibility [2].
*   **Purpose**: This establishes a baseline of trust and sets expectations for the dialogue sessions.

### 3. In-Room Prompts and Structured Dialogue

In-room prompts actively guide users through structured digital dialogue frameworks [1]. This moves the conversation away from chaotic broadcasting toward meaningful connection.

*   **Implementation**: Prompts such as exploring mutual fears and shared goals are surfaced during the session [1].
*   **Implementation**: AI-assisted real-time translation and tone detection provide feedback on the dialogue's health [1].
*   **Purpose**: This fosters sustained empathy and helps users navigate difficult conversations safely [1].

### 4. Verified Anonymity Indicators

Users need constant reassurance that their identity is protected, especially those in authoritarian or active conflict zones [3].

*   **Implementation**: Clear visual indicators confirm that a user's attributes (e.g., citizenship, organizational role) have been verified via zero-knowledge proofs (ZKPs) without exposing personally identifiable information (PII) [1].
*   **Implementation**: The interface clearly distinguishes between verified attributes and public identity [3].
*   **Purpose**: This builds confidence in the Enclave[ZK] privacy stack and encourages participation [1].

## Design System Integration

These UX patterns are supported by the SquadRidge design system, which relies on a dark, calm "global civic" aesthetic [1]. The deep navy background (`#0A0F1E`) and teal (`#0E9AA7`) accents signal stability and warmth, while typography utilizes Space Grotesk or DM Sans to ensure clarity and neutrality [1].

> Implementation note: the **active** code tokens live in [`src/styles/tokens.css`](../../src/styles/tokens.css) and [`tailwind.config.ts`](../../tailwind.config.ts). The narrative palette above (`#0A0F1E` / `#0E9AA7` / Space Grotesk / DM Sans) is the marketing description; new code should use the slate-teal `--sr-primary` (`#2f8f86`), the IBM Plex stack, and the `bg-surface*` / `border-line` / `text-ink*` / `bg-brand*` Tailwind classes instead of inline hex.

## Loading, empty, and error state convention

Every flow should ship complete loading / empty / success / error states (per [`.cursorrules`](../../.cursorrules)). Three primitives in [`src/components/system/`](../../src/components/system) capture the canonical shapes:

| Primitive | When to use |
| --- | --- |
| [`RouteSkeleton`](../../src/components/system/RouteSkeleton.tsx) | Suspense fallbacks, auth gates, and any route-level "the page is mounting" state. Replaces bare `Loading…` text. |
| [`SessionPageAuthSkeleton`](../../src/components/session/SessionPageSkeleton.tsx) | Specifically for routes that destination-render `SessionPage` (the visual continuity matters). |
| [`EmptyState`](../../src/components/ui/EmptyState.tsx) | Final, terminal "no data yet" surfaces (Match `no_pool`, Session hub when not in a squad, dialogues with no history, mod dashboard with no rows). Always include a CTA. |
| [`InlineSpinner`](../../src/components/system/InlineSpinner.tsx) | In-button pending state for async submits; pair with `aria-busy` on the button and a textual label like "Saving…". |

### Errors

- **Blocking errors** (the user must do something to recover): inline panel with `role="alert"`. Examples: invite-required gate, profile incomplete, RLS-denied write.
- **Transient / background errors** (we kept going, but the user should know): toast via the project Sonner instance. Examples: report submission retry, connection blip.
- **Page-level catastrophic errors**: route error boundary. Never replace these with a plain spinner.

### Skeletons vs spinners

- Prefer **skeletons** when the layout is known and the load is expected to be > ~300 ms. Skeletons preserve layout, don't induce CLS, and feel calmer than a spinner at the page level.
- Prefer **spinners** only when the load fits inside a small surface where a skeleton would be visually noisy (in-button submits, micro-cards).

### Implementation contract

Every screen in the demo path (onboarding → verify → intent → match → session) MUST render visible feedback within 250 ms of any async action — either a primitive above or a screen-specific skeleton. Bare "Loading…" text is not acceptable in a polished walkthrough.

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
