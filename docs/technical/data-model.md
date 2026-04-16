# Data Model

## Overview

The data model enforces verified anonymity, structured dialogue, and aggregated early-warning signals while minimizing raw PII in Postgres. The live schema is defined by SQL migrations under `supabase/migrations/`; this document reflects **what the repository ships today**.

## Core entities

### 1. Identity and verification

- **`auth.users` / `public.users`**: Minimal account rows keyed by UUID. No names or phone numbers in `public.users` by design.
- **`public.profiles`**: Pseudonymous operator profile (callsign, role archetype, coarse tags, language/region hints). **RLS:** users read/update their own row. **In-squad visibility:** peers see a **slim projection** (callsign, role, tags, region hint) via the `get_squad_peer_profiles` RPC — same squad only, no global directory.
- **`public.zk_proof_submissions`**: Semaphore proof commitments and nullifier hashes bound to verification events.
- **`public.verified_attributes`**: Rows derived from verified proofs (`attribute_type`, `attribute_value`). Used for eligibility signals; **pool keys** for matchmaking may include a `|zk:<scope>` suffix that must match a row here for the current user (see `matchmaking_enqueue_and_try`).

### 2. Dialogue sessions

- **`public.squads`**: Time-bound dialogue session (topic, status, expiry, optional `message_encryption_key`, archive metadata).
- **`public.squad_members`**: Junction of user ↔ squad membership.
- **`public.messages`**: Encrypted payloads (`payload_ciphertext` JSON for AES-GCM). Status includes `sent`, `retracted`, `flagged`. **Retention:** no automatic row deletion in current migrations; retention is an operational policy (see threat model and retention docs).

### 3. Matchmaking

- **`public.match_queue`**: Ephemeral queue rows (`pool_key`, `side` A/B, status). Pool keys are derived client-side from intent tags and optional verified ZK scope; server RPCs validate `|zk:` segments against `verified_attributes`.

### 4. Analytics and moderation

- **`public.sentiment_metrics`**: De-identified tension/tone samples (optional AI path).
- **`public.interventions`**: Logged de-escalation or system interventions.
- **`public.moderators` / `public.moderation_audit_log`**: Moderator roster and append-only audit trail.
- **`public.ledger_proposals`**: Public consensus records (published subset readable under RLS).

### 5. Pre-launch

- **`public.waitlist_signups`**: Email capture for marketing; separate RLS for insert/read patterns defined in migrations.

## Data pipeline and security

Ephemeral messaging and aggregated analytics are separated at the table level. Row Level Security is the primary client authorization boundary; **operator** and **service role** access are out-of-band for RLS (see [threat model](../security/threat-model.md)).

## References

Internal research and synthesis materials cited in legacy docs are not reproduced here; prefer migrations and `src/lib/database.types.ts` as the source of truth for column types.
