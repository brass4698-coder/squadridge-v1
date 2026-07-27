import type { ReactNode } from 'react';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { CapsLabel } from '../shared/CapsLabel';
import { MetaField, MetaFieldGrid } from '../landing/MetaField';
import { cn } from '../../lib/cn';

export type LedgerDocumentChromeFields = {
  caseReference: string;
  matterTitle: string;
  templateType: string;
  issuedAtDisplay: string;
  approvedByRole: string;
  visibilityLabel: string;
  classification: string;
  facilitatorAttestation: string;
  integrityScheme: string;
  timestampLabel: string;
  organisation: string;
  participantCount?: number;
  anchorShort?: string | null;
  verificationAnchor?: string;
  isSpecimen: boolean;
};

function DocMetaCell({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0 border-t border-line px-4 py-3.5 first:border-t-0 sm:border-t-0 sm:border-l sm:px-5 sm:py-4 sm:first:border-l-0">
      <p className="sr-meta-label">{label}</p>
      <p className={cn('sr-meta-value mt-1.5', mono && 'font-mono text-xs tracking-wide')}>
        {value}
      </p>
    </div>
  );
}

/**
 * Letterhead for ledger instruments — mark/lockup + registry classification.
 * Decorative when a document title follows; labelled when used as sole brand signal.
 */
export function LedgerDocumentLetterhead({
  variant = 'full',
  isSpecimen,
  caseReference,
  classification,
  className,
}: {
  variant?: 'compact' | 'full';
  isSpecimen: boolean;
  caseReference: string;
  classification: string;
  className?: string;
}) {
  const lockupSize = variant === 'compact' ? 'sm' : 'md';
  const brandAlt = variant === 'full' ? 'SquadRidge — Outcome Ledger' : undefined;

  return (
    <header
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 border-b border-line',
        variant === 'compact' ? 'pb-3' : 'pb-5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <SquadRidgeLockup
          size={lockupSize}
          alt={brandAlt}
          className={variant === 'compact' ? 'opacity-95' : undefined}
        />
        <p
          className={cn(
            'm-0 font-mono uppercase tracking-[var(--tracking-caps)] text-ink-faint',
            variant === 'compact' ? 'text-[0.6rem]' : 'text-[length:var(--text-label)]',
          )}
        >
          {isSpecimen
            ? 'Illustrative instrument · format specimen'
            : 'Outcome ledger · released record'}
        </p>
      </div>
      <div className="min-w-0 text-right">
        <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-secondary">
          {classification}
        </p>
        <p className="mt-1 mb-0 font-mono text-xs text-ink tabular-nums">{caseReference}</p>
      </div>
    </header>
  );
}

/** Integrity footer line shared by index stubs and full dossiers. */
export function LedgerDocumentFooter({
  fields,
  compact = false,
}: {
  fields: Pick<
    LedgerDocumentChromeFields,
    | 'integrityScheme'
    | 'anchorShort'
    | 'verificationAnchor'
    | 'facilitatorAttestation'
    | 'timestampLabel'
    | 'isSpecimen'
  >;
  compact?: boolean;
}) {
  const anchor =
    fields.anchorShort ??
    (fields.verificationAnchor
      ? `${fields.verificationAnchor.slice(0, 4)}…${fields.verificationAnchor.slice(-4)}`
      : '—');

  return (
    <footer className={cn('border-t border-line', compact ? 'pt-3' : 'py-4')}>
      <p
        className={cn(
          'm-0 font-mono uppercase tracking-[var(--tracking-caps)] text-ink-faint',
          compact ? 'text-[0.6rem]' : 'text-[length:var(--text-label)]',
        )}
      >
        Integrity
      </p>
      <p
        className={cn(
          'mt-1.5 mb-0 leading-relaxed text-ink-secondary',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        <span className="font-mono text-ink">{fields.integrityScheme}</span>
        {' · '}
        <span className="font-mono">{anchor}</span>
        {' · '}
        {fields.timestampLabel}
      </p>
      {!compact ? (
        <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-faint">
          {fields.facilitatorAttestation}
          {fields.isSpecimen
            ? ' Specimen only — no live instrument or verifiable anchor behind this text.'
            : ' Anchor binds released text integrity, not session substance or legal privilege.'}
        </p>
      ) : null}
    </footer>
  );
}

/** Full metadata grid for dossier / instrument views. */
export function LedgerDocumentMetaGrid({ fields }: { fields: LedgerDocumentChromeFields }) {
  return (
    <div className="sr-dossier-module overflow-hidden">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        <DocMetaCell label="Case / reference" value={fields.caseReference} mono />
        <DocMetaCell label="Matter" value={fields.matterTitle} />
        <DocMetaCell label="Template type" value={fields.templateType} />
        <DocMetaCell label="Issuing body" value={fields.organisation} />
        <DocMetaCell label="Issued / approved" value={fields.issuedAtDisplay} />
        <DocMetaCell label="Approved by" value={fields.approvedByRole} />
        <DocMetaCell label="Visibility" value={fields.visibilityLabel} />
        <DocMetaCell label="Classification" value={fields.classification} />
        {typeof fields.participantCount === 'number' ? (
          <DocMetaCell
            label="Verified parties"
            value={`${fields.participantCount} — identities not public`}
          />
        ) : (
          <DocMetaCell label="Participants" value="Identities not public" />
        )}
        <DocMetaCell label="Integrity scheme" value={fields.integrityScheme} mono />
        <DocMetaCell
          label="Anchor stub"
          value={fields.anchorShort ?? fields.verificationAnchor ?? '—'}
          mono
        />
        <DocMetaCell label="Trusted timestamp" value={fields.timestampLabel} />
      </div>
    </div>
  );
}

/** Compact filing stub metadata for index rows. */
export function LedgerDocumentStubMeta({
  fields,
}: {
  fields: Pick<
    LedgerDocumentChromeFields,
    | 'organisation'
    | 'issuedAtDisplay'
    | 'visibilityLabel'
    | 'templateType'
    | 'participantCount'
    | 'anchorShort'
    | 'verificationAnchor'
  >;
}) {
  const anchor =
    fields.anchorShort ??
    (fields.verificationAnchor
      ? `${fields.verificationAnchor.slice(0, 4)}…${fields.verificationAnchor.slice(-4)}`
      : null);

  return (
    <MetaFieldGrid columns={4} className="mt-1">
      <MetaField label="Issuing body" value={fields.organisation} />
      <MetaField label="Issued" value={fields.issuedAtDisplay} />
      <MetaField label="Visibility" value={fields.visibilityLabel} />
      {anchor ? (
        <MetaField label="Anchor" value={anchor} mono />
      ) : (
        <MetaField label="Template" value={fields.templateType} />
      )}
    </MetaFieldGrid>
  );
}

/** Document title block under letterhead. */
export function LedgerDocumentTitleBlock({
  templateType,
  title,
  summary,
  compact = false,
}: {
  templateType: string;
  title: string;
  summary?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex flex-col', compact ? 'gap-2' : 'gap-3')}>
      <CapsLabel>{templateType}</CapsLabel>
      {compact ? (
        <h2 className="m-0 font-sans text-base font-semibold leading-snug tracking-[-0.02em] text-ink md:text-lg">
          {title}
        </h2>
      ) : (
        <h3 className="m-0 font-sans text-xl font-semibold leading-snug tracking-[-0.02em] text-ink md:text-[1.375rem]">
          {title}
        </h3>
      )}
      {summary ? (
        <p className="m-0 max-w-prose text-sm leading-[1.65] text-ink-secondary">{summary}</p>
      ) : null}
    </div>
  );
}
