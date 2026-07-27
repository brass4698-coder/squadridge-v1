import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';
import { StatusChip } from './StatusChip';

/**
 * Cropped ledger / provenance composition — redacted preview, anchor, approval states.
 */
export function LedgerProvenancePanel({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Document-grade ledger fragment showing redacted session content, approval states, and verification anchor"
      className={className}
      aspect="auto"
    >
      <div className="grid w-full max-w-2xl gap-px border border-line bg-line md:grid-cols-[1fr_auto]">
        <div className="bg-surface-elevated p-5 md:p-6">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Outcome record · preview
            </p>
            <StatusChip label="Pending release" variant="verified" />
          </header>

          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-ink">Action commitments record</p>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Facilitator-authored summary. Room dialogue not included.
            </p>

            <div className="space-y-2 border-t border-line pt-4">
              <RedactedLine width="92%" />
              <RedactedLine width="78%" />
              <RedactedLine width="85%" label="Agreed terms" />
              <RedactedLine width="64%" />
            </div>

            <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4 text-xs">
              <div>
                <dt className="font-mono uppercase tracking-wide text-ink-faint">Approvals</dt>
                <dd className="mt-1 font-mono text-ink">3 / 3 recorded</dd>
              </div>
              <div>
                <dt className="font-mono uppercase tracking-wide text-ink-faint">Room import</dt>
                <dd className="mt-1 font-mono text-ink">Blocked</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="flex flex-col justify-between bg-surface-sunken p-5 md:w-48 md:p-6">
          <div>
            <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Provenance
            </p>
            <p className="mt-3 break-all font-mono text-[0.7rem] leading-relaxed text-ink-secondary">
              sha256:8f3a91c2…c21d
            </p>
          </div>
          <div className="mt-6 space-y-2">
            <ProvenanceMarker label="Release gate passed" active />
            <ProvenanceMarker label="Verbatim guard" active />
            <ProvenanceMarker label="Anchor computed" active={false} />
          </div>
        </aside>
      </div>
    </InstitutionalVisualFrame>
  );
}

function RedactedLine({ width, label }: { width: string; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      {label ? (
        <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-ink-faint">
          {label}
        </span>
      ) : null}
      <div
        className="h-2 rounded-sm bg-line"
        style={{ width }}
        aria-hidden
        title="Redacted content placeholder"
      />
    </div>
  );
}

function ProvenanceMarker({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[length:var(--text-label)] text-ink-secondary">
      <span
        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-brand' : 'border border-line-strong bg-transparent'}`}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
