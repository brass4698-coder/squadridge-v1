import { Link } from 'react-router-dom';
import { StatusBadge } from '../StatusBadge';
import { VerificationAnchorBadge, RecordAnchorBadge } from './VerificationAnchorBadge';
import { MetaField } from '../landing/MetaField';
import { CapsLabel } from './CapsLabel';

export interface RecordCardProps {
  id: string;
  title: string;
  summary: string;
  org: string;
  date: string;
  /** Omit when count is unknown (public live entries). */
  participantCount?: number;
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
              <StatusBadge variant="live">Published</StatusBadge>
            )}
            <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 py-7 md:px-7 md:py-8">
        <CapsLabel>Released outcome</CapsLabel>
        <h3 className="font-display m-0 text-xl font-medium leading-snug tracking-tight text-ink md:text-[1.375rem]">
          {title}
        </h3>
        <p className="m-0 max-w-prose text-sm leading-[1.65] text-ink-secondary">{summary}</p>
      </div>

      <div className="grid grid-cols-1 border-t border-[color:var(--color-border-subtle)] sm:grid-cols-2">
        <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/40 px-5 py-5 sm:border-r md:px-7 md:py-6">
          <MetaField label="Organisation" value={org} />
        </div>
        <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/40 px-5 py-5 md:px-7 md:py-6">
          <MetaField label="Released" value={date} />
        </div>
        {typeof participantCount === 'number' ? (
          <div className="border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/40 px-5 py-5 sm:border-b-0 sm:border-r md:px-7 md:py-6">
            <MetaField label="Participants" value={`${participantCount} verified`} />
          </div>
        ) : null}
        <div className="bg-surface-sunken/40 px-5 py-5 md:px-7 md:py-6">
          <MetaField label="Anchor" value={id} mono />
        </div>
      </div>
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

/**
 * Archival index entry — sealed filing row for the public ledger.
 * Hierarchy: catalog ID → title → metadata → anchor state.
 */
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
    <article
      className={
        variant === 'sample'
          ? 'bg-surface-elevated/70 px-5 py-5 transition-colors hover:bg-surface-sunken/30 md:px-6'
          : 'bg-surface-elevated px-5 py-5 transition-colors hover:bg-surface-sunken/40 md:px-6'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RecordAnchorBadge recordId={id} />
            {variant === 'sample' ? (
              <StatusBadge variant="illustrative">Illustrative</StatusBadge>
            ) : (
              <StatusBadge variant="live">Published</StatusBadge>
            )}
          </div>
          <h2 className="font-display mt-3 mb-0 text-base font-medium leading-snug tracking-tight text-ink md:text-lg">
            {title}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <MetaField label="Organisation" value={org} />
            <MetaField label="Released" value={date} />
            {typeof participantCount === 'number' ? (
              <MetaField label="Participants" value={`${participantCount} verified`} />
            ) : (
              <MetaField label="Scope" value="Approved text only" />
            )}
          </div>
        </div>
        <div className="shrink-0 sm:pt-0.5">
          <VerificationAnchorBadge anchorId={id} status={anchorStatus} />
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        {content}
      </Link>
    );
  }

  return content;
}
