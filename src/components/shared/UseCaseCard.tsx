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
    <article className="flex flex-col border border-line bg-surface-elevated p-8">
      <p className="mb-3 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
        {sector}
      </p>
      <h2 className="mb-3 font-display text-lg font-medium leading-snug text-ink">{title}</h2>
      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">{context}</p>

      <dl className="mb-6 flex flex-1 flex-col gap-px border border-line bg-line">
        <div className="bg-surface-sunken p-4">
          <dt className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
            In the room
          </dt>
          <dd className="text-sm leading-relaxed text-ink-secondary">{inTheRoom}</dd>
        </div>
        <div className="bg-surface-elevated p-4">
          <dt className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
            Released record
            {recordSampleId ? <RecordAnchorBadge recordId={recordSampleId} /> : null}
          </dt>
          <dd className="text-sm leading-relaxed text-ink-secondary">{releasedRecord}</dd>
        </div>
      </dl>

      {whySquadridge ? (
        <p className="mb-6 border-l border-line-strong pl-4 text-sm leading-relaxed text-ink-secondary">
          <span className="font-medium text-ink">Fit: </span>
          {whySquadridge}
        </p>
      ) : null}

      <Link
        to={ctaHref}
        className="text-sm text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
