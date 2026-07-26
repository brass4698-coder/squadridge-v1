# Sample Audit-Trail Export (REDACTED · SYNTHETIC)

**Label:** ILLUSTRATIVE SPECIMEN (NOT VERIFIABLE)  
**Purpose:** Diligence format inspection — metadata only; no message bodies.

```json
{
  "export_version": "1.0",
  "session_id": "11111111-1111-4111-8111-111111111111",
  "export_kind": "metadata_audit_trail",
  "note": "SYNTHETIC — not a live session export",
  "events": [
    {
      "at": "2026-06-01T14:02:11Z",
      "type": "session_configured",
      "actor_role": "facilitator",
      "detail": { "template": "ngo_deliberation", "max_participants": 8 }
    },
    {
      "at": "2026-06-01T14:10:00Z",
      "type": "participant_invited",
      "actor_role": "facilitator",
      "detail": { "invite_count": 6 }
    },
    {
      "at": "2026-06-02T09:15:22Z",
      "type": "participant_verified",
      "actor_role": "facilitator",
      "detail": { "verified_count": 6 }
    },
    {
      "at": "2026-06-02T10:00:00Z",
      "type": "room_opened",
      "actor_role": "facilitator",
      "detail": { "dialogue_stage": "opening" }
    },
    {
      "at": "2026-06-05T16:40:00Z",
      "type": "outcome_draft_created",
      "actor_role": "facilitator",
      "detail": { "draft_status": "in_review" }
    },
    {
      "at": "2026-06-06T11:05:00Z",
      "type": "approval_recorded",
      "actor_role": "participant",
      "detail": { "bound_to_hash_prefix": "e3b0c442…", "approvals_complete": 1 }
    },
    {
      "at": "2026-06-06T11:22:00Z",
      "type": "approval_recorded",
      "actor_role": "participant",
      "detail": { "bound_to_hash_prefix": "e3b0c442…", "approvals_complete": 2 }
    },
    {
      "at": "2026-06-06T12:00:00Z",
      "type": "release_attempt",
      "actor_role": "facilitator",
      "detail": { "result": "blocked_incomplete_approvals", "required": 3 }
    },
    {
      "at": "2026-06-07T09:30:00Z",
      "type": "approval_recorded",
      "actor_role": "participant",
      "detail": { "bound_to_hash_prefix": "e3b0c442…", "approvals_complete": 3 }
    },
    {
      "at": "2026-06-07T10:00:00Z",
      "type": "outcome_released",
      "actor_role": "facilitator",
      "detail": {
        "ledger_sha_prefix": "e3b0c442…",
        "public_ledger": false,
        "rfc3161": "not_requested"
      }
    }
  ]
}
```

**Non-consensus note:** If required approvals are never completed, release stays blocked. The room may close or archive without a public record. No auto-publish.

Full threat model: `/security` · Diligence packet: `/diligence/trust-diligence-packet.md`
