/**
 * Security marketing copy — glance (`/security`) and technical (`/security/technical`).
 *
 * Operator-readable / not-E2E disclosure lives once in DOCUMENTED_LIMITS_LEAD.
 * Other surfaces must link back — do not restate the full paragraph.
 */

/** Hashes that live only on `/security/technical` — glance redirects these. */
export const SECURITY_TECHNICAL_HASHES = [
  'verification-anchor',
  'diligence-faq',
  'reviewer-appendix',
  'confidentiality-precedent',
] as const;

export type SecurityTechnicalHash = (typeof SECURITY_TECHNICAL_HASHES)[number];

export function isSecurityTechnicalHash(hash: string): hash is SecurityTechnicalHash {
  return (SECURITY_TECHNICAL_HASHES as readonly string[]).includes(hash);
}

/** Single prominent disclosure — say once; elsewhere link to `#reviewers`. */
export const DOCUMENTED_LIMITS_LEAD =
  'Room messages are AES-256-GCM ciphertext at rest, but session keys live in Postgres for facilitators and admitted participants. Staff with service-role or database access can decrypt. This is application-layer encryption — not Signal-grade operator-blind E2E. Cover it in your MOU. Operator-blind room E2EE remains planned (ADR 005).';

/** Skim cards on `/security` — keep total glance body copy ≤ ~150 words. */
export const SECURITY_AT_A_GLANCE = [
  {
    title: 'Operator-readable rooms',
    body: 'AES-GCM at rest; staff with database access can decrypt. Not Signal-grade E2E.',
    href: '#reviewers',
  },
  {
    title: 'Room and record stay separate',
    body: 'Dialogue never publishes. Only facilitator-authored outcomes leave after approval.',
    href: '#room-and-record',
  },
  {
    title: 'Verified, invite-only entry',
    body: 'Facilitator sets the verification bar. No open forum.',
    href: '#safeguards',
  },
  {
    title: 'Controlled release',
    body: 'Designated approvals and facilitator attestation. Nothing auto-publishes.',
    href: '#safeguards',
  },
  {
    title: 'Integrity anchor',
    body: 'SHA-256 proves the released text is unaltered — not court-admissible time.',
    href: '/security/technical#verification-anchor',
  },
  {
    title: 'Honest status',
    body: 'Live vs planned claims come from one registry shared with Home and Ledger.',
    href: '#live-vs-planned',
  },
] as const;

export const NOT_CLAIMED = [
  {
    label: 'Not E2E today',
    body: 'Application-layer encryption with operator-readable keys — see Documented limits above.',
  },
  {
    label: 'Not full ZKP',
    body: 'We do not claim platform-wide zero-knowledge proofs. Prefer private room → facilitator release → approved outcomes.',
  },
  {
    label: 'Not anonymity as a legal guarantee',
    body: 'Directional anonymity on the public record is a system property — not anonymity from the operator, and not a legal guarantee against re-identification.',
  },
  {
    label: 'Not legal privilege',
    body: 'Process infrastructure, not a legal instrument. We are not an IOA-certified ombuds office. Counsel decides privilege for your matter.',
  },
  {
    label: 'Not court-admissible timestamps',
    body: 'SHA-256 proves integrity of the released file. RFC 3161 trusted timestamping is planned, not live.',
  },
  {
    label: 'Not whistleblower tooling',
    body: 'If your threat model includes state-level adversaries, assess that risk before piloting.',
  },
  {
    label: 'Not surveillance',
    body: 'Not predictive policing, continuous monitoring, or early-warning product claims — facilitation only.',
  },
] as const;

/** Terse operator-access rows — full operator disclosure is DOCUMENTED_LIMITS_LEAD. */
export const OPERATOR_ACCESS = [
  {
    layer: 'Inside the room',
    access:
      'AES-256-GCM client-side before storage. Facilitator RLS; participants via token-scoped functions that return the room key.',
  },
  {
    layer: 'Operator / infrastructure',
    access: 'Can decrypt — see Documented limits.',
  },
  {
    layer: 'Facilitator-only fields',
    access:
      'Facilitator notes excluded from ledger-facing columns — cannot leak beside a released record.',
  },
  {
    layer: 'What never leaves',
    access: 'Room dialogue never published, exported to the ledger, or importable into an outcome.',
  },
] as const;

export const ROOM_ITEMS = [
  'Written rounds, drafts, prompts, and private signals',
  'Invite-only entry after facilitator-defined verification',
  'Raw dialogue never on the ledger or in public exports',
] as const;

export const RECORD_ITEMS = [
  'Approved outcome text plus limited metadata — not a transcript',
  'Verification anchor confirms the published file is unaltered',
  'Designated approvals and an explicit facilitator release action',
] as const;

