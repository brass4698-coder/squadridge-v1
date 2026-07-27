/**
 * RFC 3161 trusted-timestamp scaffold for verification anchors.
 *
 * Status: typed interfaces + schema columns only. No live TSA integration.
 * Do not claim court-admissible or independently timestamped anchors in UI until
 * a production Time Stamp Authority path is wired and documented in the threat model.
 *
 * @see docs/product/institutional-credibility-research.md
 */

/** Integrity hash shipped today via release_outcome → ledger_sha. */
export type LedgerIntegrityHash = string;

export type TimestampTokenStatus = 'none' | 'pending' | 'stored' | 'verified' | 'failed';

/**
 * Optional RFC 3161 layer beside SHA-256. All token fields remain null/none in production
 * until a TSA client is implemented.
 */
export interface OutcomeTimestampAnchor {
  /** SHA-256 hex of the canonical released instrument (shipped). */
  ledgerSha: LedgerIntegrityHash;
  /** Base64 or DER text of an RFC 3161 TimeStampToken when a live path exists. */
  timestampToken: string | null;
  /** TSA identifier / URI when a token is stored. */
  timestampAuthority: string | null;
  /** App wall-clock when a TSA response was accepted — not a substitute for token genTime. */
  timestampedAt: string | null;
  status: TimestampTokenStatus;
}

export const TIMESTAMPING_CLAIM = {
  shipped:
    'SHA-256 integrity hash of the released record (ledger_sha). Proves the file is unaltered since publication.',
  planned:
    'Optional RFC 3161 Time-Stamp Authority token stored beside ledger_sha. Schema and optional client gate exist; production release does not store a verified token until VITE_RFC3161_TSA_URL is configured and verification passes. Registry status remains SCAFFOLDED until then.',
  notClaimed:
    'Court-admissible timestamps, public blockchain notarisation, or independent “when” proof without a live, verified TSA path.',
} as const;

export function emptyTimestampAnchor(ledgerSha: LedgerIntegrityHash): OutcomeTimestampAnchor {
  return {
    ledgerSha,
    timestampToken: null,
    timestampAuthority: null,
    timestampedAt: null,
    status: 'none',
  };
}

/** True only when a stored token exists — never invent success from null columns. */
export function hasLiveTimestampToken(anchor: OutcomeTimestampAnchor): boolean {
  return (
    Boolean(anchor.timestampToken) && (anchor.status === 'stored' || anchor.status === 'verified')
  );
}
