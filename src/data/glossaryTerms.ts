/**
 * Short facilitator-facing glosses for technical terms on public marketing pages.
 * Prefer linking to /security for deeper diligence — do not invent stronger claims.
 */

export type GlossaryTermId =
  | 'bearer-secret'
  | 'codename'
  | 'ledger-sha'
  | 'canonicalised'
  | 'verification-anchor'
  | 'rfc-3161'
  | 'instrument-hash'
  | 'authorship-attestation';

export type GlossaryTerm = {
  id: GlossaryTermId;
  /** Visible term text when used as a GlossTerm child default. */
  term: string;
  /** One-sentence plain-English gloss. */
  gloss: string;
  /** Optional diligence deep-link. */
  href?: string;
};

export const GLOSSARY_TERMS: Record<GlossaryTermId, GlossaryTerm> = {
  'bearer-secret': {
    id: 'bearer-secret',
    term: 'bearer secrets',
    gloss:
      'Invite links that grant entry to whoever holds them — treat like passwords; share only through trusted channels.',
    href: '/security#safeguards',
  },
  codename: {
    id: 'codename',
    term: 'codenames',
    gloss:
      'Session display names chosen for the room — not public identities written onto the ledger.',
    href: '/security#room-and-record',
  },
  'ledger-sha': {
    id: 'ledger-sha',
    term: 'ledger_sha',
    gloss:
      'The SHA-256 integrity hash stored with a released record so outsiders can recompute and confirm the text is unaltered.',
    href: '/security#verification-anchor',
  },
  canonicalised: {
    id: 'canonicalised',
    term: 'canonicalised',
    gloss:
      'Normalised into a fixed byte form (whitespace and encoding) so the same approved text always hashes the same way.',
    href: '/security#verification-anchor',
  },
  'verification-anchor': {
    id: 'verification-anchor',
    term: 'verification anchor',
    gloss:
      'A tamper-evident integrity check on the released file — proves the published text is unaltered, not who said what in the room.',
    href: '/security#verification-anchor',
  },
  'rfc-3161': {
    id: 'rfc-3161',
    term: 'RFC 3161',
    gloss:
      'A trusted timestamping standard (scaffolded) that would independently attest when a hash was created — not live in the current pilot.',
    href: '/security#verification-anchor',
  },
  'instrument-hash': {
    id: 'instrument-hash',
    term: 'instrument hash',
    gloss:
      'The SHA-256 fingerprint of the exact approved wording — approvals and release bind to this fingerprint, not a looser paraphrase.',
    href: '/security#safeguards',
  },
  'authorship-attestation': {
    id: 'authorship-attestation',
    term: 'authorship attestation',
    gloss:
      'A recorded facilitator statement that they authored the instrument, bound to the same hash as the approvals.',
    href: '/security#safeguards',
  },
};
