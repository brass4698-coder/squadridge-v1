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
    label: 'Approved record',
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
      className="scroll-mt-20 border-b border-line bg-surface-sunken/40 py-16 md:py-20"
      data-scroll-section
      aria-labelledby="process-stages-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[36rem]">
          <SectionLabel className="!mb-2">Process control</SectionLabel>
          <h2
            id="process-stages-h"
            className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
          >
            Private room → facilitator gate → approved record
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            One matter, three governed states — never by automation. Only approved outcome text can
            become the record.
          </p>
        </div>

        <ol className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
          {STATES.map((state, index) => (
            <li key={state.num} className="relative">
              {index < STATES.length - 1 ? (
                <span
                  className="pointer-events-none absolute top-1/2 right-[-0.65rem] z-10 hidden h-px w-5 -translate-y-1/2 bg-line sm:block"
                  aria-hidden
                />
              ) : null}
              <a
                href={state.href}
                className="sr-vault-card sr-vault-card--interactive flex h-full flex-col px-5 py-6 no-underline"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm tabular-nums text-ink-faint">{state.num}</span>
                  <StatusBadge variant={state.variant}>{state.badge}</StatusBadge>
                </div>
                <span className="mt-5 text-base font-semibold tracking-tight text-ink">
                  {state.label}
                </span>
              </a>
            </li>
          ))}
        </ol>

        <div className="mt-10 md:mt-12">
          <SystemModelSequence />
        </div>

        <Link
          to="/how-it-works"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          See the full process →
        </Link>
      </div>
    </section>
  );
}
