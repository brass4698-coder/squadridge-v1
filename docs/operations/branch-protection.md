# Branch protection (`main`)

> **Status: settings applied** — verified 2026-06-30. Re-check after any policy change.

Goal: stop security-touching commits (RLS, migrations, Edge functions, ZK, encryption, auth) from landing on `main` without CI passing and at least one review. This is a **GitHub configuration step** — there is no in-repo enforcement that can replace it.

The repository owner (or any account with **admin** access on this GitHub repository) should run through this checklist once and re-check after any policy change.

## 1. Enable branch protection on `main`

GitHub → **Settings → Branches → Add branch protection rule**.

| Setting                                                          | Value                                               |
| ---------------------------------------------------------------- | --------------------------------------------------- |
| Branch name pattern                                              | `main`                                              |
| Require a pull request before merging                            | **on**                                              |
| Required approvals                                               | **1** (or 2 for security-touching)                  |
| Dismiss stale pull request approvals when new commits are pushed | **on**                                              |
| Require status checks to pass before merging                     | **on**                                              |
| Require branches to be up to date before merging                 | **on**                                              |
| Required checks                                                  | `build`, `e2e`, `db`, `security` (exact job names from `.github/workflows/ci.yml`) |
| Require conversation resolution before merging                   | **on**                                              |
| Require linear history                                           | **on** (enforces rebase/squash, keeps history clean) |
| Do not allow bypassing the above settings                        | **on**                                              |
| Allow force pushes                                               | **off**                                             |
| Allow deletions                                                  | **off**                                             |

Save. Verify the rule is listed and applies to **all** matching branches.

> **CI job names** — the four jobs in `.github/workflows/ci.yml` are exactly:
> `build`, `e2e`, `security`, `db`. If any job is renamed in `ci.yml`, update
> the required-check list in the same PR or `main` will silently lose protection.

## 2. Configure repository merge settings

GitHub → **Settings → General → Pull Requests**.

- Allow **squash merging** (default for squash commit message: "Pull request title and description").
- Disallow **merge commits** (keeps history readable; optional).
- Allow **rebase merging** if the team prefers linear history.
- Enable **Automatically delete head branches** so feature branches are cleaned up post-merge.

## 3. Required CI jobs

The `CI` workflow ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) defines jobs that must each be selected as required checks above:

- `build` — lint, banned-copy check, prod-readiness check, no-zk-stub-prod, tests, production build
- `e2e` — Playwright smoke tests against the production build
- `db` — local Supabase stack with all migrations applied, database types drift check, pgTAP database tests, Edge function bundle
- `security` — dependency review on pull requests (blocks newly introduced high/critical advisories); informational production `npm audit` summary

If a check renames in `ci.yml`, update the required-check list in the same PR or `main` will silently lose protection.

## 4. Optional but recommended

- **CODEOWNERS** in `CODEOWNERS` (repo root) — security-touching paths (`supabase/migrations/`, `supabase/functions/`, `src/lib/messageCrypto.ts`, `src/lib/zk/`, `src/lib/moderation/`, `docs/security/`, `.github/workflows/`) already require `@brass4698-coder` sign-off per the updated `CODEOWNERS` file.
- **Required signed commits** if the team is comfortable with the GPG/SSH workflow.
- **Restrict who can push to matching branches** so only the maintainers' team is allowed to merge, even if everyone has Write access.

## 5. Self-check after enabling

1. Push a benign commit on a feature branch.
2. Open a PR against `main`.
3. Confirm: PR cannot merge until CI is green; cannot bypass with admin merge unless "Do not allow bypassing" is off.
4. Try a direct `git push origin main` from the maintainer account — should be **rejected** by the protection rule.

If the direct push succeeds, one of the rule settings above is missing — usually "Do not allow bypassing the above settings".

## 6. Why this matters

The recent commit `832063c` revoked direct client INSERTs into `messages` and shipped a new Edge Function. Without the deploy workflow's bundle step (added in the same change), prod would have been unable to persist any chat messages. Branch protection + required CI catches the next instance of this kind of cross-module load-bearing change before it reaches `main`.
