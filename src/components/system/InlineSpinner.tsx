import { cn } from '../../lib/cn';

/**
 * Small, accessible in-button spinner. Renders `aria-hidden`, expects the
 * surrounding button to handle `aria-busy` and disabled state.
 *
 * Pair with a textual label (e.g. "Saving…") so screen readers announce
 * progress. The spinner inherits `currentColor` so it adopts the button's
 * text color in any tone (primary CTA, ghost, danger).
 */
export interface InlineSpinnerProps {
  /** `xs` (3 → 12px), `sm` (4 → 16px, default), `md` (5 → 20px). */
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<InlineSpinnerProps['size']>, string> = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
};

export function InlineSpinner({ size = 'sm', className }: InlineSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent align-[-0.125em]',
        SIZE_CLASS[size],
        className,
      )}
    />
  );
}
