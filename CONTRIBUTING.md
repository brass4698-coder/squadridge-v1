# Contributing

## Branching

- `feature/<short-topic>` — new functionality
- `fix/<issue>` — bugfixes
- `docs/<topic>` — documentation only

Open PRs against `main`.

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
