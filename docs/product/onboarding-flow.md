# Onboarding Flow

**Engineering map:** How the `src/onboarding/` UI subtree relates to `/verify`, intent, and sessionStorage—see [`docs/technical/onboarding-architecture.md`](../technical/onboarding-architecture.md).

## Overview

The onboarding flow for MENDguild is designed to establish trust, explain the mechanics of verified anonymity, and set the tone for non-violent, structured dialogue [1]. This critical first step ensures that users understand the platform's purpose and the safeguards in place to protect their identity.

## Step 1: Norm-Setting and Principles

The journey begins by clearly explaining the platform's non-violence principles and the core mission of building bridges across global divides [1]. Users are introduced to the concept of the "Pluriverse of Peace," emphasizing diversity, accessibility, and human-centric design [2].

This stage focuses on setting expectations for the dialogue sessions. The UX copy emphasizes safety and reflection, preparing users for the structured digital dialogue frameworks they will encounter [1]. We avoid the urgent or alarmist language typical of traditional social platforms, instead using calm and measured tones to encourage the "Power of Pause" [2].

## Step 2: Verified Anonymity Explanation

A crucial part of onboarding is explaining the mechanics of verified anonymity without overwhelming the user with technical jargon [1]. We describe how zero-knowledge proofs (ZKPs) allow them to prove attributes like citizenship or organizational roles without exposing raw personally identifiable information (PII) [3].

The flow reassures users that their identity remains hidden, a vital feature for those in authoritarian or active conflict zones who face real danger if their views are exposed [3]. This explanation builds trust in the Enclave[ZK] privacy stack and the platform's commitment to "do no harm" principles [2].

## Step 3: Attribute verification (product vision vs current app)

**Product direction:** Long term, the experience may guide users through attribute checks using **zkTLS**-style flows—extracting proofs from secure web sources without handing raw documents to MENDguild [2]. That pipeline is **not implemented in the repository today**; treat it as roadmap until it ships in application code.

**Current implementation:** Verification uses **Semaphore** proofs in the browser and server-side verification via the **`verify-zk-proof`** Edge Function (`src/lib/zkAdapter.ts`, `supabase/functions/_shared/handleZkProofVerification.ts`). Copy in this step should match whatever scopes and UX the live onboarding actually runs (including demo/simulated language where appropriate). Engineering details and honesty about operator-visible metadata: [`docs/technical/zk-implementation.md`](../technical/zk-implementation.md), [`docs/security/threat-model.md`](../security/threat-model.md).

This step still aims to route users into appropriate dialogue based on **coarse** verified signals while avoiding raw PII in our stores [3], and to remain usable in low-bandwidth environments [3].

## Step 4: Introduction to In-App Interventions

Before entering a session, users are introduced to the platform's unique UX features designed to de-escalate tension [1]. They learn about the one-tap "Slow down" button, which pauses sending to allow for reflection, and the temporary "Pull back" feature for immediate message retraction [1].

The flow also explains the role of AI-assisted real-time translation and tone detection, highlighting how these tools gently suggest calmer wording and slow down hostile exchanges [1]. This preparation ensures that users are not surprised by these interventions and understand their purpose in fostering sustained empathy [1].

## References

[1] MENDguild Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
