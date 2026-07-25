# Launch checklist — conflict prevention positioning

Run before major external comms or a diligence push.

## Messaging

- [ ] [`CURRENT_STATUS.md`](../../CURRENT_STATUS.md) matches claims on the landing page, [`README.md`](../../README.md), and pitch materials.  
- [ ] Pitch Deck Hub [INITIAL_MESSAGING](../../src/pitch-deck-hub/initialState.ts) and [messaging framework](../business/messaging-framework.md) are consistent.  
- [ ] No unqualified public promise of CSI accuracy, public feeds, or “lives saved at scale” without [`prevented-incident-methodology.md`](prevented-incident-methodology.md) / partner sign-off.  
- [ ] Internal CSI console [`/admin/csi`](../../src/App.tsx) is understood as **moderator-only** (rostered users).

## Documentation

- [ ] [Data room index](../business/data-room-index.md) links are valid.  
- [ ] [Conflict prevention thesis](../business/conflict-prevention-thesis.md) and [CSI spec](../product/conflict-severity-index.md) align on shipped vs roadmap.

## Product

- [ ] Migration `20260427120000_conflict_severity_index.sql` applied in the target Supabase project.  
- [ ] `npm run build` and `npm test` pass locally; CI green on `main`.  
- [ ] Gated briefing HTML (e.g. conflict-prevention-thesis) loads via `/decks` after grant — not via raw `/pitch-deck-hub/*.html`.

## Sign-off (optional)

- Owner: [name] Date: [ ]
