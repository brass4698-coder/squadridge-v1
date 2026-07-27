import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, HelpCircle } from 'lucide-react';
import type { IncidentItemRow, IncidentRoomRow } from '../../lib/incident/types';
import { IncidentSeverityBadge } from './IncidentSeverityBadge';

type IncidentStatusCardsProps = {
  room: IncidentRoomRow;
  items: IncidentItemRow[];
};

function nextReviewLabel(room: IncidentRoomRow): string {
  const base = new Date(room.updated_at);
  base.setHours(base.getHours() + 24);
  return base.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function IncidentStatusCards({ room, items }: IncidentStatusCardsProps) {
  const verified = items.filter(
    (item) => item.verification_status === 'corroborated' && item.moderation_state !== 'removed',
  );
  const unclear = items.filter(
    (item) =>
      ['pending_review', 'disputed', 'unverified'].includes(item.verification_status) &&
      item.moderation_state !== 'removed',
  );
  const safety = items.filter(
    (item) => item.moderation_state === 'flagged' || Boolean(item.content_warning?.trim()),
  );

  return (
    <aside className="space-y-4" aria-labelledby="incident-status-heading">
      <header>
        <p className="font-mono text-app-meta uppercase tracking-[0.14em] text-brand">
          Room status
        </p>
        <h2
          id="incident-status-heading"
          className="font-heading text-page-title font-semibold text-ink"
        >
          At a glance
        </h2>
      </header>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-app-meta font-medium text-ink-secondary">Severity tier</p>
        <div className="mt-2">
          <IncidentSeverityBadge tier={room.severity_tier} />
        </div>
      </div>

      <StatusCard
        icon={<CheckCircle2 aria-hidden className="h-4 w-4 text-sem-success" />}
        title="What's verified"
        empty="No corroborated entries yet."
        lines={verified.slice(0, 3).map((item) => item.title)}
      />

      <StatusCard
        icon={<HelpCircle aria-hidden className="h-4 w-4 text-sem-warning" />}
        title="What's unclear"
        empty="No open verification questions."
        lines={unclear.slice(0, 3).map((item) => item.title)}
      />

      <StatusCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4 text-sem-danger" />}
        title="Safety concerns raised"
        empty="No flagged entries or content warnings."
        lines={safety.slice(0, 3).map((item) => item.title)}
      />

      <div className="rounded-lg border border-line bg-surface-secondary p-4">
        <div className="flex items-start gap-3">
          <Clock3 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="font-heading text-section-title font-semibold text-ink">
              Next review time
            </p>
            <p className="mt-1 font-mono text-app-meta tabular-nums text-ink-secondary">
              {nextReviewLabel(room)}
            </p>
            <p className="mt-2 text-app-body text-ink-secondary">
              Facilitators revisit flagged lanes and paused threads on this cadence during active
              incidents.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusCard({
  icon,
  title,
  empty,
  lines,
}: {
  icon: ReactNode;
  title: string;
  empty: string;
  lines: string[];
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading text-section-title font-semibold text-ink">{title}</h3>
      </div>
      {lines.length === 0 ? (
        <p className="mt-3 text-app-body text-ink-secondary">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lines.map((line) => (
            <li key={line} className="text-app-body text-ink-secondary">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
