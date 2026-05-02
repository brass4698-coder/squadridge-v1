import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Lightweight pulsing block. Used as a primitive for richer surface skeletons
 * (rows, cards, message bubbles). Honours `prefers-reduced-motion` automatically
 * because Tailwind `animate-pulse` is disabled by the project's preflight.
 */
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  /** Override the rounded radius. */
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
  /** Render as a label-shaped block (heading sub-line, etc.). */
  variant?: 'block' | 'text';
}

const ROUNDED_CLASS: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({
  className,
  width,
  height,
  style,
  rounded = 'md',
  variant = 'block',
}: SkeletonProps) {
  const inline: CSSProperties = {
    width,
    height: height ?? (variant === 'text' ? '0.85rem' : undefined),
    ...style,
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block animate-pulse bg-[#1e2a3a]/70',
        ROUNDED_CLASS[rounded],
        className,
      )}
      style={inline}
    />
  );
}

/**
 * Convenience wrapper that lays out N text-style skeleton rows. Useful for
 * empty paragraphs while a query is pending.
 */
export function SkeletonLines({
  count = 3,
  className,
  widths,
}: {
  count?: number;
  className?: string;
  widths?: ReadonlyArray<string | number>;
}) {
  const items: ReactNode[] = [];
  for (let i = 0; i < count; i += 1) {
    items.push(
      <Skeleton
        key={i}
        variant="text"
        height="0.75rem"
        width={widths?.[i] ?? `${Math.max(45, 95 - i * 12)}%`}
        className="block"
      />,
    );
  }
  return <div className={cn('flex flex-col gap-2', className)}>{items}</div>;
}
