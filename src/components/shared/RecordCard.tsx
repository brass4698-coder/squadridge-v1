import { Link } from 'react-router-dom';
import {
  getStatusChips,
  specimenToDocumentFields,
  type LedgerDocumentFields,
  type LedgerSpecimen,
  type StatusChip,
} from '../../data/ledgerSpecimens';
import { StatusBadge } from '../StatusBadge';
import { RecordAnchorBadge } from './VerificationAnchorBadge';
import {
  LedgerDocumentFooter,
  LedgerDocumentLetterhead,
  LedgerDocumentStubMeta,
  LedgerDocumentTitleBlock,
} from '../ledger/LedgerDocumentChrome';
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
  /** Official-document chrome fields (letterhead metadata). */
  document?: LedgerDocumentFields;
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

function resolveDocumentFields(props: Omit<RecordCardProps, 'href'>): LedgerDocumentFields {
  if (props.document) return props.document;
  const isSpecimen = props.variant === 'sample';
  return {
    caseReference: props.id,
    matterTitle: props.title,
    templateType: isSpecimen ? 'Illustrative outcome record' : 'Released outcome record',
    issuedAtDisplay: props.date,
    approvedByRole: 'Designated facilitator (role attestation)',
    visibilityLabel: isSpecimen ? 'Public registry (specimen format)' : 'Public registry',
    classification: isSpecimen
      ? 'Approved outcome · illustrative format'
      : 'Approved outcome · public registry',
    facilitatorAttestation:
      'Attested for release by the designated facilitator after recorded party confirmations.',
    integrityScheme: isSpecimen
      ? 'SHA-256 stub (illustrative — not verifiable)'
      : 'SHA-256 verification anchor',
    timestampLabel: isSpecimen
      ? 'Trusted timestamp — not applicable (specimen)'
      : 'Trusted timestamp — not attested (SHA-256 integrity only)',
    organisation: props.org,
    participantCount: props.participantCount,
    anchorShort: props.anchorShort,
    verificationAnchor: props.verificationAnchor,
    isSpecimen,
  };
}

/**
 * Formal released-document specimen — public artifact with letterhead.
 * On ledger-dark: elevated fill, hairline, soft shadow — no cream slabs.
 */
function RecordCardInner(props: Omit<RecordCardProps, 'href'>) {
  const { id, title, summary, variant, anchorStatus = 'verified' } = props;
  const chips = specimenLikeChips({ ...props, anchorStatus });
  const doc = resolveDocumentFields({ ...props, anchorStatus });

  return (
    <article
      className={cn(
        'sr-ledger-card sr-ledger-document overflow-hidden',
        variant === 'live'
          ? 'sr-ledger-card--published'
          : 'sr-ledger-card--illustrative sr-specimen-surface',
      )}
    >
      <div className="sr-registry-pad">
        <LedgerDocumentLetterhead
          variant="full"
          isSpecimen={doc.isSpecimen}
          caseReference={doc.caseReference}
          classification={doc.classification}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">{chips.map(chipForKind)}</div>
        <div className="mt-4">
          <LedgerDocumentTitleBlock
            templateType={doc.templateType}
            title={title}
            summary={summary}
          />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b border-line sr-registry-pad sm:border-r">
            <p className="sr-meta-label">Issuing body</p>
            <p className="sr-meta-value mt-1.5">{doc.organisation}</p>
          </div>
          <div className="border-b border-line sr-registry-pad">
            <p className="sr-meta-label">Issued / approved</p>
            <p className="sr-meta-value mt-1.5">{doc.issuedAtDisplay}</p>
          </div>
          <div className="border-b border-line sr-registry-pad sm:border-b-0 sm:border-r">
            <p className="sr-meta-label">Approved by</p>
            <p className="sr-meta-value mt-1.5">{doc.approvedByRole}</p>
          </div>
          <div className="sr-registry-pad">
            <p className="sr-meta-label">Visibility</p>
            <p className="sr-meta-value mt-1.5">{doc.visibilityLabel}</p>
          </div>
        </div>
      </div>

      <div className="sr-registry-pad pt-0">
        <LedgerDocumentFooter fields={doc} compact />
        <span className="sr-only">Record {id}</span>
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
 * Archival index entry — compact official filing stub with SquadRidge letterhead.
 * Chip order: ILLUSTRATIVE|PUBLISHED → ANCHOR VERIFIED → RECORD ID (top only).
 */
export function RecordCardCompact(props: RecordCardProps) {
  const { id, title, variant, anchorStatus = 'verified', href } = props;
  const chips = specimenLikeChips({ ...props, anchorStatus });
  const doc = resolveDocumentFields({ ...props, anchorStatus });

  const content = (
    <article
      className={cn(
        'sr-ledger-card sr-registry-card sr-ledger-document',
        variant === 'live'
          ? 'sr-ledger-card--published'
          : 'sr-ledger-card--illustrative sr-specimen-surface',
      )}
    >
      <div className="flex flex-col gap-3">
        <LedgerDocumentLetterhead
          variant="compact"
          isSpecimen={doc.isSpecimen}
          caseReference={doc.caseReference}
          classification={doc.classification}
        />
        <div className="flex flex-wrap items-center gap-2">{chips.map(chipForKind)}</div>
        <LedgerDocumentTitleBlock compact templateType={doc.templateType} title={title} />
        <LedgerDocumentStubMeta fields={doc} />
        <LedgerDocumentFooter fields={doc} compact />
        <span className="sr-only">Record {id}</span>
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
    document: specimenToDocumentFields(specimen),
    href,
  };
}
