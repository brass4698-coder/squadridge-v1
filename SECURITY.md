# Security

## Who you’re talking to

We care about safety and we take security reports seriously. This doc explains how to tell us about a vulnerability, how we’ll respond, and what to do if you find secrets in the repository.

## Reporting a vulnerability

- If you find a security issue during a private pilot, contact the technical owner listed in the active pilot owner roster. Do not publish external security materials until a real dedicated security mailbox is configured.
- In your message include:
  - A short, plain-English summary of the issue
  - Steps to reproduce (commands, sample requests, test accounts)
  - Expected vs. actual behavior
  - Any PoC code or screenshots (optional)
  - Your contact info (so we can ask follow-ups; you can remain anonymous)

## What we will do

- Acknowledge your report within 48 hours.
- Triage and assign an engineer within 72 hours.
- Share a rough timeline for a fix or mitigations.
- Notify you when the issue is fixed and, if relevant, when we publish a public advisory.

## Severity and response priorities (what to expect)

- Critical (remote code execution, data exfiltration of sensitive user content): emergency response, hotfix or rollback, follow-up within 48 hours.
- High (privilege escalation, access to plaintext messages, secret exposure): targeted patch within 7 days.
- Medium (information leaks that are scoped / rate-limited): planned fix in a maintenance release.
- Low (UI bugs, non-sensitive info): scheduled for triage.

## If you find secrets (API keys, private keys, etc.)

- Do not publish the secret. Send it directly to the active technical owner and include the file path and a minimal reproduction.
- We will:
  - Confirm receipt within 24–48 hours
  - Rotate the exposed secret(s) immediately (we may ask you to verify rotation)
  - If the secret appears in git history, we will follow a safe remediation plan (rotate, disclose to us, then coordinate whether a history rewrite is required). We will not rewrite public history without a deliberate, documented plan since that can cause downstream disruption; instead we prefer rotation and token invalidation.

## Disclosure policy

- We prefer coordinated disclosure so we can fix things before they’re public.
- If you prefer full public disclosure, say so in your report; we will work with you to set a reasonable disclosure timeline.

## Safe testing guidance

- Don’t test using real user accounts.
- Don’t attempt destructive actions against production systems.
- If you need test access, ask and we will provide a controlled test environment.

## Contact & escalation

- Active pilot technical owner — primary contact; see `docs/operations/pilot-owners.md`.
- If the primary contact does not respond within 72 hours, escalate to the incident lead listed for the same pilot window.

## Notes and limitations (important)

- This repo contains scaffolds and examples (KMS, Sentry). Some of the files added by our security work are intentionally placeholders — we document each one with “What remains” and required environment variables. Treat those placeholders as non-production code until properly wired.
- This document is a living file and may be updated as our security process matures.

## Thank you

We appreciate responsible disclosure. If you’d like recognition in a credits page, say so and we’ll coordinate.
