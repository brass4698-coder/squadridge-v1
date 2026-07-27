import { lazy, Suspense } from 'react';
import { LandingHero } from '../../components/landing/LandingHero';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { usePageTitle } from '../../hooks/usePageTitle';

const LandingBelowFold = lazy(() =>
  import('../../components/landing/LandingBelowFold').then((m) => ({
    default: m.LandingBelowFold,
  })),
);

function LandingBelowFoldFallback() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="border-t border-line">
      <span className="sr-only">Loading more page content.</span>
      <div className={`${publicShellInnerClass} flex flex-col gap-4 py-16`}>
        <div
          className="h-3 w-28 rounded-sm bg-surface-sunken motion-safe:animate-pulse"
          aria-hidden
        />
        <div
          className="h-8 w-2/3 max-w-md rounded-sm bg-surface-sunken motion-safe:animate-pulse"
          aria-hidden
        />
        <div
          className="mt-2 h-36 w-full max-w-2xl rounded-[var(--sr-radius-md)] bg-surface-sunken/60 motion-safe:animate-pulse"
          aria-hidden
        />
      </div>
    </div>
  );
}

/**
 * Homepage — hero paints from the main chunk; below-fold loads as a parallel chunk.
 */
export function LandingPage() {
  usePageTitle('Private deliberation infrastructure');

  return (
    <div className="sr-align-content" data-page="landing">
      <LandingHero />
      <Suspense fallback={<LandingBelowFoldFallback />}>
        <LandingBelowFold />
      </Suspense>
    </div>
  );
}
