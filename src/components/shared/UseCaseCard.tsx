import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RecordAnchorBadge } from './VerificationAnchorBadge';
import { ProcessDoctrine } from './ProcessDoctrine';

export interface UseCaseCardProps {
  id?: string;
  /** Intake query value: foundations | peacebuilding | hr */
  track?: 'foundations' | 'peacebuilding' | 'hr';
  sector: string;
  title: string;
  /** Problem framing — 1–2 lines */
  context: string;
  /** Why ordinary tools fail — short bullets */
  ordinaryToolsFail?: string[];
  /** How SquadRidge changes the process — short bullets */
  processChange?: string[];
  /** @deprecated Prefer ProcessDoctrine component — kept for data compatibility */
  processTieIn?: string;
  /** What the record can safely show — artifact + short verification mention */
  releasedRecord: string;
  /** Outcome closer */
  whySquadridge?: string;
  recordSampleId?: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * When true, omit sector/title chrome (for compact secondary rows).
   */
  embedded?: boolean;
}

export interface SecondaryUseCaseProps {
  id: string;
  sector: string;
  title: string;
  scenario: string;
  sameProcessAs: string;
  sameProcessContext: string;
  ctaLabel: string;
  ctaHref: string;
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="m-0 list-none space-y-2.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
          <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TrackBlock({
  label,
  children,
  tone = 'default',
}: {
  label: string;
  children: ReactNode;
  tone?: 'default' | 'sunken' | 'elevated';
}) {
  const toneClass =
    tone === 'sunken'
      ? 'bg-surface-sunken/60'
      : tone === 'elevated'
        ? 'bg-surface-elevated'
        : 'bg-surface-secondary/40';

  return (
    <div className={`border-t border-line px-4 py-5 md:px-5 ${toneClass}`}>
      <p className="m-0 mb-3 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Equal-weight buyer-track lane — problem → tools fail → process → safe record. */
export function UseCaseCard({
  sector,
  title,
  context,
  ordinaryToolsFail,
  processChange,
  releasedRecord,
  whySquadridge,
  recordSampleId,
  ctaLabel,
  ctaHref,
  embedded = false,
}: UseCaseCardProps) {
  const body = (
    <>
      <p className="m-0 text-sm leading-relaxed text-ink-secondary">
        <span className="font-medium text-ink">Problem. </span>
        {context}
      </p>

      <div className="mt-6 overflow-hidden rounded-[var(--sr-radius-md)] border border-line">
        {ordinaryToolsFail && ordinaryToolsFail.length > 0 ? (
          <TrackBlock label="Why ordinary tools fail" tone="default">
            <BulletList items={ordinaryToolsFail} />
          </TrackBlock>
        ) : null}

        {processChange && processChange.length > 0 ? (
          <TrackBlock label="How SquadRidge changes the process" tone="sunken">
            <BulletList items={processChange} />
            <div className="mt-4">
              <ProcessDoctrine compact />
            </div>
          </TrackBlock>
        ) : null}

        <TrackBlock label="What the record can safely show" tone="elevated">
          {recordSampleId ? (
            <div className="mb-3">
              <RecordAnchorBadge recordId={recordSampleId} />
            </div>
          ) : null}
          <p className="m-0 text-sm leading-relaxed text-ink-secondary">{releasedRecord}</p>
        </TrackBlock>
      </div>

      {whySquadridge ? (
        <p className="mt-5 mb-0 border-l-2 border-line-strong pl-4 text-sm leading-relaxed text-ink-secondary">
          <span className="font-medium text-ink">Outcome. </span>
          {whySquadridge}
        </p>
      ) : null}

      {embedded ? (
        <p className="mt-5 mb-0">
          <Link
            to={ctaHref}
            className="text-sm text-brand underline-offset-4 transition-colors hover:underline"
          >
            {ctaLabel}
          </Link>
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return <article className="px-1 py-5 md:px-2 md:py-6">{body}</article>;
  }

  return (
    <article className="flex h-full flex-col border border-line bg-surface-elevated">
      <div className="flex flex-1 flex-col p-5 md:p-6 lg:p-7">
        <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint">
          {sector}
        </p>
        <h2 className="mt-3 mb-0 font-display text-base font-medium leading-snug text-ink md:text-lg">
          {title}
        </h2>
        <div className="mt-5 min-w-0 flex-1">{body}</div>
        <Link
          to={ctaHref}
          className="btn-institutional btn-institutional--primary mt-6 inline-flex w-fit text-sm"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

/** Calm secondary track — scenario + same-process mini-line, not a full template. */
export function SecondaryUseCaseRow({
  id,
  sector,
  title,
  scenario,
  sameProcessAs,
  sameProcessContext,
  ctaLabel,
  ctaHref,
}: SecondaryUseCaseProps) {
  return (
    <li id={id} className="scroll-mt-20 py-7 md:py-8">
      <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em] text-ink-faint">
        {sector}
      </p>
      <h3 className="mt-2 mb-0 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">{scenario}</p>
      <p className="mt-3 mb-0 text-sm text-ink-faint">
        Uses the same process as {sameProcessAs} for {sameProcessContext}.
      </p>
      <Link
        to={ctaHref}
        className="mt-4 inline-block text-sm text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        {ctaLabel}
      </Link>
    </li>
  );
}
