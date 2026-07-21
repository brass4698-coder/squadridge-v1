import { StatusBadge } from '../StatusBadge';
import { MetaField, MetaFieldGrid } from '../landing/MetaField';

/**
 * End-to-end trust sequence: private room → release gate → public ledger.
 * Modes use governed surface tokens — restraint over spectacle.
 */
export function InterfaceEvidence() {
  return (
    <div className="sr-evidence-frame" aria-label="Facilitator workflow evidence">
      <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Governed sequence
          </p>
          <p className="mt-1 mb-0 text-sm text-ink-secondary">
            Private room → release gate → released record
          </p>
        </div>
        <p className="m-0 max-w-sm text-xs leading-relaxed text-ink-faint sm:text-right">
          No one can accidentally publish a transcript; only the outcome is releasable.
        </p>
      </header>

      <div className="sr-evidence-rail">
        {/* ── Private room ── */}
        <section className="sr-evidence-pane sr-mode-room" aria-labelledby="evidence-room-h">
          <div className="flex items-center justify-between gap-2">
            <p
              id="evidence-room-h"
              className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint"
            >
              01 · Private room
            </p>
            <StatusBadge variant="private">Enclosed</StatusBadge>
          </div>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">Session control</p>
            <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
              Soft enclosure. Verification and pace stay inside the room.
            </p>
          </div>
          <ul className="m-0 list-none divide-y divide-line border border-line/80 p-0">
            {[
              { action: 'Open room', hint: 'Invite-verified only' },
              { action: 'Pause session', hint: 'Holds pace quietly' },
              { action: 'End & draft', hint: 'Enters the gate' },
            ].map((row) => (
              <li
                key={row.action}
                className="flex items-baseline justify-between gap-4 px-3 py-2.5"
              >
                <span className="text-sm text-ink">{row.action}</span>
                <span className="shrink-0 text-xs text-ink-faint">{row.hint}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="governed">Verified ×4</StatusBadge>
            <StatusBadge variant="live">Live</StatusBadge>
          </div>
        </section>

        {/* ── Release gate (threshold) ── */}
        <section
          className="sr-evidence-pane sr-mode-gate sr-threshold-elevate"
          aria-labelledby="evidence-gate-h"
        >
          <div className="flex items-center justify-between gap-2">
            <p
              id="evidence-gate-h"
              className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint"
            >
              02 · Release gate
            </p>
            <StatusBadge variant="governed">Threshold</StatusBadge>
          </div>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">
              Outcome preview — pending release
            </p>
            <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
              Highest structure. Nothing leaves without recorded approvals and an explicit action.
            </p>
          </div>
          <div className="rounded-sm border border-[color:var(--sr-mode-gate-border)] bg-surface-sunken/40 px-3 py-3">
            <p className="m-0 text-xs leading-relaxed text-ink-secondary">
              Facilitator-drafted summary. No room transcript included.
            </p>
            <MetaFieldGrid className="mt-4 gap-x-8 gap-y-3">
              <MetaField
                label="Approvals"
                value={<span className="sr-approval-count">3 / 3</span>}
              />
              <MetaField label="Release" value="Explicit click" mono />
            </MetaFieldGrid>
          </div>
          <p className="m-0 text-xs leading-relaxed text-ink-faint">
            Process authority remains with the facilitator.
          </p>
        </section>

        {/* ── Public ledger ── */}
        <section className="sr-evidence-pane sr-mode-ledger" aria-labelledby="evidence-ledger-h">
          <div className="flex items-center justify-between gap-2">
            <p
              id="evidence-ledger-h"
              className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint"
            >
              03 · Public ledger
            </p>
            <StatusBadge variant="published">Open</StatusBadge>
          </div>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">Released record</p>
            <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
              Flatter, open composition. Integrity cues only — no decorative chrome.
            </p>
          </div>
          <MetaFieldGrid className="gap-x-8 gap-y-4">
            <MetaField label="Public entry" value="Approved directives only" />
            <MetaField label="Identities" value="Never published" />
          </MetaFieldGrid>
          <div className="border-t border-line pt-4">
            <p className="sr-integrity-mark m-0">Anchor verified</p>
            <p className="mt-2 mb-0 font-mono text-xs tabular-nums text-ink-secondary">
              sha256:7c3a…e91f
            </p>
          </div>
          <p className="m-0 text-xs leading-relaxed text-ink-faint">
            Tamper-evident hash. Recompute to confirm integrity.
          </p>
        </section>
      </div>
    </div>
  );
}
