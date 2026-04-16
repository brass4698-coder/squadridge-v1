# ZK demo / recording — staging checklist

Use before **recording a screen demo**, **live partner walkthrough**, or **staging review** where the story is “real zero-knowledge verification” (Semaphore in the browser + server verification), not the hash stub.

Authoritative implementation details: [`docs/technical/zk-implementation.md`](../technical/zk-implementation.md).

## Environment

- [ ] **`VITE_ZK_STUB`** is **unset** or explicitly **`false`** on the build that serves the demo URL. Production builds **fail** if stub is `true` ([`vite.config.ts`](../../vite.config.ts)); staging should match the same policy for honest demos.
- [ ] **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_PUBLISHABLE_KEY`** (or legacy anon JWT) are set so the app is not in the “Supabase not configured” state on [`/verify`](../../src/pages/VerificationPage.tsx).

## Edge Function

- [ ] **`verify-zk-proof`** is **deployed** to the Supabase project the app points at (see [`.github/workflows/deploy-supabase-production.yml`](../../.github/workflows/deploy-supabase-production.yml); local: `supabase functions deploy verify-zk-proof`).
- [ ] You can complete verification end-to-end once (same project) to confirm the function accepts a real Semaphore-shaped payload.

## Visual integrity signal

- [ ] After load, **`ZkStubBanner` is not shown** ([`src/components/ZkStubBanner.tsx`](../../src/components/ZkStubBanner.tsx)). If the amber **“ZK stub mode”** bar appears, the demo is **hash-only**, not Semaphore + Edge—fix env and rebuild before recording.

## Optional

- [ ] **`VITE_ZKTLS_LABS`** is **unset** or **`false`** unless you are explicitly demoing the research disclaimer (zkTLS is **not** shipped; see [`docs/technical/rfc-zktls-attribute-proofs.md`](../technical/rfc-zktls-attribute-proofs.md)).
- [ ] Demo script and talking points: [`zk-verify-demo-script.md`](zk-verify-demo-script.md).
