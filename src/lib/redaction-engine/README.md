# Redaction engine (`src/lib/redaction-engine`)

Production-oriented **v1** redaction pipeline for SquadRidge: verified pseudonymity, audience-specific policies, and durable-export safety. Deterministic detectors run first; a **pluggable NER** interface defaults to a conservative heuristic (swap for ONNX / API without changing types).

## Modes

| Mode | Use | Detector depth |
|------|-----|----------------|
| `live_chat` | Typed messages, low latency | Deterministic + shallow heuristics; NER off by default |
| `upload_ocr` | Files, OCR text | + URLs, addresses, dates, quasi/contextual, heuristic NER |
| `export_ledger` | Sponsor + ledger artifacts | Strongest inferential policy + generic URLs + heuristic NER |

Override NER with `nerAdapter` on the pipeline request. Set `skipDeepEntityPass: true` to force a fast path.

## Quick use

```typescript
import { redactContent } from '@lib/redaction-engine';

const result = await redactContent({
  text: raw,
  mode: 'live_chat',
  audience: 'participant',
  contentType: 'live_message',
  context: {
    roomId: 'room-uuid',
    roomPseudonymSecret: process.env.ROOM_PSEUDONYM_HMAC_SECRET!,
    allowlistTerms: ['SquadRidge', 'CSI'],
  },
  roomParticipantUserIds: ['user-a', 'user-b'],
  actorLabel: 'api:message-ingest',
});

// Persist result.redactedText for participant-visible stores.
// Log result.audit (hashes only) — never log raw message with audit in production.
```

## Integration points

1. **Chat submit** — `mode: 'live_chat'`, `audience: 'participant'`, enforce server-side before insert.
2. **Uploads / OCR** — `mode: 'upload_ocr'`, async job acceptable for longer text.
3. **Exports / ledger** — `mode: 'export_ledger'`, `contentType: 'ledger_record' | 'sponsor_export'`, stricter inferential rules in policy.

## Architecture

- `detectors/` — Composable deterministic + heuristic detectors; `mergeDetectorHits` collapses overlaps.
- `policies/` — `adjudicateHit` + `applyPolicy` (per-audience decisions).
- `transformers/` — Span-ordered replacements (`transformContent`).
- `pseudonyms/` — HMAC-stable room labels (`createPseudonymMap`).
- `scoring/` — Message-level risk score.
- `audit/` — Content hashes + finding refs (no raw plaintext in default record).
- `pipelines/` — `redactContent` orchestration.

## ML / NER

Implement `NamedEntityRecognizer` with `detect(text, context)` and pass as `nerAdapter`. The default `heuristicNamedEntityRecognizer` is intentionally noisy; tighten in v2 with a real model.

## Tests

```bash
npm test -- src/lib/redaction-engine
```
