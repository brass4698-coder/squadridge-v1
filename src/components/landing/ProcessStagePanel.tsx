import { Link } from 'react-router-dom';
import { StatusBadge, type StatusBadgeVariant } from '../StatusBadge';
import { SystemModelSequence } from '../institutional/SystemModelSequence';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

const STATES: {
  num: string;
  label: string;
  badge: string;
  variant: StatusBadgeVariant;
  href: string;
}[] = [
  {
    num: '01',
    label: 'Private session room',
    badge: 'Private',
    variant: 'private',
    href: '#stage-room',
  },
  {
    num: '02',
    label: 'Facilitator release gate',
    badge: 'Governed',
    variant: 'governed',
    href: '#stage-gate',
  },
  {
    num: '03',
    label: 'Public ledger',
    badge: 'Published',
    variant: 'published',
    href: '#stage-record',
  },
];

/**
 * Single process module: model → stage detail (no duplicate framing).
 */
export function ProcessStagePanel() {
  return (
    <section
      id="system-model"
      className="scroll-mt-20 border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/35 py-20 md:py-28"
      aria-labelledby="process-stages-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[36rem]">
          <SectionLabel className="!mb-2">Process control</SectionLabel>
          <h2
            id="process-stages-h"
            className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
          >
            Three governed states. One matter.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            System model: private session room, facilitator release gate, then public ledger. The
            same document moves through private, governed, and published control — never by
            automation.
          </p>
        </div>

        <ol className="m-0 mt-12 grid list-none gap-3 p-0 sm:grid-cols-3 sm:gap-4">
          {STATES.map((state) => (
            <li key={state.num}>
              <a
                href={state.href}
                className="flex h-full flex-col rounded-lg border border-[color:var(--color-border-subtle)] bg-surface-elevated px-5 py-5 no-underline transition-colors hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm tabular-nums text-[color:var(--color-text-muted)]">
                    {state.num}
                  </span>
                  <StatusBadge variant={state.variant}>{state.badge}</StatusBadge>
                </div>
                <span className="mt-4 text-base font-semibold tracking-tight text-ink">
                  {state.label}
                </span>
              </a>
            </li>
          ))}
        </ol>

        <p className="mt-10 mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
          For each stage: what exists, who controls it, and what never becomes public.
        </p>

        <div className="mt-8 md:mt-10">
          <SystemModelSequence />
        </div>

        <Link
          to="/how-it-works"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-brand no-underline transition-colors hover:text-ink"
        >
          See the full process →
        </Link>
      </div>
    </section>
  );
}
