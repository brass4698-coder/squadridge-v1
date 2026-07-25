import { Link } from 'react-router-dom';
import { RecordAnchorBadge } from './VerificationAnchorBadge';

export interface UseCaseCardProps {
  id?: string;
  /** Intake query value: foundations | peacebuilding | hr */
  track?: 'foundations' | 'peacebuilding' | 'hr';
  sector: string;
  title: string;
  /** Problem framing — one short paragraph */
  context: string;
  /** Exactly three friction bullets — parallel across tracks */
  bullets?: string[];
  /** Approved record artifact — short, concrete */
  releasedRecord: string;
  /** One-line outcome */
  whySquadridge?: string;
  recordSampleId?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface SecondaryUseCaseProps {
  id: string;
  sector: string;
  title: string;
  scenario: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Buyer-track lane — fixed parallel anatomy:
 * sector → title → problem → friction → approved record → outcome → CTA
 */
export function UseCaseCard({
  sector,
  title,
  context,
  bullets,
  releasedRecord,
  whySquadridge,
  recordSampleId,
  ctaLabel,
  ctaHref,
}: UseCaseCardProps) {
  return (
    <article className="overflow-hidden rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="p-5 md:p-6 lg:p-7">
          <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            {sector}
          </p>
          <h3 className="mt-2.5 mb-0 font-display text-lg font-medium leading-snug text-ink md:text-xl">
            {title}
          </h3>
          <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
            {context}
          </p>

          {bullets && bullets.length > 0 ? (
            <div className="mt-5">
              <p className="m-0 mb-2.5 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                Where common tools fail
              </p>
              <ul className="m-0 list-none space-y-2 p-0">
                {bullets.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand"
                    />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col border-t border-line bg-surface-sunken/40 p-5 md:p-6 lg:border-l lg:border-t-0 lg:p-7">
          <p className="m-0 mb-2.5 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Approved record
          </p>
          {recordSampleId ? (
            <div className="mb-2.5">
              <RecordAnchorBadge recordId={recordSampleId} />
            </div>
          ) : null}
          <p className="m-0 text-sm leading-relaxed text-ink-secondary">{releasedRecord}</p>

          {whySquadridge ? (
            <p className="mt-4 mb-0 border-l-2 border-line-strong pl-3.5 text-sm leading-relaxed text-ink">
              {whySquadridge}
            </p>
          ) : null}

          <Link
            to={ctaHref}
            className="btn-institutional btn-institutional--primary mt-5 inline-flex w-fit text-sm lg:mt-auto"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Adjacent context — sector, scenario, text link.
 * Intentionally lighter than primary lanes; CTA implies the primary-track mapping.
 */
export function SecondaryUseCaseRow({
  id,
  sector,
  title,
  scenario,
  ctaLabel,
  ctaHref,
}: SecondaryUseCaseProps) {
  return (
    <li id={id} className="scroll-mt-20 list-none">
      <article className="flex h-full flex-col border-t border-line pt-5 md:pt-6">
        <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          {sector}
        </p>
        <h3 className="mt-2 mb-0 text-base font-semibold leading-snug text-ink">{title}</h3>
        <p className="mt-2.5 mb-0 flex-1 text-sm leading-relaxed text-ink-secondary">{scenario}</p>
        <Link
          to={ctaHref}
          className="mt-4 inline-flex w-fit text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {ctaLabel}
        </Link>
      </article>
    </li>
  );
}
