import { Link } from 'react-router-dom';
import { RecordAnchorBadge } from './VerificationAnchorBadge';

export interface UseCaseCardProps {
  sector: string;
  title: string;
  context: string;
  inTheRoom: string;
  releasedRecord: string;
  whySquadridge?: string;
  recordSampleId?: string;
  ctaLabel: string;
  ctaHref: string;
}

export function UseCaseCard({
  sector,
  title,
  context,
  inTheRoom,
  releasedRecord,
  whySquadridge,
  recordSampleId,
  ctaLabel,
  ctaHref,
}: UseCaseCardProps) {
  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface-elevated p-8 shadow-sr-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">{sector}</p>
      <h2 className="mb-3 text-lg font-semibold leading-snug text-ink">{title}</h2>
      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">{context}</p>

      <dl className="mb-6 flex flex-1 flex-col gap-4">
        <div className="rounded-lg border border-line bg-surface-sunken p-4">
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            In the room
          </dt>
          <dd className="text-sm leading-relaxed text-ink">{inTheRoom}</dd>
        </div>
        <div className="rounded-lg border border-brand/30 bg-brand-soft p-4">
          <dt className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            Released record
            {recordSampleId ? <RecordAnchorBadge recordId={recordSampleId} /> : null}
          </dt>
          <dd className="text-sm leading-relaxed text-ink">{releasedRecord}</dd>
        </div>
      </dl>

      {whySquadridge ? (
        <p className="mb-6 border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-ink-secondary">
          <span className="font-medium text-ink">Why SquadRidge: </span>
          {whySquadridge}
        </p>
      ) : null}

      <Link
        to={ctaHref}
        className="text-sm font-medium text-brand underline transition-opacity hover:opacity-70"
      >
        {ctaLabel} →
      </Link>
    </article>
  );
}
