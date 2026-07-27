import type { ReactNode } from 'react';
import { CapsLabel } from './shared/CapsLabel';
import { cn } from '../lib/cn';

export type ProcessGateState = 'open' | 'gated' | 'sealed' | 'released';

const GATE_LABEL: Record<ProcessGateState, string> = {
  open: 'Open',
  gated: 'Gated',
  sealed: 'Sealed',
  released: 'Released',
};

/**
 * Canonical process spine row — number, stage label, title, gate state, exit condition.
 * Used on How it works and any official process artifact.
 */
export function ProcessStep({
  number,
  phase,
  title,
  gateState,
  exitCondition,
  children,
  className,
}: {
  number: string;
  phase: string;
  title: string;
  /** Trust-boundary posture for this stage. */
  gateState?: ProcessGateState;
  /** What must be true before the next stage opens. */
  exitCondition?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'sr-process-step relative border-b border-line pb-8 last:border-b-0 last:pb-0',
        className,
      )}
    >
      <div className="grid gap-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-6 md:gap-8">
        <div className="flex flex-row items-baseline gap-3 sm:flex-col sm:gap-2">
          <span
            className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink md:text-[1.75rem]"
            aria-hidden={false}
          >
            {number}
          </span>
          <CapsLabel className="text-ink-faint">{phase}</CapsLabel>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h3 className="m-0 font-heading text-xl font-semibold tracking-[-0.02em] text-ink md:text-[length:var(--text-xl)]">
              {title}
            </h3>
            {gateState ? (
              <span
                className={cn(
                  'shrink-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em]',
                  gateState === 'released' ? 'text-[color:var(--sr-verify-ink)]' : 'text-ink-faint',
                )}
              >
                {GATE_LABEL[gateState]}
              </span>
            ) : null}
          </div>

          {children ? (
            <div className="mt-3 text-sm leading-relaxed text-ink-secondary md:text-[length:var(--text-body)]">
              {children}
            </div>
          ) : null}

          {exitCondition ? (
            <p className="mt-4 mb-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-3 text-xs leading-snug text-ink-faint">
              <span className="font-mono uppercase tracking-[0.08em]">Exit</span>
              <span aria-hidden className="text-ink-subtle">
                ·
              </span>
              <span className="text-ink-secondary">{exitCondition}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Compact numbered intake list used on Home + Request access. */
export function IntakeSteps({ steps }: { steps: readonly { number: string; label: string }[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-4 p-0 text-sm text-ink-secondary">
      {steps.map((s) => (
        <li key={s.number} className="flex items-start gap-3.5">
          <span className="w-9 shrink-0 font-mono text-base font-semibold tabular-nums tracking-tight text-ink">
            {s.number}
          </span>
          <span className="leading-snug pt-0.5">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
