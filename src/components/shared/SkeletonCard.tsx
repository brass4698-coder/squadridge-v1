import { cn } from '../../lib/cn';
import { Skeleton } from '../ui/Skeleton';

export type SkeletonCardProps = {
  className?: string;
  /** Reserved height to avoid layout shift (e.g. "12rem"). */
  minHeight?: string;
  lines?: number;
};

/**
 * Card-shaped skeleton matching rounded-2xl surface cards.
 */
export function SkeletonCard({ className, minHeight = '10rem', lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-6',
        'motion-safe:animate-pulse',
        className,
      )}
      style={{ minHeight }}
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-5 w-1/3 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full rounded-lg" />
      ))}
    </div>
  );
}
