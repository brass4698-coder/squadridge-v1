import { SquadLogo } from '../SquadLogo';
import { SquadRidgeWordmark } from '../SquadRidgeWordmark';
import { cn } from '../../lib/cn';

const PHASES = ['Configure', 'Verify', 'Facilitate', 'Release'] as const;

export type SrLoaderVariant = 'boot' | 'route' | 'shell' | 'inline';

export type SrLoaderProps = {
  /** Visible + accessible status copy */
  label?: string;
  variant?: SrLoaderVariant;
  className?: string;
  /** Highlight phase index 0–3 for docket motif; omit for indeterminate */
  activePhase?: number;
};

function PhaseTicks({ activePhase }: { activePhase?: number }) {
  return (
    <ol className="sr-loader__ticks" aria-hidden="true">
      {PHASES.map((phase, i) => {
        const lit = activePhase == null ? true : i <= activePhase;
        return (
          <li key={phase} className={cn('sr-loader__tick', lit && 'sr-loader__tick--lit')}>
            <span className="sr-loader__tick-dot" />
            <span className="sr-loader__tick-label">{phase}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ProgressRail() {
  return (
    <div className="sr-loader__rail" aria-hidden="true">
      <span className="sr-loader__rail-fill" />
    </div>
  );
}

/**
 * Branded instrument loader — lockup + slim progress + spine ticks.
 * Visible on first paint (no opacity:0). Respects prefers-reduced-motion via CSS.
 */
export function SrLoader({
  label = 'Loading…',
  variant = 'boot',
  className,
  activePhase,
}: SrLoaderProps) {
  const body = (
    <div className={cn('sr-loader__body', variant === 'inline' && 'sr-loader__body--inline')}>
      <div className="sr-loader__brand">
        <span className="sr-loader__mark">
          <SquadLogo size={variant === 'inline' ? 28 : variant === 'route' ? 34 : 40} aria-hidden />
        </span>
        {variant !== 'inline' ? (
          <SquadRidgeWordmark size={variant === 'boot' || variant === 'shell' ? 'md' : 'sm'} />
        ) : null}
      </div>
      <ProgressRail />
      {variant === 'boot' || variant === 'shell' ? <PhaseTicks activePhase={activePhase} /> : null}
      <p className="sr-loader__label">{label}</p>
    </div>
  );

  if (variant === 'shell') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
        className={cn('sr-loader sr-loader--shell flex min-h-dvh flex-col bg-surface', className)}
      >
        <div className="border-b border-line px-gutter py-4" aria-hidden>
          <div className="mx-auto flex max-w-shell items-center justify-between gap-4">
            <div className="h-5 w-28 rounded-sm bg-surface-sunken" />
            <div className="hidden gap-3 sm:flex">
              <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
              <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
              <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-shell flex-1 items-center justify-center px-gutter py-16">
          {body}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={cn(
        'sr-loader',
        variant === 'boot' && 'sr-loader--boot',
        variant === 'route' && 'sr-loader--route',
        variant === 'inline' && 'sr-loader--inline',
        className,
      )}
    >
      {body}
    </div>
  );
}

/** Full-viewport branded boot (auth gate / cold start moments). */
export function SrBootLoader({
  label = 'Loading session…',
  className,
}: Omit<SrLoaderProps, 'variant'>) {
  return <SrLoader variant="boot" label={label} className={className} />;
}

/** Lightweight Suspense fallback for lazy route chunks — stays in-flow, feels instant. */
export function RouteChunkFallback({ label = 'Loading page content' }: { label?: string }) {
  return <SrLoader variant="route" label={label} />;
}

/** App chrome shell skeleton while auth initializes on gated routes. */
export function AppShellSkeleton({ label = 'Loading…' }: { label?: string }) {
  return <SrLoader variant="shell" label={label} />;
}
