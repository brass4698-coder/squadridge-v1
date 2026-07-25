import type { LedgerEntry } from '../hooks/useLedger';
import type { RecordCardProps } from '../components/shared/RecordCard';

export function ledgerEntryToCard(entry: LedgerEntry): RecordCardProps {
  const anchorLabel = entry.ledger_sha
    ? `SQR-${entry.ledger_sha.slice(0, 8).toUpperCase()}`
    : `SQR-${entry.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  return {
    id: anchorLabel,
    title: entry.session?.title ?? 'Released outcome',
    summary: entry.summary,
    org: entry.session?.conflict_type ?? 'Facilitated session',
    date: entry.published_at
      ? new Date(entry.published_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—',
    // Participant counts are not exposed on public ledger entries today.
    participantCount: undefined,
    variant: 'live',
    href: `/ledger/${entry.id}`,
  };
}
