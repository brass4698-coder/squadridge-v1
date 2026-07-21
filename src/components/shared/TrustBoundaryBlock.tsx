import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { SectionLabel } from '../SectionLabel';

export type TrustBoundaryRow = {
  layer: string;
  protected: string;
  notProtected: string;
};

const DEFAULT_ROWS: TrustBoundaryRow[] = [
  {
    layer: 'Private room',
    protected: 'Dialogue, drafts, identities, and attribution stay inside the session.',
    notProtected:
      'Operators with moderator keys can decrypt for review under audited justification.',
  },
  {
    layer: 'Facilitator control',
    protected: 'Access, pace, approvals, and whether anything is ever released.',
    notProtected: 'The platform does not decide outcomes or auto-publish room content.',
  },
  {
    layer: 'Release gate',
    protected: 'Only facilitator-approved outcome text may leave the room.',
    notProtected: 'Raw transcript, attachments, and participant identity are not released.',
  },
  {
    layer: 'Public record',
    protected: 'Published outcomes carry a tamper-evident verification anchor.',
    notProtected: 'We do not claim full platform zero-knowledge or Signal-grade E2E today.',
  },
];

export type TrustBoundaryBlockProps = {
  rows?: TrustBoundaryRow[];
  securityHref?: string;
  className?: string;
  hideFooterLink?: boolean;
};

/**
 * Formal architecture boundary matrix.
 * Desktop: column headers once; cells are values only.
 * Mobile: each cell stacks with its own label above the value.
 */
export function TrustBoundaryBlock({
  rows = DEFAULT_ROWS,
  securityHref = '/security',
  className,
  hideFooterLink = false,
}: TrustBoundaryBlockProps) {
  return (
    <div className={cn('w-full', className)}>
      <div
        className="overflow-hidden rounded-lg border border-line"
        role="table"
        aria-label="Trust boundaries"
      >
        <div
          className="hidden border-b border-line md:grid md:grid-cols-[10.5rem_minmax(0,1fr)_minmax(0,1fr)]"
          role="row"
        >
          <div className="bg-surface-secondary px-5 py-3.5">
            <SectionLabel as="div" className="mb-0">
              Layer
            </SectionLabel>
          </div>
          <div className="border-l border-line bg-surface-elevated px-5 py-3.5">
            <SectionLabel as="div" className="mb-0 !text-ink">
              Protected by design
            </SectionLabel>
          </div>
          <div className="border-l border-line bg-surface-secondary/70 px-5 py-3.5">
            <SectionLabel as="div" className="mb-0">
              Documented limit
            </SectionLabel>
          </div>
        </div>

        <ul className="m-0 list-none p-0">
          {rows.map((row, index) => (
            <li
              key={row.layer}
              role="row"
              className={cn(
                'grid border-b border-line last:border-b-0 md:grid-cols-[10.5rem_minmax(0,1fr)_minmax(0,1fr)]',
                index % 2 === 1 && 'bg-surface-secondary/40',
              )}
            >
              <div className="flex flex-col gap-2 border-b border-line px-5 py-5 md:border-b-0 md:justify-center md:py-5">
                <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)] md:hidden">
                  Layer
                </p>
                <p className="m-0 text-sm font-semibold tracking-tight text-ink">{row.layer}</p>
              </div>

              <div className="flex flex-col gap-2 border-b border-line px-5 py-5 md:border-b-0 md:border-l md:border-line md:py-5">
                <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)] md:hidden">
                  Protected by design
                </p>
                <p className="m-0 text-sm leading-[1.6] text-ink">{row.protected}</p>
              </div>

              <div className="flex flex-col gap-2 bg-surface-secondary/30 px-5 py-5 md:border-l md:border-line md:py-5">
                <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)] md:hidden">
                  Documented limit
                </p>
                <p className="m-0 text-sm leading-[1.6] text-ink-secondary">{row.notProtected}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {!hideFooterLink ? (
        <p className="mt-6 text-sm text-ink-faint">
          <Link to={securityHref} className="text-ink-secondary underline-offset-4 hover:underline">
            Read the full security model
          </Link>
        </p>
      ) : null}
    </div>
  );
}
