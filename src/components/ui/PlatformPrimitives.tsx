import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { publicShellInnerClass } from '../layout/publicShell';

type PanelTone = 'default' | 'sealed' | 'record' | 'warning' | 'sunken';
type BandTone = 'navy' | 'black';

const panelToneClass: Record<PanelTone, string> = {
  default: 'border-line bg-surface-elevated',
  sealed: 'border-line-strong bg-surface-sealed',
  record: 'border-record-line bg-record-paper text-record-ink',
  warning: 'border-sem-warning bg-sem-warning-soft',
  sunken: 'border-line bg-surface-sunken',
};

const bandToneClass: Record<BandTone, string> = {
  navy: 'bg-band-navy',
  black: 'bg-band-black',
};

export function SectionBand({
  children,
  tone = 'navy',
  className,
  containerClassName,
  id,
  labelledBy,
  as: Comp = 'section',
}: {
  children: ReactNode;
  tone?: BandTone;
  className?: string;
  containerClassName?: string;
  id?: string;
  labelledBy?: string;
  as?: ElementType;
}) {
  return (
    <Comp
      id={id}
      aria-labelledby={labelledBy}
      className={twMerge(
        'w-full border-t border-line-divider py-10 md:py-14',
        bandToneClass[tone],
        className,
      )}
    >
      <div className={twMerge(publicShellInnerClass, 'min-w-0', containerClassName)}>
        {children}
      </div>
    </Comp>
  );
}

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

export function PageHero({
  eyebrow,
  title,
  children,
  actions,
  className,
  titleClassName,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <header className={twMerge('min-w-0', className)}>
      <SectionKicker>{eyebrow}</SectionKicker>
      <h1
        className={twMerge(
          'mt-2 font-sans text-[clamp(1.7rem,2.6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink',
          titleClassName,
        )}
      >
        {title}
      </h1>
      {children ? (
        <div className="mt-3 max-w-copy font-sans text-[0.96rem] leading-[1.65] text-ink-secondary">
          {children}
        </div>
      ) : null}
      {actions ? <div className="mt-5">{actions}</div> : null}
    </header>
  );
}

export function SectionIntro({
  id,
  eyebrow,
  title,
  children,
  actions,
  as: Comp = 'header',
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Comp className={twMerge('min-w-0', className)}>
      {eyebrow ? <SectionKicker>{eyebrow}</SectionKicker> : null}
      <h2 id={id} className="font-sans text-[1.1rem] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {children ? (
        <div className="mt-2 max-w-copy font-sans text-[0.9rem] leading-relaxed text-ink-faint">
          {children}
        </div>
      ) : null}
      {actions ? <div className="mt-5">{actions}</div> : null}
    </Comp>
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

type SurfaceCardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  tone?: PanelTone;
  role?: string;
  'aria-live'?: 'off' | 'assertive' | 'polite';
};

export function SurfaceCard({
  as: Comp = 'div',
  children,
  className,
  tone = 'default',
  role,
  'aria-live': ariaLive,
}: SurfaceCardProps) {
  return (
    <Comp
      role={role}
      aria-live={ariaLive}
      className={twMerge(
        'rounded-md border p-5 shadow-[var(--sr-shadow-sm)]',
        panelToneClass[tone],
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function CardEyebrow({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: 'muted' | 'brand' | 'subtle';
  className?: string;
}) {
  const toneClass: Record<'muted' | 'brand' | 'subtle', string> = {
    muted: 'text-ink-faint',
    brand: 'text-brand-hover',
    subtle: 'text-ink-subtle',
  };

  return (
    <p
      className={twMerge(
        'font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em]',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}

export function InfoCard({
  as: Comp = 'section',
  eyebrow,
  title,
  children,
  footer,
  className,
}: {
  as?: ElementType;
  eyebrow?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <SurfaceCard as={Comp} className={className}>
      {eyebrow ? <CardEyebrow tone="brand">{eyebrow}</CardEyebrow> : null}
      {title ? (
        <h3 className="mt-2 font-sans text-[1rem] font-semibold leading-snug text-ink">{title}</h3>
      ) : null}
      <div className="mt-3 font-sans text-[0.9rem] leading-[1.65] text-ink-secondary">
        {children}
      </div>
      {footer ? <div className="mt-4 border-t border-line pt-3">{footer}</div> : null}
    </SurfaceCard>
  );
}

export function CTAGroup({
  children,
  className,
  bordered = false,
  label,
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  label?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={twMerge(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap',
        bordered && 'border-t border-line-divider pt-6',
        className,
      )}
    >
      {children}
    </nav>
  );
}

type InlineActionProps<T extends ElementType = 'span'> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function InlineAction<T extends ElementType = 'span'>({
  as,
  children,
  className,
  ...props
}: InlineActionProps<T>) {
  const Comp = as ?? 'span';
  return (
    <Comp
      {...props}
      className={twMerge(
        'focus-ring inline-flex min-h-[44px] min-w-0 items-center gap-1.5 py-1 font-sans text-[0.85rem] font-medium leading-snug text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline',
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function MetadataChip({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: 'muted' | 'brand' | 'warning' | 'record';
  className?: string;
}) {
  const toneClass: Record<'muted' | 'brand' | 'warning' | 'record', string> = {
    muted: 'border-line bg-surface-secondary text-ink-faint',
    brand: 'border-brand/40 bg-brand-soft text-brand-hover',
    warning: 'border-amber/35 bg-amber/[0.08] text-amber/95',
    record: 'border-record-line bg-record-paper text-record-faint',
  };

  return (
    <span
      className={twMerge(
        'inline-flex min-w-0 max-w-full items-center rounded-[4px] border px-2 py-0.5 font-mono text-[0.66rem] leading-snug tracking-[0.04em]',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FormField({
  label,
  children,
  hint,
  error,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
}) {
  return (
    <label className={twMerge('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="font-sans text-[0.78rem] leading-relaxed text-ink-faint">{hint}</span>
      ) : null}
      {error ? (
        <span className="font-sans text-[0.78rem] leading-relaxed text-sem-warning">{error}</span>
      ) : null}
    </label>
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
