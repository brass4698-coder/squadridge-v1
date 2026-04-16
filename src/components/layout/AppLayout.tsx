import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { AuthIssueBanner } from '../auth/AuthIssueBanner';
import { OfflineBanner } from '../OfflineBanner';
import { ZkStubBanner } from '../ZkStubBanner';
import { getPublicContactEmail } from '../../lib/env';
import { useIsModerator } from '../../hooks/useIsModerator';
import { AppHeaderNav } from './AppHeaderNav';
import { mainContentPaddingClass } from '../../lib/appLayoutPadding';
import { useDemoWalkthrough } from '../../demo';

export function AppLayout() {
  const contactEmail = getPublicContactEmail();
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const showDevFooterLinks = import.meta.env.DEV;
  const {
    demoActive,
    currentStepIndex,
    currentStepTitle,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    exitDemo,
  } = useDemoWalkthrough();

  const onboardingRoute = pathname.startsWith('/onboarding');
  const mainPad = mainContentPaddingClass(pathname);
  const demoMainPad = demoActive ? 'pb-24' : '';

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden bg-navy text-white">
      <ZkStubBanner />
      <OfflineBanner />
      <AuthIssueBanner />
      {demoActive ? (
        <div
          className="relative z-[5] border-b border-amber/25 bg-amber/10 px-md py-2.5 text-center"
          role="status"
        >
          <p className="font-sans text-[0.8rem] leading-snug text-amber/95 md:text-[0.85rem]">
            Guided tour — simulation, not a live dispute. Seeded or offline where noted.
          </p>
        </div>
      ) : null}
      <AppHeaderNav variant={onboardingRoute ? 'minimal' : 'full'} />
      <main
        className={`mx-auto flex w-full flex-1 flex-col ${
          onboardingRoute ? 'max-w-none p-0' : 'max-w-6xl px-md'
        } ${mainPad} ${demoMainPad}`}
      >
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <RouteErrorBoundary onRetry={reset} embedded>
              <Outlet />
            </RouteErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
      <footer className="border-t border-navy-light/50 bg-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-md py-10 text-center">
          <p className="max-w-md font-sans text-[0.85rem] font-normal leading-relaxed text-slate-600">
            Infrastructure for conversations the world needs but can&apos;t have openly.
          </p>
          <nav
            className="flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-[0.85rem] text-slate-500"
            aria-label="Site"
          >
            <Link to="/security" className="underline-offset-4 hover:text-slate-300 hover:underline">
              Security &amp; privacy
            </Link>
            {showDevFooterLinks ? (
              <>
                <span className="text-navy-light/60" aria-hidden>
                  ·
                </span>
                <Link to="/dev/supabase" className="underline-offset-4 hover:text-slate-300 hover:underline">
                  Technical notes
                </Link>
              </>
            ) : null}
            {isMod ? (
              <>
                <span className="text-navy-light/60" aria-hidden>
                  ·
                </span>
                <Link to="/mod" className="underline-offset-4 hover:text-slate-300 hover:underline">
                  Moderation
                </Link>
              </>
            ) : null}
          </nav>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="font-sans text-[0.85rem] font-normal text-slate-600 underline-offset-4 hover:text-slate-300 hover:underline"
            >
              {contactEmail}
            </a>
          ) : null}
        </div>
      </footer>
      {demoActive ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-light/60 bg-[#070b12]/95 px-md py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {currentStepIndex >= 0 && currentStepTitle ? (
                <>
                  Step {currentStepIndex + 1} · {currentStepTitle}
                </>
              ) : (
                <>Guided tour</>
              )}
            </p>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button type="button" className="btn-secondary min-h-[2.5rem] px-4 py-2 text-sm" disabled={!canGoBack} onClick={goBack}>
                Back
              </button>
              <button type="button" className="btn-secondary min-h-[2.5rem] px-4 py-2 text-sm" disabled={!canGoNext} onClick={goNext}>
                Next
              </button>
              <button
                type="button"
                className="min-h-[2.5rem] rounded-md border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-white/5"
                onClick={exitDemo}
              >
                Exit tour
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
