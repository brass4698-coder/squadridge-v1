import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type SectionLabelProps = {
  children?: ReactNode;
  /** @deprecated Prefer children — kept for existing call sites */
  text?: string;
  className?: string;
  as?: 'p' | 'span' | 'th' | 'div';
};

/**
 * Caps section label — institutional marketing eyebrow.
 */
export function SectionLabel({ children, text, className, as: Tag = 'p' }: SectionLabelProps) {
  return (
    <Tag
      className={cn(
        'section-label mb-3 font-semibold uppercase text-[length:var(--text-label)] tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]',
        className,
      )}
    >
      {children ?? text}
    </Tag>
  );
}
