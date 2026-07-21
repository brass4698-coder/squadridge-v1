import { StatusBadge, type StatusBadgeVariant } from '../StatusBadge';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { SectionLabel } from '../SectionLabel';

const STATES: {
  num: string;
  label: string;
  badge: string;
  variant: StatusBadgeVariant;
  href: string;
  definition: string;
}[] = [
  {
    num: '01',
    label: 'Private room',
    badge: 'Private',
    variant: 'private',
    href: '#stage-room',
    definition: 'Verified parties exchange structured written rounds. Dialogue stays inside.',
  },
  {
    num: '02',
    label: 'Release gate',
    badge: 'Governed',
    variant: 'governed',
    href: '#stage-gate',
    definition: 'Nothing leaves without recorded approvals and your explicit release.',
  },
  {
    num: '03',
    label: 'Public record',
    badge: 'Published',
    variant: 'published',
    href: '#stage-record',
    definition: 'Approved outcome and verification anchor. No transcript. No attribution.',
  },
];

/**
 * Formal system-model rail — governing logic, not feature teasers.
 */
export function GovernedStatesRail() {
  return (
    <section
      className="border-b border-[color:var(--color-border-subtle)] py-12 md:py-14"
      aria-labelledby="governed-states-h"
    >
      <div className={publicShellInnerClass}>
        <div className="flex flex-col gap-6 border-b border-[color:var(--color-border-subtle)] pb-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-[28rem]">
            <SectionLabel className="!mb-2">Architecture</SectionLabel>
            <h2
              id="governed-states-h"
              className="mt-0 font-display text-[1.625rem] font-medium leading-tight tracking-tight text-ink md:text-[1.75rem]"
            >
              Three governed states. One matter.
            </h2>
          </div>
          <p className="max-w-[22rem] text-sm leading-relaxed text-ink-secondary md:pb-0.5">
            Same document moves through private, governed, and published control — never by
            automation.
          </p>
        </div>

        <ol className="m-0 mt-0 grid list-none divide-y divide-[color:var(--color-border-subtle)] border-b border-[color:var(--color-border-subtle)] p-0 md:grid-cols-3 md:divide-x md:divide-y-0">
          {STATES.map((state) => (
            <li key={state.num} className="min-w-0">
              <a
                href={state.href}
                className="group flex h-full flex-col px-0 py-7 no-underline transition-colors md:px-6 md:first:pl-0 md:last:pr-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs tabular-nums text-[color:var(--color-text-muted)]">
                    {state.num}
                  </span>
                  <StatusBadge variant={state.variant}>{state.badge}</StatusBadge>
                </div>
                <h3 className="mt-5 text-[1.0625rem] font-semibold tracking-tight text-ink group-hover:text-brand">
                  {state.label}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {state.definition}
                </p>
                <span className="mt-6 font-mono text-[length:var(--text-label)] tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)] transition-colors group-hover:text-brand">
                  Inspect stage →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
