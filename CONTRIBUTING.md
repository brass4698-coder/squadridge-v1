# Contributing

## Branching

- `feature/<short-topic>` — new functionality
- `fix/<issue>` — bugfixes
- `docs/<topic>` — documentation only

Open PRs against `main`. **Don't push security-touching commits straight to `main`** even
if you have direct push access — see the "Security-touching change?" section of the
[PR template](.github/pull_request_template.md). Branch protection for `main` (require PR
+ green CI before merge) is documented in
[`docs/operations/branch-protection.md`](docs/operations/branch-protection.md).

## Development setup

1. Node.js 22+ and npm 10+ (see `engines` in `package.json`)
2. `npm ci`
3. Copy env per README — never commit secrets
4. `npm run dev`

## Checks

Run these locally before pushing:

```bash
npm run lint        # ESLint zero-warnings (flat config: eslint.config.mjs)
npm run build       # TypeScript + Vite production build
npm test            # Vitest unit tests
npm run check:all   # All prod-readiness checks in sequence
```

Pre-commit runs **lint-staged** (ESLint + Prettier on staged files).
Husky is installed automatically via the `prepare` script on `npm install`.

## PR checklist

See [`.github/pull_request_template.md`](.github/pull_request_template.md) —
it's filled out on every PR so nothing gets missed.

## Security

Report vulnerabilities per [`SECURITY.md`](SECURITY.md), not as public issues.
