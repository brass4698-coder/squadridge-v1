# Pull Request Template

> For the structured PR template used by GitHub's PR UI, see `.github/pull_request_template.md`.
> This root-level file serves as a reference and is not auto-loaded by GitHub.

---

## Summary

<!-- What changed and why (2–4 sentences). Plain language — imagine explaining to a new contributor. -->

## What to review carefully

<!-- List the files and areas that need the most scrutiny.
     For scaffold files, note: "This is a scaffold — not yet wired to production." -->

| File / area | Note |
|-------------|------|
| | |

## Scaffold vs. integrated

- **Scaffolds** (not yet wired to production): list any new files that are stubs/scaffolds.
- **Integrated** (wired and active): list changes that are live on merge.

## Next steps (for scaffolds)

<!-- If this PR includes scaffolds, list what needs to happen before they go live:
     - Wire secrets (Redis URL, KMS ARN, Sentry DSN) in production secret manager.
     - Legal review (PRIVACY_POLICY.md, DATA_RETENTION.md).
     - Configure CI secrets (VITE_SENTRY_DSN, REDIS_URL, etc.).
-->

## Security checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes (no ZK stub or demo decoys in prod build)
- [ ] `node scripts/check-prod-readiness.mjs` passes (if touching Edge functions / migrations / headers)
- [ ] No secrets committed (run `bash scripts/scan-secrets.sh`)
- [ ] Security/privacy implications documented above or in linked issue
