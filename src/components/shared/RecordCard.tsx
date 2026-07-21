import { Link } from 'react-router-dom';
import { StatusBadge } from '../StatusBadge';
import { VerificationAnchorBadge } from './VerificationAnchorBadge';
import { MetaField } from '../landing/MetaField';

export interface RecordCardProps {
  id: string;
  title: string;
  summary: string;
  org: string;
  date: string;
  participantCount: number;
  variant: 'sample' | 'live';
  anchorStatus?: 'verified' | 'withdrawn';
  href?: string;
}

/**
 * Formal released-document specimen — public artifact.
 * Metadata uses MetaField flex stacks only (no dt/dd).
 */
function RecordCardInner({
  id,
  title,
  summary,
  org,
  date,
  participantCount,
  variant,
  anchorStatus = 'verified',
}: Omit<RecordCardProps, 'href'>) {
  return (
    <article className="sr-evidence-frame sr-mode-ledger overflow-hidden">
      <header className="border-b border-[color:var(--color-border-subtle)] px-5 py-5 md:px-7 md:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <MetaField label="Record ID" value={id} mono />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {variant === 'sample' ? (
              <StatusBadge variant="illustrative">Illustrative</StatusBadge>
            ) : (
              <StatusBadge variant="live">Live</StatusBadge>
            )}
            <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 py-7 md:px-7 md:py-8">
        <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
          Released outcome
        </p>
        <h3 className="font-display m-0 text-xl font-medium leading-snug tracking-tight text-ink md:text-[1.375rem]">
          {title}
        </h3>
        <p className="m-0 max-w-prose text-sm leading-[1.65] text-ink-secondary">{summary}</p>
      </div>

      <div className="grid grid-cols-1 border-t border-[color:var(--color-border-subtle)] sm:grid-cols-2">
        <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-secondary/60 px-5 py-5 sm:border-r md:px-7 md:py-6">
          <MetaField label="Organisation" value={org} />
        </div>
        <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-secondary/60 px-5 py-5 md:px-7 md:py-6">
          <MetaField label="Released" value={date} />
        </div>
        <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-secondary/60 px-5 py-5 sm:border-b-0 sm:border-r md:px-7 md:py-6">
          <MetaField label="Participants" value={`${participantCount} verified`} />
        </div>
        <div className="bg-surface-secondary/60 px-5 py-5 md:px-7 md:py-6">
          <MetaField label="Anchor" value={id} mono />
        </div>
      </div>

      {variant === 'sample' ? (
        <footer className="flex flex-col gap-2 border-t border-sem-warning/30 bg-sem-warning-soft px-5 py-4 md:px-7">
          <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-sem-warning">
            Notice
          </p>
          <p className="m-0 text-sm leading-snug text-ink-secondary">
            Sample data, not a real released record. The session that produces an outcome is never
            public.
          </p>
        </footer>
      ) : null}
    </article>
  );
}

export function RecordCard(props: RecordCardProps) {
  const { href, ...inner } = props;

  if (href) {
    return (
      <Link to={href} className="block">
        <RecordCardInner {...inner} />
      </Link>
    );
  }

  return <RecordCardInner {...inner} />;
}

export function RecordCardCompact({
  id,
  title,
  org,
  date,
  participantCount,
  variant,
  anchorStatus = 'verified',
  href,
}: RecordCardProps) {
  const content = (
    <article className="bg-surface-elevated px-5 py-4 transition-colors hover:bg-surface-sunken/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-2 font-mono text-xs text-ink-faint">{id}</p>
          <h2 className="font-display m-0 text-sm font-medium text-ink">{title}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <MetaField label="Organisation" value={org} />
            <MetaField label="Released" value={date} />
            <MetaField label="Participants" value={`${participantCount} verified`} />
          </div>
        </div>
        <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
      </div>
      {variant === 'sample' ? (
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
          Illustrative example. Session room content is never published.
        </p>
      ) : null}
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
