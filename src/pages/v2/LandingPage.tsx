import { lazy, Suspense, useEffect } from 'react';
import { LandingHero } from '../../components/landing/LandingHero';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { RouteChunkFallback } from '../../components/system/SrLoader';
import { usePageTitle } from '../../hooks/usePageTitle';
import { prefetchPublicRoute } from '../../lib/prefetchPublicRoute';

const LandingBelowFold = lazy(() =>
  import('../../components/landing/LandingBelowFold').then((m) => ({
    default: m.LandingBelowFold,
  })),
);

const IDLE_PREFETCH = ['/how-it-works', '/request-access', '/security', '/use-cases'] as const;

function LandingBelowFoldFallback() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="border-t border-line">
      <div className={publicShellInnerClass}>
        <RouteChunkFallback label="Loading more page content" />
      </div>
    </div>
  );
}

/**
 * Homepage — hero paints from the main chunk; below-fold loads as a parallel chunk.
 */
export function LandingPage() {
  usePageTitle('Private deliberation infrastructure');

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const warm = () => {
      for (const path of IDLE_PREFETCH) prefetchPublicRoute(path);
    };
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(warm, { timeout: 2500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="sr-align-content" data-page="landing">
      <LandingHero />
      <Suspense fallback={<LandingBelowFoldFallback />}>
        <LandingBelowFold />
      </Suspense>
    </div>
  );
}
