# npm audit disposition (production runtime)

This document records **accepted residual risk** from `npm audit --omit=dev` when upstream fixes are not yet available without breaking changes or ecosystem churn.

**How to refresh:** Run `npm audit --omit=dev --audit-level=high` locally and reconcile counts with this page. CI prints the same output as a **job summary** on every run (informational; see `.github/workflows/ci.yml`).

**Forward-looking gate:** Pull requests use GitHub’s **dependency review** action — it fails when a PR **introduces new** high/critical advisories compared to the base branch. That prevents worsening the posture without blocking unrelated work while legacy transitive chains remain open.

---

## Snapshot (as of last engineering review)

Running:

```bash
npm audit --omit=dev --audit-level=high
```

typically reports **12** production-runtime findings (**8 high**, **4 critical**) grouped into **two dependency trees**:

| Root dependency             | Role in SquadRidge                                                                                                                                                    | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@xenova/transformers`      | Client-side translation pipeline (`src/workers/translation*.ts`, `src/lib/ai/pipeline.ts`). Loads ONNX models in-browser; pulls `onnxruntime-web`, `protobufjs`, etc. | **Monitor upstream.** Advisories target protobuf / ONNX stack CVEs (remote execution / deserialization classes). Mitigations in practice: models loaded from controlled origins; user text flows through the pipeline as translation input, not as executable protobuf payloads. **Plan:** bump `@xenova/transformers` when a patch release clears the chain without regressing model compatibility; re-run translation smoke tests.                                                              |
| `@semaphore-protocol/proof` | Zero-knowledge proof generation for verification flows. Transitive chain includes `snarkjs`, `circomkit`, `@zk-kit/artifacts`, `bfj`, `jsonpath`, `underscore`.       | **Monitor upstream.** Many findings are **tooling / circuit-artifact** paths (`circom_tester`, dual `snarkjs` versions). Production browser bundle uses the proof library for verification UX; **does not** expose `bfj`/build tooling to end users in the shipped artifact path the same way a CLI would. **Plan:** adopt `@semaphore-protocol/proof` patch/minor releases when Semaphore publishes fixes; avoid pinning to older proof versions without regression-testing ZK flows end-to-end. |

---

## Why CI does not hard-fail on `npm audit` today

A strict `npm audit` exit-code gate would block **every** merge until both chains above are clean. Today `npm audit` suggests “fixes” that are **downgrades** or major ecosystem jumps (`@xenova/transformers` ↔ older majors; `@semaphore-protocol/proof` ↔ older Semaphore minors), which risk breaking verified flows without dedicated QA.

The compromise:

1. **Document** residual findings here (this file).
2. **Prevent regression** via `dependency-review-action` on PRs.
3. **Automate hygiene** via Dependabot (`.github/dependabot.yml`).
4. **Re-enable** a failing `npm audit` step in CI once `npm audit --omit=dev` returns clean or an agreed exception list is encoded in an audited script.

---

## Operational checklist before pilot hardening

- [ ] Re-run `npm audit --omit=dev` and update the table above if counts change.
- [ ] Confirm translation worker still loads models only from intended URLs (see AI pipeline code).
- [ ] After any `@semaphore-protocol/*` or `@xenova/transformers` bump: run `npm test`, `npm run build`, Playwright e2e, and manual ZK + translation smoke.

Related: [Threat model](threat-model.md), [Encryption scope](encryption-scope.md).
