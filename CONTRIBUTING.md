# Contributing

## Branching

- `feature/<short-topic>` — new functionality
- `fix/<issue>` — bugfixes
- `docs/<topic>` — documentation only

Open PRs against `main`. **Do not push security-touching commits straight to `main`** even if you have direct push access — see the "Security-touching change?" section of the [PR template](.github/pull_request_template.md). The repo owner should also enable branch protection for `main` (require PR + green CI before merge); see [`docs/operations/branch-protection.md`](docs/operations/branch-protection.md).

## Development setup

1. Node 20+
2. `npm ci`
3. Copy env per README; never commit secrets
4. `npm run dev`

Optional local tooling can live under `.agents/` (gitignored).

## Checks

- `npm run lint` — ESLint (flat config: `eslint.config.mjs`)
- `npm run build` — TypeScript + Vite production build
- `npm test` — Vitest

Pre-commit runs **lint-staged** (ESLint + Prettier on staged files). Husky is installed via the `prepare` script.

## PR checklist

See `.github/pull_request_template.md`.

## Security

Report vulnerabilities per root [`SECURITY.md`](SECURITY.md), not public issues.

