# Contributing

## Cursor / AI rules

Platform conventions for agents and editors live in **`.cursor/rules/`**:

- `squadridge.mdc` — security, Supabase, privacy honesty, network behavior
- `component-rules.mdc` — UI components, accessibility, de-escalation UX
- `ai-guidelines.mdc` — optional translation/AI pipelines

Root `.cursorrules` and `AGENTS.md` summarize these. Privacy claims must match `docs/security/threat-model.md`.

**Shared Cursor / VS Code tooling** (hooks, MCP template, recommended extensions,
plugins, automations guidance): [`docs/operations/cursor-tooling.md`](docs/operations/cursor-tooling.md).
Do not commit secrets into `.cursor/mcp.json` or env files.

## Branching

- `feature/<short-topic>` — new functionality
- `fix/<issue>` — bugfixes
- `docs/<topic>` — documentation only
- `refactor/<topic>` — internal restructuring, no behaviour change

Open PRs against `main`. **Don't push security-touching commits straight to `main`** even
if you have direct push access — see the "Security-touching change?" section of the
[PR template](.github/pull_request_template.md). Branch protection for `main` (require PR
+ green CI before merge) is documented in
[`docs/operations/branch-protection.md`](docs/operations/branch-protection.md).

### SquadRidge pillar branch naming

Use these prefixes to keep branch intent clear as the five platform pillars are built out:

| Branch | Pillar |
| ------ | ------ |
| `feature/csi-scoring-edge-function` | Detect — Conflict Severity Index |
| `feature/two-sided-squad-enforcement` | Verify — ZK two-sided matching |
| `feature/session-phase-state-machine` | Dialogue — structured session phases |
| `feature/mediator-alert-queue` | Intervene — threshold-based mediator activation |
| `feature/session-outcome-ledger` | Measure — ledger record at session close |

Other examples:

```
feature/mediator-alert-queue
fix/session-threshold-bug
fix/zk-stub-prod-leak
refactor/alert-service-types
docs/branch-protection-setup
```

## Development setup

1. Node.js 22+ and npm 10+ (see `engines` in `package.json`)
2. `npm ci`
3. Copy env per README — never commit secrets
4. `npm run dev`

### WebStorm daily loop

If you use WebStorm as your IDE:

1. **Clone** the repo via Git → Clone. Open as project.
2. **Pull latest `main`** before starting any task (Git → Update Project).
3. **Create a branch** for the task (Git → New Branch → `feature/<topic>`).
4. **Make changes**, commit in the Git panel with a clear message.
5. **Push branch** (Git → Push).
6. **Open a PR** on GitHub into `main`. CI runs automatically.
7. **Merge** only after CI is green and review is approved.

Pre-commit hooks (Husky + lint-staged) run ESLint + Prettier on staged files
automatically when you commit via the WebStorm Git panel.

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

## Codespaces + Live Share

Reserve GitHub Codespaces for synchronous collaboration or shared debugging only
(e.g. ZK verification flow review, mediator onboarding demos). For everyday solo
work, WebStorm + local repo is faster.

To start a Live Share session: open the repo in a Codespace, install the Live Share
extension, click Share, and send the generated link. Sessions can be made read-only
for observers.

## Security

Report vulnerabilities per [`SECURITY.md`](SECURITY.md), not as public issues.
