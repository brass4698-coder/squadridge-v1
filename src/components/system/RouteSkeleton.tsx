import { cn } from '../../lib/cn';

/**
 * Full-page skeleton for route transitions and auth gates. Use this whenever a
 * `Suspense` fallback or guard would otherwise render the bare string
 * "Loading…", so the visual continuity matches the rest of the dark shell.
 *
 * Variants:
 *   - `default` — generic copy + form skeleton (auth, settings, inserts).
 *   - `session` — re-export of `SessionPageAuthSkeleton` (kept here so callers
 *     don't have to know which directory it lives in).
 */
export interface RouteSkeletonProps {
  /** Aria label / sr-only text — defaults to "Loading page content". */
  label?: string;
  className?: string;
}

export function RouteSkeleton({ label = 'Loading page content.', className }: RouteSkeletonProps) {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        'mx-auto flex w-full max-w-copy flex-col items-stretch gap-4 px-gutter py-12',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <div className="h-3 w-32 animate-pulse rounded bg-line/80" />
      <div className="h-8 w-3/4 animate-pulse rounded-md bg-line/70" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-line/55" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-line/40" />
      <div className="mt-6 h-32 w-full animate-pulse rounded-xl bg-surface-elevated/70 ring-1 ring-line/60" />
    </section>
  );
}
