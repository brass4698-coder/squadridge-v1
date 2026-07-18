import { Link } from 'react-router-dom';
import { VerificationAnchorBadge } from './VerificationAnchorBadge';

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
    <article className="overflow-hidden border border-line bg-surface-elevated">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs text-ink-faint">{id}</p>
          {variant === 'sample' ? (
            <span className="border border-line bg-surface-secondary px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider text-ink-faint">
              Illustrative
            </span>
          ) : null}
        </div>
        <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
      </header>

      <div className="px-6 py-6">
        <h3 className="font-display text-lg font-medium leading-tight text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{summary}</p>
      </div>

      <dl className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-2">
        <MetaCell label="Organisation" value={org} />
        <MetaCell label="Released" value={date} />
        <MetaCell label="Participants" value={`${participantCount} verified`} />
        <MetaCell label="Anchor" value={id} mono />
      </dl>

      {variant === 'sample' ? (
        <footer className="border-t border-line px-6 py-4">
          <p className="text-xs text-ink-faint">
            Sample data, not a real released record. The session that produces an outcome is never
            public.
          </p>
        </footer>
      ) : null}
    </article>
  );
}

function MetaCell({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-surface px-6 py-4">
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-ink-secondary' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

export function RecordCard(props: RecordCardProps) {
  const { href, ...inner } = props;

  if (href) {
    return (
      <Link to={href} className="block transition-colors hover:border-line-strong">
        <RecordCardInner {...inner} />
      </Link>
    );
  }

  return <RecordCardInner {...inner} />;
}

/** Compact list-row variant for the ledger index. */
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
    <article className="border border-line bg-surface-elevated p-6 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-xs text-ink-faint">{id}</p>
          <h2 className="font-display text-sm font-medium text-ink">{title}</h2>
          <p className="mt-1 text-xs text-ink-secondary">
            {org} · {date} · {participantCount} verified participants
          </p>
        </div>
        <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
      </div>
      {variant === 'sample' ? (
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-faint">
          Illustrative example. Session room content is never published.
        </p>
      ) : null}
    </article>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
