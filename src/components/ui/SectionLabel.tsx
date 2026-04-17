import type { ReactNode } from 'react';
import { cn } from '../../lib';

export interface SectionLabelProps {
  children: ReactNode;
  variant?: 'default' | 'dev' | 'muted';
  className?: string;
  /** Render as heading for page-level labels (e.g. Orientation). */
  as?: 'p' | 'span' | 'h1' | 'h2';
}

const variantClass: Record<NonNullable<SectionLabelProps['variant']>, string> = {
  default: 'font-heading text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-teal/80',
  dev: 'rounded-md border border-[#1e2d3d] bg-white/[0.04] px-2 py-0.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle',
  muted: 'font-heading text-[0.65rem] font-medium uppercase tracking-[0.14em] text-landing-muted',
};

export function SectionLabel({
  children,
  variant = 'default',
  className,
  as: Tag = 'span',
}: SectionLabelProps) {
  return <Tag className={cn('mb-0', variantClass[variant], className)}>{children}</Tag>;
}
