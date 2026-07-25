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
 * Caps section label — tracked mono eyebrow for marketing and app chrome.
 */
export function SectionLabel({ children, text, className, as: Tag = 'p' }: SectionLabelProps) {
  return (
    <Tag
      className={cn(
        'section-label mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.08em] text-ink-faint',
        className,
      )}
    >
      {children ?? text}
    </Tag>
  );
}
