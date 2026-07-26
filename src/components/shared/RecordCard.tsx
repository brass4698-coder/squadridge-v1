import { Link } from 'react-router-dom';
import { getStatusChips, type LedgerSpecimen, type StatusChip } from '../../data/ledgerSpecimens';
import { StatusBadge } from '../StatusBadge';
import { RecordAnchorBadge } from './VerificationAnchorBadge';
import { MetaField, MetaFieldGrid } from '../landing/MetaField';
import { CapsLabel } from './CapsLabel';
import { cn } from '../../lib/cn';

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
  /** Full verification anchor when available (specimen / live). */
  verificationAnchor?: string;
  /** Truncated display form e.g. 7c3a…e91f */
  anchorShort?: string;
}

function chipForKind(chip: StatusChip) {
  const key = `${chip.kind}:${chip.label}`;
  if (chip.kind === 'illustrative' || chip.kind === 'pending' || chip.kind === 'superseded') {
    return (
      <StatusBadge key={key} variant="illustrative">
        {chip.label}
      </StatusBadge>
    );
  }
  if (chip.kind === 'published') {
    return (
      <StatusBadge key={key} variant="published">
        {chip.label}
      </StatusBadge>
    );
  }
  if (chip.kind === 'anchor-verified') {
    return (
      <StatusBadge key={key} variant="anchor">
        {chip.label}
      </StatusBadge>
    );
  }
  return <RecordAnchorBadge key={key} recordId={chip.label} />;
}

function specimenLikeChips(
  props: Omit<RecordCardProps, 'href' | 'summary' | 'title'>,
): StatusChip[] {
  if (props.variant === 'sample') {
    return getStatusChips({
      id: props.id,
      specimenType: 'illustrative',
      status: props.anchorStatus === 'withdrawn' ? 'superseded' : 'anchor-verified',
    });
  }
  return getStatusChips({
    id: props.id,
    specimenType: 'live',
    status: props.anchorStatus === 'withdrawn' ? 'superseded' : 'anchor-verified',
  });
}

function resolveAnchorDisplay(
  id: string,
  verificationAnchor?: string,
  anchorShort?: string,
): string | null {
  if (anchorShort) return anchorShort;
  if (verificationAnchor) {
    return `${verificationAnchor.slice(0, 4)}…${verificationAnchor.slice(-4)}`;
  }
  void id;
  return null;
}

function VerificationMetaValue({ verified }: { verified: boolean }) {
  if (!verified) {
    return <span className="text-ink-faint">Withdrawn</span>;
  }
  return (
    <span className="sr-verify">
      <span className="sr-verify-dot" aria-hidden />
      Anchor verified
    </span>
  );
}

/**
 * Formal released-document specimen — public artifact.
 * On ledger-dark: elevated fill, hairline, soft shadow — no cream slabs.
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
  verificationAnchor,
  anchorShort,
}: Omit<RecordCardProps, 'href'>) {
  const chips = specimenLikeChips({
    id,
    org,
    date,
    participantCount,
    variant,
    anchorStatus,
    verificationAnchor,
    anchorShort,
  });
  const anchorDisplay = resolveAnchorDisplay(id, verificationAnchor, anchorShort);

  return (
    <article
      className={cn(
        'sr-ledger-card overflow-hidden',
        variant === 'live'
          ? 'sr-ledger-card--published'
          : 'sr-ledger-card--illustrative sr-specimen-surface',
      )}
    >
      <header className="border-b border-line sr-registry-pad">
        <div className="flex flex-wrap items-center gap-2">{chips.map(chipForKind)}</div>
      </header>

      <div className="flex flex-col gap-3 sr-registry-pad">
        <CapsLabel>Released outcome</CapsLabel>
        <h3 className="m-0 font-sans text-xl font-semibold leading-snug tracking-[-0.02em] text-ink md:text-[1.375rem]">
          {title}
        </h3>
        <p className="m-0 max-w-prose text-sm leading-[1.65] text-ink-secondary">{summary}</p>
      </div>

      <div className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
        <div className="border-b border-line sr-registry-pad sm:border-r">
          <MetaField label="Organisation" value={org} />
        </div>
        <div className="border-b border-line sr-registry-pad">
          <MetaField label="Released" value={date} />
        </div>
        {typeof participantCount === 'number' ? (
          <div className="border-b border-line sr-registry-pad sm:border-b-0 sm:border-r">
            <MetaField label="Participants" value={`${participantCount} verified`} />
          </div>
        ) : null}
        <div className="sr-registry-pad">
          {anchorDisplay ? (
            <MetaField label="Anchor" value={anchorDisplay} mono />
          ) : (
            <MetaField
              label="Verification"
              value={<VerificationMetaValue verified={anchorStatus !== 'withdrawn'} />}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function RecordCard(props: RecordCardProps) {
  const { href, ...inner } = props;

  if (href) {
    return (
      <Link
        to={href}
        className="block rounded-[var(--sr-radius-lg)] no-underline outline-none transition-[transform,box-shadow] duration-[var(--sr-duration-governed)] ease-[var(--sr-ease-governed)] hover:-translate-y-px focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]"
      >
        <RecordCardInner {...inner} />
      </Link>
    );
  }

  return <RecordCardInner {...inner} />;
}

/**
 * Archival index entry — elevated dark filing row.
 * Chip order: ILLUSTRATIVE|PUBLISHED → ANCHOR VERIFIED → RECORD ID (top only).
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
  verificationAnchor,
  anchorShort,
}: RecordCardProps) {
  const chips = specimenLikeChips({
    id,
    org,
    date,
    participantCount,
    variant,
    anchorStatus,
    verificationAnchor,
    anchorShort,
  });
  const anchorDisplay = resolveAnchorDisplay(id, verificationAnchor, anchorShort);

  const content = (
    <article
      className={cn(
        'sr-ledger-card sr-registry-card',
        variant === 'live'
          ? 'sr-ledger-card--published'
          : 'sr-ledger-card--illustrative sr-specimen-surface',
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">{chips.map(chipForKind)}</div>
        <h2 className="m-0 font-sans text-base font-semibold leading-snug tracking-[-0.02em] text-ink md:text-lg">
          {title}
        </h2>
        <MetaFieldGrid columns={4} className="mt-1">
          <MetaField label="Organisation" value={org} />
          <MetaField label="Released" value={date} />
          {typeof participantCount === 'number' ? (
            <MetaField label="Participants" value={`${participantCount} verified`} />
          ) : (
            <MetaField label="Participants" value="Identities not public" />
          )}
          {anchorDisplay ? (
            <MetaField label="Anchor" value={anchorDisplay} mono />
          ) : (
            <MetaField
              label="Verification"
              value={<VerificationMetaValue verified={anchorStatus !== 'withdrawn'} />}
            />
          )}
        </MetaFieldGrid>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="block rounded-[var(--sr-radius-lg)] outline-none focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/** Adapt a LedgerSpecimen into RecordCardProps. */
export function specimenToRecordCardProps(
  specimen: LedgerSpecimen,
  href?: string,
): RecordCardProps {
  return {
    id: specimen.id,
    title: specimen.title,
    summary: specimen.summary,
    org: specimen.organisation,
    date: specimen.displayDate,
    participantCount: specimen.participantCount,
    variant: specimen.specimenType === 'live' ? 'live' : 'sample',
    anchorStatus: specimen.status === 'anchor-verified' ? 'verified' : 'withdrawn',
    verificationAnchor: specimen.verificationAnchor,
    anchorShort: specimen.anchorShort,
    href,
  };
}
