# Cursor / IDE tooling (SquadRidge)

Shareable editor and agent setup for this repo. Clone the repo, open it in Cursor
(or VS Code), and install recommended extensions when prompted.

## What is checked into the repo

| Path | Purpose |
| --- | --- |
| `.cursorrules` | Always-on summary of platform rules for agents |
| `.cursor/rules/*.mdc` | Scoped rules (`squadridge`, components, AI paths) |
| `.cursor/settings.json` | Cursor project plugins (Supabase enabled) |
| `.cursor/hooks.json` + `.cursor/hooks/*` | Project agent hooks (destructive shell + secret paste) |
| `.cursor/mcp.json` | Project MCP servers (Supabase HTTP MCP, no secrets) |
| `.agents/skills/*` | Vendored agent skills (Supabase + Postgres best practices) |
| `skills-lock.json` | Pinned skill source hashes |
| `.vscode/extensions.json` | Recommended VS Code / Cursor extensions |
| `.vscode/settings.json` | Shared workspace editor settings |
| `.editorconfig` | Cross-editor indentation / newline defaults |
| `.husky/` + `.lintstagedrc.json` | Git pre-commit lint/format (not Cursor-specific) |
| `AGENTS.md` / `CONTRIBUTING.md` | Human + agent orientation |

Authoritative privacy claims remain in [`docs/security/threat-model.md`](../security/threat-model.md).

## Plugins vs extensions

### Cursor Marketplace plugins (not binary blobs in git)

These install from Cursor’s marketplace / plugin UI. The repo only records
**enablement preference**, not the plugin package itself.

| Plugin | Repo signal | Notes |
| --- | --- | --- |
| **Supabase** | `.cursor/settings.json` → `plugins.supabase.enabled` | Preferred path for Supabase MCP + skills. Authenticate in Cursor Settings → MCP / Plugins when prompted. |

Marketplace plugins **cannot** be vendored as installable binaries in git. After
clone: open Cursor → confirm the Supabase plugin is enabled for this workspace →
complete OAuth if the MCP server shows “needs authentication”.

### VS Code / Cursor editor extensions (recommendations only)

Committed in `.vscode/extensions.json`. Cursor/VS Code will prompt to install.
These are marketplace IDs, not checked-in `.vsix` files:

- ESLint, Prettier, Tailwind CSS IntelliSense
- Vitest, Playwright
- Deno (for `supabase/functions`)
- GitHub Pull Requests
- Code Spell Checker (optional)

## MCP

Project file: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

- **Safe to commit**: public MCP URL only.
- **Never commit**: service role keys, personal access tokens, OAuth refresh tokens,
  or `.env` contents.
- **Personal / secret MCP servers**: keep in your user-global
  `~/.cursor/mcp.json` (Windows: `%USERPROFILE%\.cursor\mcp.json`), not in the repo.
- If both project and user configs define the same server name, **project wins**.

Optional local override pattern (not committed): put secrets only in user-global
config or OS env vars referenced by your local tooling — never hard-code them in
repo JSON.

## Hooks

Project hooks live in `.cursor/hooks.json` and run from the repo root.

| Event | Script | Behavior |
| --- | --- | --- |
| `beforeShellExecution` | `.cursor/hooks/protect-destructive-shell.mjs` | Denies force-push / hard reset / filter-history; asks on `supabase db push|reset`, function deploy, recursive deletes |
| `beforeSubmitPrompt` | `.cursor/hooks/scan-prompt-secrets.mjs` | Blocks prompts that look like pasted private keys, JWTs, or live API secrets |

Hooks reload when `hooks.json` is saved. If a hook does not appear, reload the
Cursor window and check the **Hooks** output channel. Scripts require Node 22+
(same as `package.json` `engines`).

## Agent rules and skills

1. Read `AGENTS.md` for stack orientation.
2. Follow `.cursor/rules/` (also summarized by root `.cursorrules`).
3. For Supabase work, use skills under `.agents/skills/` (and/or the Supabase
   Cursor plugin skills). Versions are pinned in `skills-lock.json`.

To refresh vendored Supabase skills from upstream (maintainers):

```bash
npx skills add supabase/agent-skills
```

Review the diff before committing — do not silently overwrite project-specific
guidance in `.cursor/rules/`.

## Cursor Automations (cloud — account-scoped)

Cursor Automations (scheduled / PR / Slack-triggered agents) live in the Cursor
product / team account. They are **not** stored as executable workflow files in
this git repo.

Recommended automations to create in the Cursor Automations UI (documented only):

| Name (suggested) | Trigger | Intent |
| --- | --- | --- |
| SquadRidge CI babysit | GitHub checks failed on PR | Diagnose failing CI job; propose minimal fix; do not force-push |
| SquadRidge PR hygiene | PR opened / pushed | Check privacy overclaims, raw hex in UI, missing RLS on new tables |
| SquadRidge migration review | PR touching `supabase/migrations/**` | Confirm append-only migration, RLS enabled, no secrets in SQL |

When drafting an automation, point it at **this repo** and prefer instructions that
reference committed docs (`AGENTS.md`, `docs/security/threat-model.md`) rather
than pasting secrets or private runbooks.

## What must stay user-local

| Item | Why |
| --- | --- |
| `.env`, `.env.*`, `supabase/functions/.env` | Secrets |
| `~/.cursor/mcp.json` with tokens | Personal credentials |
| `~/.cursor/hooks.json` | Personal hooks |
| Cursor Automations definitions | Account / team cloud config |
| Marketplace plugin binaries / cache under `~/.cursor/plugins/` | Installed locally |
| `.idea/` and personal `.vscode/*.code-workspace` | Personal IDE state |
| Global Cursor User `settings.json` | Personal editor prefs |

## Quick start (new clone)

1. `npm ci`
2. Copy env from README / `.env.example` — never commit filled env files
3. Open the folder in Cursor
4. Accept recommended extensions
5. Confirm Supabase plugin + MCP auth
6. Verify Hooks are listed under Cursor Settings → Hooks
7. Run `npm run lint` / `npm test` before relying on agent changes
