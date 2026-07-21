import type { ReactNode } from 'react';

export function ProcessStep({
  number,
  phase,
  title,
  children,
}: {
  number: string;
  phase: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-[var(--space-5)] border-b border-[color:var(--color-border-subtle)] pb-[var(--space-6)] last:border-b-0">
      <div className="w-12 shrink-0">
        <span className="block text-[length:var(--text-label)] font-semibold tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
          {number}
        </span>
        <span className="mt-1 block text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
          {phase}
        </span>
      </div>
      <div>
        <h3 className="mb-[var(--space-2)] mt-0 text-[length:var(--text-xl)] font-semibold text-ink">
          {title}
        </h3>
        <div className="text-[length:var(--text-body)] text-[color:var(--color-text-secondary)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Compact numbered intake list used on Home + Request access. */
export function IntakeSteps({ steps }: { steps: readonly { number: string; label: string }[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3.5 p-0 text-sm text-ink-secondary">
      {steps.map((s) => (
        <li key={s.number} className="flex items-start gap-3">
          <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-[color:var(--color-text-muted)]">
            {s.number}
          </span>
          <span className="leading-snug">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
