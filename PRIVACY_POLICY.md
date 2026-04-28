# Privacy Policy

**Last updated: 2026-04-28**
**Status: Draft — legal review required before public launch**

Hey — if you're using SquadRidge, you deserve a straight answer about what we collect, why, and what we don't. This is our best attempt at plain English. We'll keep it honest even when that means admitting gaps.

---

## The short version

We collect as little as possible to keep the service running. We never sell your data. We anonymize or hash identifying information server-side before persisting it. We are not yet fully end-to-end encrypted — we say that clearly below so you can make an informed choice.

---

## 1. What we collect and why

| Category | What | Why | Retention |
|----------|------|-----|-----------|
| Account | Email address (if you use magic-link sign-in) | Authenticate you, deliver your link | Until you delete your account |
| Session identity | An internal `user_id` (UUID, Supabase-generated) | Tie your sessions together | Until you delete your account |
| Profile | Your callsign, optional region hint, language, interest tags | Match you with a squad | Until you delete your account |
| Messages | Encrypted message ciphertext, IV, and a key reference | Deliver the message and support moderation review | See [DATA_RETENTION.md](DATA_RETENTION.md) |
| Matchmaking metadata | Pool key (your sorted intent tags), timestamp, side | Find the right squad for you | Short-lived; see retention doc |
| ZK proofs | Semaphore nullifier, commitment, proof fields | Verify your credential without revealing the credential | Indefinite — audit integrity requires this |
| Error telemetry | Anonymized error events via Sentry (no message bodies) | Fix bugs | 90 days in Sentry |
| Server logs | Hashed request identifier (no raw IP), outcome code | Detect abuse, diagnose failures | 30 days |

### What we explicitly do not collect

- Raw IP addresses in persistent storage. We hash with a pepper (HMAC-SHA256) before any logging or rate-limiting.
- User-agent strings in persistent storage. Stripped at the edge.
- Message plaintext in logs. Message bodies are encrypted before storage; Sentry `beforeSend` scrubs any string over 512 bytes.
- Precise GPS location. We ask for a coarse region hint (e.g. "Europe/East") only if you share it.

---

## 2. Anonymity — honest tradeoffs

We care deeply about anonymity, but we want to be honest about what "anonymous" means here:

**What the platform cannot easily link to you:**
- Message content (encrypted at rest with a per-squad key)
- Your name, photo, or real-world identity (we don't ask)

**What the platform *can* link to your account, today:**
- Your email address (if you signed in with magic link)
- Your `user_id` across all tables and logs
- Your ZK proof submissions — we know "this account submitted this proof," even though the proof itself doesn't contain your name
- Message timing and squad membership

**What this means in practice:**
If you are in a high-risk situation (journalist, activist, person in authoritarian context), please read our [threat model](docs/security/threat-model.md) before relying on SquadRidge for anything operationally sensitive. The current platform protects against *accidental* exposure and *opportunistic* surveillance — not a determined, legally-compelled, or well-resourced adversary.

---

## 3. End-to-end encryption — current state

**We use AES-256-GCM encryption at the application layer.** Your messages are encrypted before they reach our database. However:

- The encryption key is stored in our database (per-squad, in `squads.message_encryption_key`).
- This means the SquadRidge team, Supabase (our infrastructure provider), or anyone with database access could read your messages.
- This is **not** end-to-end encryption in the cryptographic sense (where only you and your squad-mates hold the keys).

Our roadmap includes true E2E encryption. Until then, we are transparent: messages are encrypted *in transit and at rest* but remain accessible to privileged platform operators. See [ROADMAP.md](ROADMAP.md).

---

## 4. Sharing and third parties

We share your data only with:

| Recipient | What | Why |
|-----------|------|-----|
| Supabase | All data (hosted infrastructure) | We run on their platform |
| Sentry | Anonymized crash reports (no message bodies, no raw user IDs) | Error monitoring |
| Upstash Redis | Hashed request token for rate-limiting | Abuse prevention |

We do not share data with advertisers, data brokers, or analytics companies. We do not sell your data.

---

## 5. Your rights

Depending on where you are, you may have the right to:

- **Access** what we hold about you
- **Delete** your account and data
- **Correct** inaccurate data
- **Object** to certain processing
- **Export** your data in a machine-readable format

To exercise any of these, email us (see SECURITY.md for contact). We will respond within 30 days. If you are in the EU/UK, you may also lodge a complaint with your local data protection authority.

---

## 6. Children

SquadRidge is not directed at children under 16. If you believe a child has created an account, please contact us immediately.

---

## 7. Changes

We will update this document as the product evolves. Significant changes (new data categories, new sharing partners) will be communicated in-app and in the changelog.

---

## 8. Contact

See [SECURITY.md](SECURITY.md) for the security contact. General privacy questions can be directed to the same address.

---

*This document is a living draft. If you spot something missing or misleading, open an issue — we'd rather fix it than defend it.*
