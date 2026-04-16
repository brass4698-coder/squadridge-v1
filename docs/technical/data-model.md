# Data Model

## Overview

The data model for SquadRidge is designed to enforce verified anonymity, support real-time structured dialogue, and generate aggregated early warning signals without compromising user privacy. Built on PostgreSQL via Supabase, the schema uses Row Level Security (RLS), SECURITY DEFINER RPCs, and strict data minimization to protect participants in high-risk environments.

## Core Entities

The data model is divided into three primary domains: Identity and Verification, Dialogue Sessions, and Analytics and Moderation.

### 1. Identity and Verification

This domain manages user access and zero-knowledge (ZK) proofs, ensuring that personally identifiable information (PII) is never stored directly in the database.

*   **Users** (`public.users`): A minimal table containing the user ID (mirrored from `auth.users`) and account status. No names, emails, or phone numbers are stored.
*   **Profiles** (`public.profiles`): Pseudonymous operator profile. Stores a callsign, coarse role archetype, capability tags, and optional placement hints (language, region, timezone window). No PII — linked to `auth.users.id`, not a decentralized identifier (DID).
*   **ZK Proof Submissions** (`public.zk_proof_submissions`): Stores Semaphore-based zero-knowledge proof commitments and nullifier hashes submitted by users. These proofs cryptographically verify attributes (e.g. organizational role) without revealing underlying identity data. Raw proof points are not stored — only the SHA-256 commitment.
*   **Verified Attributes** (`public.verified_attributes`): Links a user ID to specific, verified attributes (e.g. `attribute_type='citizenship', attribute_value='demo_region'`) derived from ZK proofs. Used for matching and access control.

### 2. Dialogue Sessions

This domain handles the encrypted messaging streams and the matching of users into small squads.

*   **Squads** (`public.squads`): Represents a time-bound dialogue session. Contains a topic, status (`forming | active | completed | flagged | archived`), expiry time, and an AES-256-GCM encryption key for app-level message encryption. Squads consist of four participants (2 from each side, `A` and `B`).
*   **Squad Members** (`public.squad_members`): Junction table linking users to a squad.
*   **Match Queue** (`public.match_queue`): Ephemeral matchmaking queue. Users enqueue with a `pool_key` and a side (`A` or `B`). The `private.matchmaking_try_form_pool` SECURITY DEFINER function forms squads of 4 (2+2) from the queue atomically.
*   **Messages** (`public.messages`): Stores app-level ciphertext (`payload_ciphertext`). Messages may be retracted by the sender (status set to `'retracted'`). Messages are not automatically deleted; the operator controls retention. Squad members and moderators can read messages via RLS policies.

### 3. Analytics and Moderation

This domain aggregates de-identified sentiment metrics and manages interventions, keeping these streams separate from core messaging.

*   **Sentiment Metrics** (`public.sentiment_metrics`): Aggregated, anonymized tone samples (tension level, timestamp) derived optionally from local heuristics. Only persisted when `VITE_ENABLE_AI=true`.
*   **Interventions** (`public.interventions`): Logs instances where AI-assisted de-escalation tools (e.g. "Slow down") were triggered. Used to track intervention frequency.
*   **Moderators** (`public.moderators`): Allowlist of moderator user IDs, provisioned via service role.
*   **Moderation Audit Log** (`public.moderation_audit_log`): Append-only log of human moderation actions (flag message, archive squad). Written via SECURITY DEFINER RPCs that verify moderator status.

### 4. Public Ledger

*   **Ledger Proposals** (`public.ledger_proposals`): Published consensus proposals from dialogue sessions. Readable without authentication (via anon RLS policy on `status='published'`); no user linkage exposed.

### 5. Pre-launch

*   **Waitlist Signups** (`public.waitlist_signups`): Email capture for pre-launch access requests.

## Data Pipeline and Security

The data pipeline separates ephemeral, encrypted messaging streams from aggregated analytics. RLS limits member access to their own squads; moderators have a separate RLS path for triage. Matchmaking and moderation actions use SECURITY DEFINER RPCs to avoid broad write policies on core tables.

**Peer profile visibility:** Squad members may query each other's pseudonymous profile fields (callsign, role archetype, tags, region hint) via the `get_squad_peer_profiles(squad_id)` RPC. This function is SECURITY DEFINER and verifies squad membership before returning results — there is no global directory; profiles are not queryable across squads.

**Message encryption:** Messages are encrypted client-side with AES-256-GCM using a per-squad key stored in `squads.message_encryption_key`. This is application-level encryption — the platform operator, moderators with `squads` SELECT access, and anyone with service-role access can read keys and decrypt ciphertext. This is not end-to-end encryption against the platform. See `docs/security/threat-model.md`.

