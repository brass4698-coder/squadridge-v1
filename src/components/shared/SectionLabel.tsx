import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { SectionLabel as CanonicalSectionLabel } from '../SectionLabel';

/** Re-export canonical label; accepts `text` for backward compatibility. */
export function SectionLabel({
  text,
  className,
  children,
}: {
  text?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <CanonicalSectionLabel text={text} className={className}>
      {children}
    </CanonicalSectionLabel>
  );
}

export type MarketingSectionTone = 'default' | 'sunken' | 'bordered';

export function MarketingSection({
  children,
  id,
  className = '',
  tone = 'default',
  density = 'default',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: MarketingSectionTone;
  /** default = --space-section; spacious = --space-section-lg */
  density?: 'default' | 'spacious' | 'compact';
}) {
  const padY =
    density === 'spacious'
      ? 'py-[var(--space-section-lg)]'
      : density === 'compact'
        ? 'py-12 md:py-16'
        : 'py-[var(--space-section)]';

  return (
    <section
      id={id}
      data-scroll-section
      className={cn(
        'scroll-mt-20 text-left',
        padY,
        tone === 'sunken' && 'bg-surface-sunken/60',
        tone === 'bordered' && 'border-y border-line',
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Constrains content to the public shell max width with standard gutters. */
export function ShellWidth({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(publicShellInnerClass, className)}>{children}</div>;
}

/** Readable measure for long-form body copy. */
export function ProseMeasure({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return <div className={cn(wide ? 'max-w-measure' : 'max-w-prose', className)}>{children}</div>;
}

export function SectionIntro({
  label,
  title,
  lead,
  className,
  wide = true,
}: {
  label: string;
  title: string;
  lead?: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn(wide ? 'max-w-measure' : 'max-w-prose', className)}>
      <SectionLabel text={label} />
      <h2 className="font-display text-h2 font-medium tracking-tight text-ink">{title}</h2>
      {lead ? (
        <div className="mt-4 text-[length:var(--sr-text-lead,1.0625rem)] leading-relaxed text-ink-secondary [&_p]:mt-0">
          {typeof lead === 'string' ? <p>{lead}</p> : lead}
        </div>
      ) : null}
    </div>
  );
}
