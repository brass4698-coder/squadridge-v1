## Summary

<!-- One sentence: what does this PR do? -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / code cleanup
- [ ] Docs / comments only
- [ ] CI / tooling
- [ ] Migration (append-only to `supabase/migrations/`)
- [ ] Design tokens / styles

## Checklist

- [ ] `npm run lint` passes (zero warnings)
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `npm run check:all` passes (prod-readiness, ZK stub, banned copy, DB types, etc.)
- [ ] New utilities in `src/utils/` or `src/lib/` have tests in `src/test/`
- [ ] No raw hex values in JSX/CSS — using `--sr-*` tokens or Tailwind aliases (`bg-surface`, `text-brand`, etc.)
- [ ] No second accent color introduced — `--sr-primary` is the only hue in UI chrome
- [ ] Motion/animation uses `--sr-ease-*` and `--sr-duration-*` tokens (or `animate-step-in` / `animate-fade-in` utilities)
- [ ] `AGENTS.md` rules respected (no `any`, no raw hex, migrations append-only, RLS on new tables)
- [ ] `CHANGELOG.md` updated under `[Unreleased]` for user-visible or API changes

## Security-touching change?

If this PR touches **RLS policies, migrations, Edge Functions, ZK proof paths, encryption, auth flows, or CORS/CSP config**, answer these:

- [ ] RLS: new tables have `enable row level security` and at least one policy in the migration
- [ ] ZK: `VITE_ZK_STUB` is `false` in the build artifact; `check:no-zk-stub-prod` passes
- [ ] Secrets: no new secrets are hardcoded; new secrets are added to `.env.example` with placeholder values
- [ ] CodeQL: no new high/critical findings introduced (check the Security tab after merge)
- [ ] Threat model still accurate — if not, update [`docs/security/threat-model.md`](../docs/security/threat-model.md)

## Screenshots / recordings (if UI change)

<!-- Drag and drop or paste here -->

## Related issues / links

<!-- Closes #___ -->
