# Private / non-served materials

Files here are **not** copied into the Vite/Vercel static root.

- Pitch deck HTML/CSS/JS for briefings live under `supabase/functions/serve-deck/static/` and are only reachable through the `serve-deck` Edge Function after `has_deck_access()`.
- Legacy prompt-pack notes may sit here for editors; they must never be placed under `public/`.
