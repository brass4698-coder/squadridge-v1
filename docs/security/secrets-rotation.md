# Secrets rotation guidance

This document describes how to rotate Supabase credentials and GitHub Actions secrets for SquadRidge. It complements the operational threat model in [`threat-model.md`](threat-model.md) and the repo README (env vars and CI).

**Official references:** [Understanding API keys](https://supabase.com/docs/guides/api/api-keys) · [Postgres passwords / project password](https://supabase.com/docs/guides/database/managing-passwords) · [GitHub: encrypted secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

## Scope of secrets in this repo

| Secret / variable | Where it lives | Purpose |
| ----------------- | -------------- | ------- |
| Publishable key (`sb_publishable_...`) or legacy `anon` JWT | App build env (host + local `.env`) | Client → Supabase Data API (`VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`) |
| Secret key (`sb_secret_...`) or legacy `service_role` JWT | Backend only (never `NEXT_PUBLIC_` / never browser) | Elevated access; do not ship in the Vite frontend |
| Project URL | App build env | `VITE_SUPABASE_URL` |
| `postgres` database password | Supabase Dashboard → Database; GitHub `SUPABASE_DB_PASSWORD` | CLI `supabase link`, migrations CI |
| Supabase PAT | GitHub `SUPABASE_ACCESS_TOKEN` | CI authentication (`sbp_*` classic token for CLI) |
| Project ref | GitHub `SUPABASE_PROJECT_ID` | 20-character subdomain only (same as in `https://<ref>.supabase.co`) |

Production frontend builds also need **`VITE_SITE_URL`** set to the deployed origin (magic links). See [`README.md`](../../README.md).

---

## 1. Rotate Supabase API keys (publishable / secret / legacy JWT)

### Prefer the dashboard: API Keys

1. Open **[Project Settings → API Keys](https://supabase.com/dashboard/project/_/settings/api-keys)** (pick your project).
2. **Publishable key (client-safe):** Create or rotate as needed. Copy the new value into every place that builds or runs the app with Supabase:
   - Hosting provider (Vercel, Netlify, Cloudflare Pages, etc.)
   - Local developer `.env` files (never commit)
   - Any CI that builds with real keys (this repo’s `deploy-frontend` workflow uses placeholders; real deploys usually set env on the host)
3. **Secret key (server-only):** Prefer **separate secret keys per backend component** so one leak does not force a global rotation. Create a new key, deploy configs that use it, then **delete** the old secret key in the dashboard once traffic has moved.

### Legacy `anon` / `service_role` JWT keys

Legacy keys are tied to the project JWT secret; rotating them is heavier than rotating `sb_publishable_` / `sb_secret_` keys. Supabase recommends **migrating to publishable and secret keys** and using the dashboard indicators to confirm legacy keys are unused before deactivating them. See the [API keys guide](https://supabase.com/docs/guides/api/api-keys) (sections on legacy keys and rotation).

**Rules that do not change when rotating:**

- Never put `service_role` or any **secret** key in client bundles or public repos.
- RLS remains the real data gate for `anon` / publishable traffic; rotating keys does not fix bad policies.

### After rotating publishable / client keys

- [ ] New key updated on **all** deployment environments (staging + production if applicable).
- [ ] Teammates notified to refresh local `.env` (use a password manager or secure channel — not Slack/email for raw secrets).
- [ ] Smoke-test the app: auth, Realtime, and any flows that call Supabase from the browser.
- [ ] Old secret keys **removed** in the dashboard after cutover (irreversible once deleted).

---

## 2. Rotate the database (`postgres`) password

The project password is the **`postgres` role** password. Change it when someone with access leaves, after suspected leak, or on your security calendar.

1. In Supabase: **[Project Settings → Database](https://supabase.com/dashboard/project/_/database/settings)** (or **Database → Settings** depending on dashboard layout) → set a **new strong password** (password manager–generated).  
   Per [Supabase docs](https://supabase.com/docs/guides/database/managing-passwords), changing this password does **not** cause platform downtime; managed services pick up the new password. External tools using a **stored** connection string must be updated manually.

2. **Update GitHub Actions** repository secret **`SUPABASE_DB_PASSWORD`** to the new value:  
   Repo → **Settings** → **Secrets and variables** → **Actions** → edit `SUPABASE_DB_PASSWORD`.  
   This keeps [`.github/workflows/deploy-supabase-production.yml`](../../.github/workflows/deploy-supabase-production.yml) able to run `supabase link` and apply migrations.

3. **Developers:** Update local workflows that use the DB password (e.g. `supabase link --password`), and any saved connection strings / SQL clients. If the password contains special characters, **percent-encode** it in URIs (see [managing passwords](https://supabase.com/docs/guides/database/managing-passwords)).

4. **Optional hardening:** For third-party services, prefer a **dedicated Postgres role** per integration rather than sharing the primary `postgres` password (see same Supabase doc).

### After rotating the DB password

- [ ] GitHub secret `SUPABASE_DB_PASSWORD` matches the dashboard.
- [ ] **Deploy Supabase to production** workflow (or manual `supabase link` + migration) succeeds.
- [ ] No stale copies in notes, tickets, or shared docs (rotate again if they were exposed).

---

## 3. Rotate GitHub repository secrets

### How to update a secret

GitHub does not show previous values. To rotate:

1. Repo → **Settings** → **Secrets and variables** → **Actions**.
2. **Update** the secret (or delete and re-add with the new name/value).
3. Re-run the relevant workflow to confirm (e.g. push to `main` or **Actions** → run workflow).

Use **environment** or **repository** secrets consistently with how workflows reference them (`secrets.NAME`). Forks do **not** receive parent repo secrets on `pull_request` workflows.

### Secrets this repo expects (from README / workflows)

| Secret | Rotate when | How to obtain replacement |
| ------ | ----------- | ------------------------- |
| `SUPABASE_ACCESS_TOKEN` | PAT leaked, offboarding, periodic policy | [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens) — use a **classic** PAT (`sbp_*`). Experimental `sbp_v0_*` tokens are rejected by our CI; see workflow comments. |
| `SUPABASE_DB_PASSWORD` | Same as §2 | New password from Database settings |
| `SUPABASE_PROJECT_ID` | Rarely (only if wrong value was stored) | 20-char **project ref** only, from project URL |

Frontend builds that need real Supabase URLs/keys are typically configured on the **host** (not only GitHub), unless you add env vars to workflows yourself.

### After rotating GitHub secrets

- [ ] Workflow run green for **Deploy Supabase to production** (if migrations are part of your release).
- [ ] No duplicate “old” tokens left active in Supabase (revoke old PATs after cutover).

---

## 4. Incident-oriented notes

- **Leaked `service_role` or secret key:** Create a new secret key, redeploy all backends using it, delete the compromised key; assume data exfiltration possible until reviewed.
- **Leaked publishable/anon key:** Rotate the publishable key; treat as exposure of “public” surface — RLS and auth still matter.
- **Supabase may revoke keys** found in public GitHub repos (secret scanning). Keep keys out of git and use CI/host secrets.

---

## Team checklist — rotating secrets (copy for tickets)

Use this for any rotation (scheduled or incident). Assign an **owner** and a **verifier**.

### Before

- [ ] Reason documented (calendar, offboarding, suspected leak, vendor change).
- [ ] List of systems to touch: Supabase Dashboard, GitHub repo secrets, frontend host(s), local dev `.env`, any runbooks.
- [ ] Maintenance window communicated if user-visible impact is possible (e.g. brief failures if keys mismatch during cutover).

### During

- [ ] **API keys:** New publishable/secret values generated in Dashboard; old secret keys removed after cutover.
- [ ] **Database password:** Updated in Dashboard; `SUPABASE_DB_PASSWORD` and developer tooling updated.
- [ ] **GitHub:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and any other affected `secrets.*` updated.
- [ ] **Frontend host:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or legacy anon), `VITE_SITE_URL` verified.
- [ ] Old PATs/revoked keys invalidated in Supabase where applicable.

### After

- [ ] CI green (Supabase deploy workflow + any frontend pipeline you use).
- [ ] Smoke test: login, realtime, critical user paths.
- [ ] Internal doc or ticket closed with date and scope (not the secret values).

---

## Related internal docs

- [`threat-model.md`](threat-model.md) — trust boundaries and what client vs server must protect  
- [`../operations/production-checklist.md`](../operations/production-checklist.md) — production env checks  
- [`../../supabase/README.md`](../../supabase/README.md) — linking CLI, migrations, workflow secrets  
