import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type PanelTone = 'default' | 'sealed' | 'record' | 'warning' | 'sunken';

const panelToneClass: Record<PanelTone, string> = {
  default: 'border-line bg-surface-elevated',
  sealed: 'border-line-strong bg-surface-sealed',
  record: 'border-record-line bg-record-paper text-record-ink',
  warning: 'border-sem-warning bg-sem-warning-soft',
  sunken: 'border-line bg-surface-sunken',
};

export function PlatformSection({
  id,
  labelledBy,
  children,
  className,
  innerClassName,
}: {
  id?: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={twMerge('w-full border-t border-line-divider py-16 md:py-24', className)}
    >
      <div
        className={twMerge('mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8', innerClassName)}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionKicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={twMerge(
        'mb-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-faint',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function InstitutionalPanel({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: PanelTone;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'border p-5 shadow-[var(--sr-shadow-sm)] md:p-6',
        panelToneClass[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BoundaryCard({
  label,
  title,
  children,
  tone = 'sealed',
  className,
}: {
  label: string;
  title: string;
  children: ReactNode;
  tone?: 'sealed' | 'record';
  className?: string;
}) {
  return (
    <InstitutionalPanel
      tone={tone}
      className={twMerge(
        tone === 'record' ? 'border-l-4 border-l-brand' : 'border-l-4 border-l-line-strong',
        className,
      )}
    >
      <SectionKicker className={tone === 'record' ? 'text-brand' : undefined}>
        {label}
      </SectionKicker>
      <h3
        className={twMerge(
          'mb-0 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.02em]',
          tone === 'record' ? 'text-record-ink' : 'text-ink',
        )}
      >
        {title}
      </h3>
      <div
        className={twMerge(
          'mt-4 font-sans text-[0.94rem] leading-relaxed',
          tone === 'record' ? 'text-record-muted' : 'text-ink-secondary',
        )}
      >
        {children}
      </div>
    </InstitutionalPanel>
  );
}

export function MetadataRow({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'grid gap-1 border-t border-line-divider py-3 sm:grid-cols-[11rem_1fr] sm:gap-4',
        className,
      )}
    >
      <dt className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </dt>
      <dd className="min-w-0 font-sans text-[0.9rem] leading-relaxed text-ink-secondary">
        {value}
      </dd>
    </div>
  );
}

export function ProcessRail({
  steps,
  className,
}: {
  steps: ReadonlyArray<{ label: string; title: string; body: string }>;
  className?: string;
}) {
  return (
    <ol className={twMerge('grid gap-3 md:grid-cols-4', className)}>
      {steps.map((step, index) => (
        <li key={step.label} className="relative border border-line bg-surface-elevated p-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand">
              {step.label}
            </span>
            <span className="font-mono text-[0.68rem] text-ink-subtle tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <h3 className="mb-0 mt-5 font-sans text-[1rem] font-semibold leading-snug text-ink">
            {step.title}
          </h3>
          <p className="mb-0 mt-2 font-sans text-[0.86rem] leading-relaxed text-ink-secondary">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function TrustCallout({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={twMerge('border-l-2 border-brand bg-brand-soft px-4 py-3.5', className)}>
      <p className="mb-2 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-brand">
        {eyebrow}
      </p>
      <div className="font-sans text-[0.88rem] leading-relaxed text-ink-secondary">{children}</div>
    </aside>
  );
}

export function RecordStamp({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge('border border-record-line bg-record-paper px-3 py-2', className)}>
      <p className="mb-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-record-faint">
        {label}
      </p>
      <p className="mb-0 min-w-0 break-words font-mono text-[0.74rem] leading-snug text-record-muted">
        {value}
      </p>
    </div>
  );
}
