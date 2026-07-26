import { type LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  /** Mono uppercase micro-label for instrument / vault sections */
  instrument?: boolean;
};

export function Label({ className, instrument, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        instrument
          ? 'font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint'
          : 'text-sm font-medium text-ink',
        className,
      )}
      {...props}
    />
  );
}
