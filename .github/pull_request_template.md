## Summary

<!-- What changed and why (1–3 sentences). -->

## How to test

<!-- Commands, routes, or data setup. -->

## Checklist

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build` (production env expectations: no `VITE_ZK_STUB` in prod)
- [ ] `node scripts/check-prod-readiness.mjs` (when touching Edge functions, migrations, hosting headers, or env)
- [ ] Screenshots or Loom if UI-facing (optional)

## Security-touching change?

Tick all that apply. If **any** are ticked, link the relevant section of [`docs/security/threat-model.md`](../docs/security/threat-model.md) and confirm the claims in §5 still hold.

- [ ] Modifies RLS policies, migrations, or table grants
- [ ] Adds/changes an Edge Function (especially anything writing with the service role)
- [ ] Touches authentication, session, or anonymous-to-verified flows
- [ ] Touches ZK / Semaphore code paths or `VITE_SEMAPHORE_DEMO_GROUP`
- [ ] Touches encryption/decryption (`messageCrypto`, `messagePayload`, `liveMessageRedaction`, moderator decrypt)
- [ ] Adds new public copy that could overstate privacy properties (run `npm run check:banned-copy`)

If you ticked any of the above, do **not** merge straight to `main` — go through PR review even if you have direct push access.
