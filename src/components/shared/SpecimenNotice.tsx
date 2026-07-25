import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { StatusBadge } from '../StatusBadge';

export interface SpecimenNoticeProps {
  heading?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Marks designed sample material as a specimen. The ledger carries no live public
 * releases yet, and labelling that plainly is the point — never dress a specimen up as
 * a released record.
 */
export function SpecimenNotice({
  heading = 'Illustrative specimen — not a live release',
  children,
  className,
}: SpecimenNoticeProps) {
  return (
    <aside
      className={cn('sr-specimen-notice', className)}
      aria-label="Illustrative specimen notice"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant="illustrative">Specimen</StatusBadge>
        <p className="m-0 text-sm font-medium text-ink">{heading}</p>
      </div>
      <p className="mt-2 mb-0 max-w-measure text-sm leading-relaxed text-ink-secondary">
        {children ??
          'This dossier shows the structure, metadata, and verification anchor format of a released record. No session produced it, and its anchor cannot be verified against the ledger.'}
      </p>
    </aside>
  );
}

/**
 * Shown when a ledger surface has no live published releases. The empty state is the
 * honest state: we do not seed the register with invented records.
 */
export function NoLiveReleasesPanel({ className }: { className?: string }) {
  return (
    <section className={cn('sr-specimen-notice', className)} aria-labelledby="no-live-releases-h">
      <p className="sr-meta-label m-0">Register status</p>
      <h2 id="no-live-releases-h" className="mt-2 mb-0 text-base font-semibold text-ink">
        No public releases published yet
      </h2>
      <p className="mt-2 mb-0 max-w-measure text-sm leading-relaxed text-ink-secondary">
        Every entry below is an illustrative specimen. Live entries appear only after a facilitator
        releases an approved outcome and the releasing organisation opts into public publication —
        private anchored records never appear here. We would rather show an empty register than a
        populated fiction.
      </p>
    </section>
  );
}
