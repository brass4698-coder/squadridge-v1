import type { LedgerEntry } from '../hooks/useLedger';
import type { RecordCardProps } from '../components/shared/RecordCard';
import {
  formatDisplayDate,
  formatRecordId,
  timestampStatusLabel,
  truncateAnchor,
  type LedgerDocumentFields,
} from '../data/ledgerSpecimens';

/** Honest document chrome for live API rows — only fields the public entry exposes. */
export function ledgerEntryToDocumentFields(entry: LedgerEntry): LedgerDocumentFields {
  const anchor = entry.ledger_sha ?? entry.id;
  const caseReference = entry.ledger_sha
    ? `SQR-${entry.ledger_sha.slice(0, 8).toUpperCase()}`
    : formatRecordId(`SQR-${entry.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`);
  const issuedAtDisplay = entry.published_at
    ? formatDisplayDate(entry.published_at.slice(0, 10))
    : '—';
  const title = entry.session?.title ?? 'Released outcome';
  const organisation = entry.session?.conflict_type ?? 'Facilitated session';

  return {
    caseReference,
    matterTitle: title,
    templateType: 'Released outcome record',
    issuedAtDisplay,
    approvedByRole: 'Designated facilitator (role attestation)',
    visibilityLabel: 'Public registry',
    classification: 'Approved outcome · public registry',
    facilitatorAttestation:
      'Attested for release by the designated facilitator after recorded party confirmations.',
    integrityScheme: entry.ledger_sha
      ? 'SHA-256 verification anchor'
      : 'Integrity stub — anchor pending',
    timestampLabel: timestampStatusLabel('not-attested', false),
    organisation,
    participantCount: undefined,
    anchorShort: entry.ledger_sha ? truncateAnchor(entry.ledger_sha) : truncateAnchor(anchor),
    verificationAnchor: entry.ledger_sha ?? undefined,
    isSpecimen: false,
  };
}

/** Map a live ledger entry to a card — does not replace with specimen data. */
export function ledgerEntryToCard(entry: LedgerEntry): RecordCardProps {
  const document = ledgerEntryToDocumentFields(entry);

  return {
    id: document.caseReference,
    title: entry.session?.title ?? 'Released outcome',
    summary: entry.summary,
    org: document.organisation,
    date: document.issuedAtDisplay,
    // Participant counts are not exposed on public ledger entries today.
    participantCount: undefined,
    variant: 'live',
    anchorStatus: 'verified',
    verificationAnchor: entry.ledger_sha ?? undefined,
    anchorShort: document.anchorShort ?? undefined,
    document,
    href: `/ledger/${entry.id}`,
  };
}
