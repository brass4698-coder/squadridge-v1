import type { LedgerEntry } from '../hooks/useLedger';
import type { RecordCardProps } from '../components/shared/RecordCard';
import { formatDisplayDate, truncateAnchor } from '../data/ledgerSpecimens';

/** Map a live ledger entry to a card — does not replace with specimen data. */
export function ledgerEntryToCard(entry: LedgerEntry): RecordCardProps {
  const anchor = entry.ledger_sha ?? entry.id;
  const anchorLabel = entry.ledger_sha
    ? `SQR-${entry.ledger_sha.slice(0, 8).toUpperCase()}`
    : `SQR-${entry.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  return {
    id: anchorLabel,
    title: entry.session?.title ?? 'Released outcome',
    summary: entry.summary,
    org: entry.session?.conflict_type ?? 'Facilitated session',
    date: entry.published_at ? formatDisplayDate(entry.published_at.slice(0, 10)) : '—',
    // Participant counts are not exposed on public ledger entries today.
    participantCount: undefined,
    variant: 'live',
    anchorStatus: 'verified',
    verificationAnchor: entry.ledger_sha ?? undefined,
    anchorShort: entry.ledger_sha ? truncateAnchor(entry.ledger_sha) : truncateAnchor(anchor),
    href: `/ledger/${entry.id}`,
  };
}
