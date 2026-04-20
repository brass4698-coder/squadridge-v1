# Squadridge — how to explain it

This page is the default **spoken and written** spine for describing Squadridge. Public copy and pitches must not promise stronger privacy than [Operational threat model](security/threat-model.md) §5 (“Claims that hold today”).

---

## Primary audience (use this default)

**Default listener: general / prospective user** — lead with *problem, outcome, and safety in plain language*. Use the **one-liner** and **~30 seconds** blocks below first.

When the listener is different, keep the same order (problem → what Squadridge does → proof of belonging without oversharing → structured session → output), but shift emphasis:

| Audience        | Emphasis |
| --------------- | -------- |
| **Investor / partner** | Cross-border, high-stakes dialogue as a wedge; verification + structured workflow + citable outputs as differentiation; name adoption and trust risks briefly. |
| **Engineer / security** | Stack (React, Vite, Supabase); Semaphore verification path; point to [threat model](security/threat-model.md) for encryption and operator visibility. |

---

## One sentence

**Squadridge matches people into short, structured squad sessions across borders and languages—you prove you belong in the room without handing your real-world identity to the chat, and you leave with a concrete proposal-style output, not just a transcript.**

---

## ~30 seconds

Cross-border collaboration often forces a tradeoff: open platforms leak context; closed groups exclude the right expertise. Squadridge is a verified-anonymous dialogue platform: you verify once in a way that shows you’re allowed in the room without us storing your name or location as the price of admission. We match you into a time-bounded squad that fits the problem, with translation and calm, de-escalation-first design. When the session ends, the point is a **document you can stand behind**—citable and structured—not a raw chat log.

*Differentiator to name if you only have one breath:* **verification without doxxing** *or* **outputs built for credibility, not endless scroll.**

---

## ~2 minutes (same spine, a little room to breathe)

1. **Problem** — People who need to work across borders, roles, or languages on hard problems often can’t use ordinary social or work chat without exposing more than they should, or they get matched on pedigree instead of fit for the problem.

2. **What Squadridge is** — A platform for **verified-anonymous squads**: short, structured sessions in matched rooms, with translation and UX aimed at de-escalation.

3. **Trust, in plain language** — You **prove you belong** in the verification sense (ZK/Semaphore-style proofs in product); the story for most audiences is: *membership without dumping PII on the server*—not “magic untraceable mode.” Technical details belong in [threat model](security/threat-model.md).

4. **Session + outcome** — The room is **time-bounded** and **purpose-built**. The emphasis is a **real output** when you’re done—a proposal-style artifact that can be referenced publicly—**not** “we saved the chat.”

5. **Close** — Offer a two-minute demo or walkthrough if context allows.

---

## FAQ (keep answers short)

### What are the limits of “anonymous”?

Anonymous sign-in and squad handles reduce everyday exposure, but **the service still has account identifiers and metadata** (queues, squads, timing). ZK verification reduces what raw identity data the app needs; it does **not** by itself make users invisible to a **privileged operator or a full database breach**. Peers in a squad may infer things from **what you write and how you write**. For engineering-accurate claims, use [threat model](security/threat-model.md) §3–§5.

### Is message content end-to-end encrypted against the platform?

**No — not in the Signal sense.** Messages use **application-layer encryption** with a **squad key** material the system can access under defined policies; **operators with DB/service access are in scope** for ciphertext and keys. There is **no forward secrecy** or productized **key rotation** today. Say “encrypted at rest in the app model” or point reviewers to [threat model](security/threat-model.md) §5.

### What do users leave with?

A **structured, citable output** tied to the session—your product story is **a document worth publishing or referencing**, not a dump of messages. Exact product behavior should match the live app and any ledger or publishing flow you ship.

---

## Phrases to use sparingly

- **“Zero-knowledge”** — Strong for crypto-literate audiences; for everyone else prefer **“proves you belong without us needing your name or location.”**
- **“Not a transcript”** — Good differentiator when describing deliverables.

---

## Credibility moves

- End with **“I can show the flow in about two minutes”** when a demo exists.
- If asked whether Squadridge is “like Signal” or “full E2E,” answer from the [threat model](security/threat-model.md)—**credibility beats buzzwords**.
