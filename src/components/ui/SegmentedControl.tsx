import { useId, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Segmented control — a small set of mutually-exclusive options arranged on
 * a single rail. Replaces ad-hoc rounded-pill tab clusters used in session
 * phase rails and intent perspective pickers.
 *
 * Anatomy:
 *   - one container with a thin border and a 4px inner gutter
 *   - one button per option; the active option uses the brand-soft fill
 *
 * When to use:
 *   - 2–5 short, mutually-exclusive options (e.g. Intro / Round 1 / Synthesis)
 *
 * When NOT to use:
 *   - more than ~5 items → use Tabs
 *   - lists with rich content per option → use cards
 */
export interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Optional `data-demo` hook for scripted walkthroughs. */
  demoId?: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible label for the underlying radio group. */
  ariaLabel: string;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T | null;
  onChange: (value: T) => void;
  /** Visual size — `sm` ≈ 36px, `md` ≈ 44px (default). */
  size?: 'sm' | 'md';
  className?: string;
  /** Render as a 2-column grid (good for binary perspectives). */
  fill?: boolean;
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
  size = 'md',
  className,
  fill = false,
}: SegmentedControlProps<T>) {
  const groupId = useId();
  const heightClass = size === 'sm' ? 'min-h-[36px]' : 'min-h-[44px]';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      id={groupId}
      className={twMerge(
        'inline-flex items-center gap-1 rounded-[8px] border border-line bg-surface-elevated p-1',
        fill ? 'grid w-full grid-cols-[repeat(var(--seg-cols),minmax(0,1fr))]' : '',
        className,
      )}
      style={
        fill ? ({ ['--seg-cols' as never]: options.length } as React.CSSProperties) : undefined
      }
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-demo={opt.demoId}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={twMerge(
              heightClass,
              'inline-flex shrink-0 items-center justify-center rounded-[6px] px-3 font-sans text-[0.85rem] font-medium leading-none transition-colors duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              active
                ? 'bg-brand-soft text-ink shadow-[inset_0_0_0_1px_var(--sr-primary)]'
                : 'text-ink-secondary hover:bg-white/[0.03] hover:text-ink',
              opt.disabled ? 'cursor-not-allowed opacity-50' : '',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
