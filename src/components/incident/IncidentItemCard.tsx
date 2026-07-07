import { useId, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/cn';
import { INCIDENT_LANES, type IncidentItemRow } from '../../lib/incident/types';
import { IncidentVerificationBadge } from './IncidentVerificationBadge';

type IncidentItemCardProps = {
  item: IncidentItemRow;
  selected?: boolean;
  onSelect?: (item: IncidentItemRow) => void;
};

function laneLabel(lane: IncidentItemRow['lane']): string {
  return INCIDENT_LANES.find((entry) => entry.value === lane)?.label ?? lane;
}

export function IncidentItemCard({ item, selected, onSelect }: IncidentItemCardProps) {
  const warningId = useId();
  const [expanded, setExpanded] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const hasWarning = Boolean(item.content_warning?.trim());
  const summary = item.body.length > 180 ? `${item.body.slice(0, 180).trim()}…` : item.body;

  return (
    <article
      className={cn(
        'rounded-lg border bg-surface p-4 transition-[border-color,box-shadow] duration-[var(--sr-duration-normal)] ease-[var(--sr-ease-spring)] motion-reduce:transition-none',
        selected ? 'border-brand/50 shadow-sr-sm' : 'border-line hover:border-line-strong',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-app-meta uppercase tracking-[0.12em] text-brand">
            {laneLabel(item.lane)}
          </p>
          <h3 className="font-heading text-section-title font-semibold text-ink">{item.title}</h3>
        </div>
        <IncidentVerificationBadge status={item.verification_status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-app-meta font-mono tabular-nums text-ink-secondary">
        <time dateTime={item.created_at}>
          {new Date(item.created_at).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1 text-brand underline-offset-4 hover:underline"
          >
            Source
            <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        ) : (
          <span className="text-ink-faint">No source link — marked unverified</span>
        )}
      </div>

      {hasWarning ? (
        <div className="mt-3 rounded-md border border-sem-warning/30 bg-sem-warning-soft px-3 py-2">
          <button
            type="button"
            aria-expanded={warningOpen}
            aria-controls={warningId}
            onClick={() => setWarningOpen((open) => !open)}
            className="focus-ring inline-flex min-h-[44px] w-full items-center justify-between text-left text-app-body font-medium text-sem-warning"
          >
            Content warning
            <span aria-hidden>{warningOpen ? '−' : '+'}</span>
          </button>
          {warningOpen ? (
            <p id={warningId} className="mt-2 text-app-body text-ink-secondary">
              {item.content_warning}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        {hasWarning && !warningOpen ? (
          <p className="text-app-body text-ink-secondary">
            Sensitive content is hidden. Open the content warning to read this entry.
          </p>
        ) : (
          <>
            <p className="text-app-body leading-relaxed text-ink-secondary">
              {expanded || !hasWarning ? item.body : summary}
            </p>
            {item.body.length > 180 ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="focus-ring mt-2 inline-flex min-h-[44px] items-center text-app-meta font-medium text-brand"
              >
                {expanded ? 'Show summary' : 'Read full entry'}
              </button>
            ) : null}
          </>
        )}
      </div>

      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="focus-ring mt-4 inline-flex min-h-[44px] items-center rounded-md border border-line px-3 text-app-meta font-medium text-ink-secondary transition-colors hover:border-brand/40 hover:text-ink"
        >
          Open related question
        </button>
      ) : null}
    </article>
  );
}
