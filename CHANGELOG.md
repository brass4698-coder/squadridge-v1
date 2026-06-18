# Changelog

All notable changes to SquadRidge are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- `AGENTS.md` — developer context file: stack reference, directory map, and coding rules
- `codeql.yml` — CodeQL static analysis on push, PR, and a weekly schedule
- `tokens.css` v2 — motion timing tokens (`--sr-ease-*`, `--sr-duration-*`, `--sr-transition`),
  layered elevation shadows (`--sr-shadow-xs/sm/md/lg`), OKLCH alpha blending for `--sr-primary-soft`,
  `--sr-bg-accent` surface, `--sr-border-alpha`, `--sr-focus-ring`, and radius tokens
- `tailwind.config.ts` — `borderRadius` bridge to `--sr-radius-*` tokens, `boxShadow` bridge to
  `--sr-shadow-*` tokens, `transitionTimingFunction` spring/ease-out/standard utilities,
  `transitionDuration` fast/normal/slow/xslow utilities, `fade-in`/`slide-up`/`slide-in-right`
  keyframes + animations, `surface.accent` and `line.alpha` color aliases

### Changed
- Stale default GitHub workflow templates (`jekyll-docker.yml`, `webpack.yml`,
  `npm-publish-github-packages.yml`, `deno.yml`) replaced with disabled stubs and comments
  explaining why they are not used

### Fixed
- `npm-publish-github-packages.yml` node-version bumped from 20 → 22 to match CI

## [0.0.1] — 2026-06-01

### Added
- Initial SquadRidge platform: verified anonymous dialogue, ZK identity layer,
  squad matchmaking, conversation sessions, tamper-evident ledger
- 42 Supabase migrations covering all core tables with RLS
- Full CI pipeline: lint, typecheck, Vitest, Playwright e2e, security audit, pgTAP
- Deployment pipelines: Vercel (frontend), Supabase Cloud (DB + Edge Functions)
