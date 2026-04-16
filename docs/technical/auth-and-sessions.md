# Authentication and sessions

This document describes how SquadRidge uses Supabase Auth today, how anonymous sessions relate to magic-link (email) sessions, and what operators should configure before production.

## Session types in the app

| Mechanism | Where it is used | Production posture |
|-----------|------------------|-------------------|
| **Magic link** (`signInWithOtp`) | Onboarding verification, `AuthContext.signIn` | **Preferred** for durable, recoverable sessions tied to an email. |
| **Anonymous** (`signInAnonymously`) | `ensureAnonymousSession` in `src/lib/squad.ts` when no session exists | **Fallback / low-friction path** for demos and flows that need a `user_id` before email verification. Anonymous JWTs are **short-lived** and **not** a substitute for verified accounts in production rooms. |

See inline notes in `src/lib/squad.ts` and `src/contexts/AuthContext.tsx`.

## Anonymous → authenticated (email-verified) migration

**Goal:** A user who started as anonymous should end up with a **stable** Supabase user (email identity) without losing their `profiles` row, which is keyed by `auth.users.id`.

**How Supabase models this:** Anonymous users are normal `auth.users` rows with the anonymous provider. Linking an email (or OAuth) associates a **permanent** identity with that same user id when the linking flow completes successfully, so **`public.profiles.id` stays aligned** with `auth.uid()`.

**Documented product paths (intended):**

1. **Magic link from an existing session**  
   Onboarding’s verification step (`VerificationScreen`) calls `signInWithOtp` with `emailRedirectTo` pointing at `/auth/callback`. If the project is configured for identity linking, completing the OTP/magic-link step should attach the email identity to the current user. **Validate behavior** in your Supabase project (Auth settings: anonymous sign-in, identity linking, email confirmations).

2. **Email update on anonymous user**  
   Supabase also supports attaching email via `supabase.auth.updateUser({ email })`, followed by the user completing verification (OTP or link), depending on your [Auth email settings](https://supabase.com/docs/guides/auth/auth-email). Behavior can differ by Supabase version; treat the [anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) and [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking) guides as source of truth.

3. **OAuth**  
   For social login, use `linkIdentity` (see identity linking docs) where applicable.

**Operational caveat:** If a user completes magic link as a **new** user instead of linking, they may get a **different** `user_id` and an empty profile row. Before production, run through anonymous → verify in a staging project and confirm one user id end-to-end.

## Profile completeness and `role_archetype = other`

The canonical check is `isProfileComplete` in `src/lib/profile.ts`:

- `callsign` trimmed length ≥ 2  
- `role_archetype` non-empty  
- If `role_archetype === 'other'`, `role_other_detail` trimmed length must be within **8–80** characters (aligned with onboarding UI and `profiles.role_other_detail` in the database).

There is **no** separate “profile photo” or government-ID step in the schema; any such requirement would be a product change beyond current Postgres types (see migration `20260415120000_profiles_phase1.sql` and `docs/technical/schema.sql`).

## Magic-link redirects and `VITE_SITE_URL`

`getSiteUrl()` (`src/lib/env.ts`) uses `import.meta.env.VITE_SITE_URL` when set; otherwise in the browser it falls back to `window.location.origin`.

**Implications:**

- **Production:** Set `VITE_SITE_URL` to the canonical origin (e.g. `https://app.example.com`) so magic links and `getAuthCallbackUrl()` always target the correct host, matching [Supabase redirect URL allowlists](https://supabase.com/docs/guides/auth/redirect-urls).
- **Preview / staging (e.g. Vercel):** Each deployment host is a different origin unless you fix `VITE_SITE_URL` per environment. If unset, links go to the **preview** origin—which is often desired for testing, but **must not** be mistaken for production mail.

**Checklist:** For each deployed environment, set `VITE_SITE_URL` explicitly and add the corresponding `/auth/callback` URL under Supabase → Authentication → URL configuration.

## Staging validation (anonymous → magic link)

Run this on a **non-production** Supabase project before trusting production auth:

1. Enable **Anonymous** and **Email** providers; configure [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) for `https://<staging-host>/auth/callback` (and `http://localhost:5173/auth/callback` for local).
2. Set `VITE_SITE_URL` in the staging frontend to that host (Vercel env, etc.) so `getSiteUrl()` matches the tab origin.
3. Open the app, complete onboarding as anonymous, then send a magic link from the verification step.
4. After clicking the email link, confirm **`auth.users`** still has **one** row for the participant and `public.profiles.id` equals `auth.uid()` — no duplicate user from “new signup” instead of link.
5. Repeat once with `VITE_SITE_URL` intentionally wrong to see broken redirects; this documents why the variable is required for staging parity.
