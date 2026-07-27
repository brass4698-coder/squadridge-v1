# SquadRidge founding north star

This document anchors product and engineering decisions. It is for contributors — not
public marketing copy.

## Why this exists

Most dialogue fails not because people are unwilling to talk, but because the conditions
are wrong: the room is unsafe, the process has no structure, and the outcome is
unverifiable.

SquadRidge is infrastructure for the opposite — rooms where people can speak without
fear of exposure, and where what gets released is worth standing behind.

## Personal founding intent

SquadRidge was built by someone who learned how fragile trust is — how quickly blame
can travel, and how the wrong tool can end a conversation before it starts.

The platform exists so that when people need to fix something real — a land dispute, a
broken institution, a line no one can cross safely — the room stays protected, the
process stays structured, and the outcome can be verified without exposing who said what.

That work is worth doing. Building honest, protective infrastructure for dialogue is a
way to put something constructive into the world.

## Decision tests

Before shipping a feature, copy change, or partnership, ask:

1. **Uniqueness** — Does this strengthen room/record separation, or blur it?
2. **Versatility** — Does this help another real context without becoming a generic chat app?
3. **Security** — Can we state the privacy property honestly in `docs/security/threat-model.md`?
4. **Adaptability** — Does the facilitator stay in control of judgment and release?
5. **Real impact** — Does this help produce a verifiable outcome for an actual dispute or institution?
6. **Founding purpose** — Does this protect vulnerable people in the room — not expose them?

If a change fails test 3 or 6, it does not ship.

## Public vs private narrative

- **Public (About, landing):** Values-forward origin story — protected dialogue, honest limits, facilitator control. See `squadridge_platform_spec.json` → `founding_narrative`.
- **Private (this file):** Full founding intent for contributors.
- **Never:** Fabricated testimonials, overclaimed encryption, alarmist copy.
