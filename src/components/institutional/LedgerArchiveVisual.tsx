import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';
import { StatusChip } from './StatusChip';

const SAMPLE_ENTRIES = [
  {
    id: 'SQR-2024-0147',
    title: 'Land Use — Joint Principles',
    org: 'Regional mediation',
    anchor: 'a3f9…ef90',
    status: 'verified' as const,
  },
  {
    id: 'SQR-2026-0312',
    title: 'Community Safety — Action Commitments',
    org: 'Municipal office',
    anchor: '8f3a…c21d',
    status: 'verified' as const,
  },
  {
    id: '—',
    title: 'Awaiting facilitator release',
    org: 'Session in progress',
    anchor: 'Pending',
    status: 'pending' as const,
  },
];

/**
 * Archival ledger stack — document-grade, verifiable, procedural.
 */
export function LedgerArchiveVisual({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Archival stack of released outcome records with verification anchors and release states"
      className={className}
      aspect="video"
    >
      <div className="flex w-full max-w-md flex-col gap-3">
        {SAMPLE_ENTRIES.map((entry, index) => (
          <article
            key={entry.id + index}
            className="border border-line bg-surface-sunken p-4"
            style={{
              transform: `translateX(${index * 6}px)`,
              opacity: 1 - index * 0.12,
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-mono text-[0.6rem] uppercase tracking-wider text-ink-faint">
                {entry.id}
              </p>
              <StatusChip
                label={entry.status === 'verified' ? 'Anchored' : 'Pending'}
                variant={entry.status === 'verified' ? 'released' : 'pending'}
              />
            </header>
            <h3 className="mt-2 text-sm font-medium text-ink">{entry.title}</h3>
            <p className="mt-1 text-xs text-ink-secondary">{entry.org}</p>
            <p className="mt-3 font-mono text-[0.65rem] text-ink-faint">sha256:{entry.anchor}</p>
          </article>
        ))}
        <p className="text-xs leading-relaxed text-ink-faint">
          Illustrative format — room dialogue never appears in ledger entries.
        </p>
      </div>
    </InstitutionalVisualFrame>
  );
}