export const ANCHOR_PROVES = [
  'The released record is unaltered since publication (SHA-256 integrity)',
  'It was issued through the SquadRidge release process',
  'Listed metadata matches the anchored file',
] as const;

export const ANCHOR_DOES_NOT = [
  'What was said inside the private room',
  'Who each participant is',
  'External endorsement of the substance',
  'Independent proof of when the hash was created (RFC 3161 TSA — planned, not shipped)',
] as const;

export const OMBUDS_ALIGNED = [
  {
    heading: 'Independence & informality',
    body: 'The room is a governed informal channel — distinct from formal grievance, litigation, or public forum tracks.',
  },
  {
    heading: 'Impartial process authority',
    body: 'The facilitator owns stages and release. Optional AI heat signals are private and advisory — never an autonomous mute.',
  },
  {
    heading: 'Confidentiality architecture',
    body: 'Aligned with established ombuds practice standards: no public transcript; identifying dialogue stays in the room; only an approved outcome may leave after release.',
  },
  {
    heading: 'Narrow exceptions (policy template)',
    body: 'Pilot ground rules may reserve imminent serious harm, defense against misconduct claims, and explicit permission — operational policy, not product-invented legal privilege.',
  },
] as const;

export const SAFEGUARDS = [
  {
    heading: 'Verified access only',
    body: 'Facilitator-configured verification before entry. You set the bar.',
  },
  {
    heading: 'Controlled release',
    body: 'Nothing publishes without designated approvals. The platform cannot release unilaterally.',
  },
  {
    heading: 'Text room only',
    body: 'No audio or video capture. Written rounds under facilitator control.',
  },
  {
    heading: 'Minimal retention',
    body: 'Retain what facilitation and the record require. Released ledger entries are permanent by design.',
  },
  {
    heading: 'Identity isolation',
    body: 'Contact details are not shared between participants or written onto the public record.',
  },
  {
    heading: 'Auditable release chain',
    body: 'Lifecycle metadata is logged — not message bodies. Approvals precede release.',
  },
  {
    heading: 'Invite-only surface',
    body: 'No public forum. Access requires invitation or an approved organisational role.',
  },
] as const;

/** Diligence FAQ — one direct sentence where possible; operator detail links to Documented limits. */
export const DILIGENCE_FAQ = [
  {
    q: 'Can the operator read room messages today?',
    a: 'Yes — see Documented limits.',
  },
  {
    q: 'Does the verification anchor prove when something was released?',
    a: 'No — SHA-256 proves integrity only; RFC 3161 timestamping is not live.',
  },
  {
    q: 'Are you IOA-certified or a court instrument?',
    a: 'No — architecture is aligned with IOA practice but we are not certified.',
  },
  {
    q: 'What if parties never agree to release?',
    a: 'Release stays blocked; nothing auto-publishes.',
  },
  {
    q: 'Where is operator-blind encryption on the roadmap?',
    a: 'Planned (ADR 005) until exit criteria in that ADR are met.',
  },
] as const;

export const TECHNICAL_APPENDIX = [
  {
    term: 'Transport',
    detail: 'TLS 1.2+ — see Documented limits for operator access to room content.',
  },
  {
    term: 'Session storage',
    detail:
      'v2 session messages stored as AES-GCM ciphertext with access-controlled keys. Key visibility: see Documented limits. Legacy squad chat uses the same application-layer model.',
  },
  {
    term: 'Verification anchor',
    detail:
      'SHA-256 (ledger_sha) of the canonicalised approved instrument at facilitator sign-off — integrity of the released text. Not a Merkle tree of room messages, not a live RFC 3161 TSA token, and not on-chain notarisation in the current pilot. Optional timestamp_token columns scaffold a future TSA path; release does not request a token today. Semaphore Merkle groups, where used, apply to identity verification cohorts — not to ledger anchoring.',
  },
  {
    term: 'Release preconditions',
    detail:
      'Release is refused unless the session has ended, every approval is recorded against the current instrument hash, a facilitator authorship attestation covers that same hash, and no approved text repeats a room message verbatim. Revising the instrument resets approvals and clears the attestation; each refused attempt is written to the session audit trail.',
  },
  {
    term: 'Export & citation',
    detail:
      'Released dossiers support copyable citation text and verification against the listed anchor. Machine-readable citation APIs and bulk export for institutional CMS integration are diligence-scoped — not a public self-serve API today.',
  },
  {
    term: 'Audit log access',
    detail:
      'Approvals must be recorded before release. Session audit trails are metadata-only (lifecycle events — not message bodies). Pilot partners receive export of the audit trail after close under the MOU; there is no public audit feed.',
  },
] as const;
