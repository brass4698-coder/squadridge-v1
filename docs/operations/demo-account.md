# Demo account operations

The demo system uses **one Supabase account** plus **synthetic fixtures** for multi-role walkthroughs. Nothing here is live pilot traction.

**Interactive hub:** [`/demo`](http://localhost:5173/demo) (dev or `VITE_ENABLE_DEMO_LOGIN=true`)

---

## Supabase demo login

| Field | Default |
| ----- | ------- |
| Email | `demo@squadridge.com` |
| Password | `SquadRidgeDemo2026!` |

Override with `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`. Seed via:

```bash
node --env-file=.env.local scripts/seedDemo.mjs
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

---

## Walkthrough entry

1. **`/demo`** — credential reference + quick links (also in the site footer Access column when demo login is enabled)
2. **`/demo/start?demo=1`** — pick **role** + **scenario preset**, then begin tailored tour (auto-signs in with the demo account when needed)
3. **`/sign-in?demo=1`** — demo password login; omit `next` to open the role picker, or pass `next=/app/facilitator` (etc.) to land on a role dashboard
4. Role cards on `/demo` use **Sign in & open** when you are logged out — they do **not** bounce to magic-link-only sign-in

Roles: facilitator · participant · moderator · program lead · ombuds · executive

Scenario presets: mediation · restorative · community safety · ombuds · institutional · university · business · military · high-stakes conflict

**Pilot magic-link sign-in** still requires an invited work email. Local diligence without an invite should use the demo paths above.

---

## Governed demo credentials (`/enter/credential`)

| Token | Role lens | Matter (fixture) |
| ----- | --------- | ---------------- |
| `demo-facilitator-watershed` | Facilitator | North Watershed Consultation |
| `demo-participant-harbor` | Participant | Harbor District Restorative Circle |
| `demo-university-ombuds` | Ombuds | Campus Conduct Review |
| `demo-business-board` | Program lead | Joint Venture Wind-Down |
| `demo-military-unit` | Facilitator | Cross-Unit Readiness Assessment |
| `demo-conflict-track2` | Facilitator | Cross-Border Ceasefire Working Group |
| `demo-moderator-oversight` | Moderator | Portfolio safety signals |
| `demo-executive-brief` | Executive | Governance summary |

---

## Participant room (no DB seed required)

| Token | Path |
| ----- | ---- |
| `demo-token` | `/p/invite/demo-token` → consent → `/p/room/demo-token` → `/p/review/demo-token` |

Synthetic chat and codename context in `src/lib/participantToken.ts`.

---

## Seeded facilitator session (after `seedDemo.mjs`)

UUID: `11111111-1111-4111-8111-111111111111`

Tour steps: invite → verify → control → outcome → release

---

## Role dashboard paths

| Role | Path |
| ---- | ---- |
| Facilitator | `/app/facilitator` |
| Participant | `/app/participant` |
| Moderator | `/app/moderator` |
| Program lead | `/app/institution` |
| Ombuds | `/app/mediator` |
| Executive | `/app/executive` |

Demo users bypass `RoleProtectedRoute` to preview all dashboards (UI fixtures only).

---

## Env flags

| Variable | Effect |
| -------- | ------ |
| `VITE_ENABLE_DEMO_LOGIN` | Enable demo sign-in (on in dev by default) |
| `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` | Client login credentials |
| `VITE_V2_MOCK_DATA=true` | Fixture session list on facilitator `/app/sessions` |
| `VITE_ENABLE_DEMO_SQUAD` | Legacy offline session (retired in App.v2) |

---

## What is *not* demo-complete today

- **Separate auth accounts per role** — one demo user; role switcher changes UI lens only
- **Live participant rooms for seeded UUIDs** — need real DB rows + invites for production-like path
- **Legacy `/onboarding` tour** — soft-retired; use `/demo/start` instead
- **Moderator decrypt console** — `/admin/rooms` requires rostered moderator + live sessions

See [`docs/technical/demo-walkthrough.md`](../technical/demo-walkthrough.md) for tour step order.
