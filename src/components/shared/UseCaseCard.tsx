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

/** Case-file row for operational contexts — archival list, not equal tiles. */
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
    <article className="border-b border-line bg-surface-elevated last:border-b-0">
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:gap-10 md:p-6 lg:p-7">
        <div>
          <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
            {sector}
          </p>
          <h2 className="mt-3 font-display text-base font-medium leading-snug text-ink md:text-lg">
            {title}
          </h2>
          <Link
            to={ctaHref}
            className="mt-4 inline-block text-sm text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-ink-secondary">{context}</p>

          <dl className="mt-5 divide-y divide-line border border-line">
            <div className="bg-surface-sunken px-4 py-3.5">
              <dt className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                In the room
              </dt>
              <dd className="text-sm leading-relaxed text-ink-secondary">{inTheRoom}</dd>
            </div>
            <div className="bg-surface-elevated px-4 py-3.5">
              <dt className="mb-1 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                Released record
                {recordSampleId ? <RecordAnchorBadge recordId={recordSampleId} /> : null}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-secondary">{releasedRecord}</dd>
            </div>
          </dl>

          {whySquadridge ? (
            <p className="mt-4 border-l border-line-strong pl-4 text-sm leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Fit: </span>
              {whySquadridge}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
