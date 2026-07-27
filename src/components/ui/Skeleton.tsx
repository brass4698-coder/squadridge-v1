import { type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn(
        'rounded-md bg-surface-secondary motion-safe:animate-pulse motion-reduce:animate-none',
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

export function RouteSkeletonBlock() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-12"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-4 h-32 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-busy="true">
      <span className="sr-only">Loading table…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
