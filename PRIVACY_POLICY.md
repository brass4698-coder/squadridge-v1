# Privacy Policy

_Last updated: 2026-04-28_
_Status: scaffold — legal review required before public deployment._

SquadRidge is built from the ground up to protect the privacy and safety of every person who uses it. This policy explains, in plain language, what we collect, what we do not collect, how we protect your information, and what rights you have.

---

## 1. Who we are

SquadRidge is a privacy-first peer-support platform that connects small, moderated, anonymous squads across borders. The service is operated by the SquadRidge team ("we", "us", "our").

Contact for privacy matters: **privacy@squadridge.com** (placeholder — update before launch).

---

## 2. Our core privacy commitments

- **Minimum data collection.** We collect the least amount of data necessary to make the service work.
- **Ephemeral identifiers only.** Your display handle inside a squad is ephemeral and rotates; it is never linked to your real identity by default.
- **No sale of personal data.** We do not sell, rent, or trade your information.
- **Encryption at rest and in transit.** All stored messages are encrypted. Connections are TLS-only.
- **You can delete your data.** You can request deletion of all data associated with your session at any time.

---

## 3. What we collect and why

| Data type | Purpose | Retention |
|-----------|---------|-----------|
| Ephemeral session token | Route you to the right squad; no identity link | Expires at session end |
| Hashed device signal (truncated, salted) | Rate-limiting and abuse prevention only | 30 days maximum |
| Message ciphertext | Deliver messages within your squad | Per Data Retention Policy |
| Region preference (opt-in) | Show relevant crisis resources | Duration of session |
| Moderation flags (hashed, no raw content) | Safety and audit trail | 90 days |

**We do not collect:** full IP addresses, user-agent strings, email addresses (unless you explicitly provide one for account recovery), real names, or any demographic data beyond what you voluntarily share.

---

## 4. Messages and content

- Messages are encrypted in transit and at rest.
- Server-side encryption uses AES-GCM with KMS-wrapped keys (see `docs/security/encryption-scope.md`).
- The roadmap includes client-side end-to-end encryption (E2EE). Until that milestone is complete, operators with KMS access can, in principle, decrypt messages for moderation or legal compliance. This is disclosed here and in the in-app Security & Privacy page.
- Flagged content may be retained beyond the standard retention window for safety review, under strict access controls, for a maximum of 90 days.

---

## 5. Cookies and local storage

We use browser local storage to persist your ephemeral session token across page reloads. We do not use persistent tracking cookies or cross-site analytics scripts.

---

## 6. Third-party services

| Service | Purpose | Data shared |
|---------|---------|-------------|
| Supabase | Database, auth, real-time messaging | Session tokens, encrypted message ciphertext |
| Sentry (scaffold) | Error monitoring | Sanitised error events — no message content, no raw IPs (see `src/utils/sentry.ts`) |
| Upstash Redis (scaffold) | Rate-limiting | Hashed session tokens only |

We require all sub-processors to handle data to at least the standard described in this policy.

---

## 7. Your rights

Depending on your location, you may have rights under GDPR, CCPA, or other applicable laws, including:

- **Access** — request a copy of data we hold about you.
- **Rectification** — ask us to correct inaccurate data.
- **Erasure ("right to be forgotten")** — request deletion of all your data.
- **Portability** — receive your data in a structured, machine-readable format.
- **Objection** — object to specific processing activities.

To exercise any of these rights, contact **privacy@squadridge.com**. We will respond within 30 days.

---

## 8. Children

SquadRidge is not directed at children under 13 (or the applicable minimum age in your jurisdiction). We do not knowingly collect data from minors. If you believe a minor has provided data, contact us immediately.

---

## 9. Changes to this policy

We will notify users of material changes via an in-app banner at least 14 days before the change takes effect. The "last updated" date at the top of this document reflects the most recent revision.

---

## 10. Data Processing Addendum (DPA)

Organisations (NGOs, universities, enterprise customers) that process EU/EEA personal data through SquadRidge may request a Data Processing Addendum at **legal@squadridge.com** (placeholder).

---

> **Note for maintainers:** This document is a scaffold. Before launching to real users, have qualified legal counsel review it against GDPR Article 13/14, CCPA, and any jurisdiction-specific requirements of your user base.
