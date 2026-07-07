import { EmptyState } from '../ui/EmptyState';
import { INCIDENT_LANES, type IncidentItemRow, type IncidentLane } from '../../lib/incident/types';
import { IncidentItemCard } from './IncidentItemCard';

type IncidentLedgerPanelProps = {
  items: IncidentItemRow[];
  laneFilter: IncidentLane | 'all';
  onLaneFilterChange: (lane: IncidentLane | 'all') => void;
  onSelectItem?: (item: IncidentItemRow) => void;
  selectedItemId?: string | null;
  loading?: boolean;
};

export function IncidentLedgerPanel({
  items,
  laneFilter,
  onLaneFilterChange,
  onSelectItem,
  selectedItemId,
  loading,
}: IncidentLedgerPanelProps) {
  const filtered = laneFilter === 'all' ? items : items.filter((item) => item.lane === laneFilter);

  return (
    <aside className="flex min-h-0 flex-col gap-4" aria-labelledby="incident-ledger-heading">
      <header className="space-y-3">
        <div>
          <p className="font-mono text-app-meta uppercase tracking-[0.14em] text-brand">Ledger</p>
          <h2
            id="incident-ledger-heading"
            className="font-display text-page-title font-semibold text-ink"
          >
            Evidence record
          </h2>
          <p className="mt-1 text-app-body text-ink-secondary">
            Chronological entries grouped by verification lane. Sentiment is a signal, not proof.
          </p>
        </div>

        <label className="block space-y-1">
          <span className="sr-only">Filter by lane</span>
          <select
            value={laneFilter}
            onChange={(event) => onLaneFilterChange(event.target.value as IncidentLane | 'all')}
            className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
          >
            <option value="all">All lanes</option>
            {INCIDENT_LANES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [content-visibility:auto]">
        {loading ? (
          <IncidentLedgerSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            heading="No ledger entries yet"
            body="When facilitators add verified sources, they will appear here in chronological order."
          />
        ) : (
          filtered.map((item) => (
            <IncidentItemCard
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              onSelect={onSelectItem}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function IncidentLedgerSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-line bg-surface p-4 motion-reduce:animate-none"
        >
          <div className="h-3 w-24 rounded bg-surface-secondary" />
          <div className="mt-3 h-4 w-3/4 rounded bg-surface-secondary" />
          <div className="mt-2 h-3 w-full rounded bg-surface-secondary/80" />
          <div className="mt-2 h-3 w-5/6 rounded bg-surface-secondary/60" />
        </div>
      ))}
    </>
  );
}
