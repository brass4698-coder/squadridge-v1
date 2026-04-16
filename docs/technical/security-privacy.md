# Security and Privacy

## Engineering status

High-stakes deployment decisions (what the implementation **actually** guarantees today vs on the roadmap) are documented in the **[operational threat model](../security/threat-model.md)**. Read that document before treating marketing or overview text here as a cryptographic or operational guarantee.

## Overview

SquadRidge is built on the Enclave[ZK] privacy stack by Enclave Health Technologies Inc. (EHTI), prioritizing the safety of its users, especially those in authoritarian or active conflict zones [1]. The platform's security architecture is designed to mitigate the risks of state-level surveillance, data breaches, and the weaponization of sensitive information [3].

## Core Security Principles

### 1. Verified Anonymity via Zero-Knowledge Proofs

Participants in authoritarian or active conflict zones face real danger if their identities, locations, or stated views are exposed [3]. General platforms like Zoom or Google Workspace do not offer meaningful anonymization or prevent state-level surveillance [3].

SquadRidge addresses this by utilizing Semaphore-based zero-knowledge proofs (ZKPs) to verify user attributes like citizenship or organizational roles without exposing raw personally identifiable information (PII) [1]. This ensures that users can cryptographically prove their identity and participate in cross-border dialogue while their underlying personal data remains hidden [3].

### 2. End-to-End Encryption and Ephemerality

**Target:** End-to-end encryption for sensitive exchanges, with ephemeral messaging streams separated from aggregated analytics [1][3].

**Current implementation:** New message bodies are encrypted in the client with **AES-256-GCM** (payload v3 in `src/lib/messageCrypto.ts` / `src/lib/messagePayload.ts`). Legacy v1 rows may still store plaintext JSON in `messages.payload_ciphertext` (historically named `encrypted_content` before migration `20260418120000_messages_payload_ciphertext_rename.sql`). The **decryption key for a squad is stored alongside the squad** (`squads.message_encryption_key`), readable to members via RLS and to privileged roles (moderators, service role, DB admins). That is **application-level encryption with server-visible keys**, not cryptographic E2E against the operator. Until a full E2E design ships, treat message bodies as **recoverable by anyone who can read Postgres** with sufficient privilege. The [operational threat model](../security/threat-model.md) states trust boundaries and non-goals for high-risk contexts.

Messages are designed for ephemerality; deletion after a session or user retraction (e.g. "Pull back") remains a product goal [1]. Operational retention must still be aligned with the threat model and `docs/technical/data-retention-zk.md`.

### 3. "Do No Harm" Data Architecture

The peace-tech ecosystem faces ethical concerns regarding the weaponization of data collected in conflict zones [3]. SquadRidge's architecture implements "do no harm" principles from the design phase, ensuring that the data infrastructure serves community needs without extractive practices [2].

The platform aggregates de-identified sentiment metrics to provide early warning insights for vetted mediators, think tanks, and UN agencies [1]. This data is strictly separated from the ephemeral messaging streams, ensuring that even if the analytics database is compromised, raw dialogue and user identities remain secure [1].

## Threat Modeling and Operational Security

SquadRidge incorporates best practices for digital safety in conflict zones, including threat-aware planning, strong encryption, and disciplined operational security [3].

### 1. Mitigating Surveillance Risks

The platform is designed to operate efficiently in low-bandwidth environments, which is critical for users in active conflict zones with degraded internet infrastructure [3]. It supports the use of anonymity networks like Tor and VPNs to evade network-level censorship and hide usage from ISPs [3].

### 2. Device Hygiene and Data Minimization

Users are encouraged to practice metadata hygiene, such as avoiding mentioning locations or timestamps in messages [3]. The platform's low-data mode minimizes the amount of information transferred, and users are advised to use separate accounts for different operational contexts to prevent cross-contamination [3].

## References

[1] SquadRidge Core Research Compilation.
[2] Gemini Deep Research Synthesis.
[3] Perplexity Research.
