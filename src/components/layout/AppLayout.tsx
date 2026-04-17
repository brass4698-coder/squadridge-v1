import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { AuthIssueBanner } from '../auth/AuthIssueBanner';
import { OfflineBanner } from '../OfflineBanner';
import { ZkStubBanner } from '../ZkStubBanner';
import { getPublicContactEmail, mainContentPaddingClass } from '../../lib';
import { useIsModerator } from '../../hooks';
import { AppHeaderNav } from './AppHeaderNav';
import { DemoLayout } from '../../demo/DemoLayout';
import { useDemoWalkthrough } from '../../demo';

export function AppLayout() {
  const contactEmail = getPublicContactEmail();
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const showDevFooterLinks = import.meta.env.DEV;
  const { showDemoChrome } = useDemoWalkthrough();

  const mainPad = mainContentPaddingClass(pathname);
  const demoMainPad = showDemoChrome ? 'pb-24' : '';

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-navy text-white">
      <DemoLayout>
        <ZkStubBanner />
        <OfflineBanner />
        <AuthIssueBanner />
        <AppHeaderNav variant="full" />
        <main
          className={`mx-auto flex w-full flex-1 flex-col max-w-6xl px-md ${mainPad} ${demoMainPad}`}
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
              <Link
                to="/security"
                className="underline-offset-4 hover:text-slate-300 hover:underline"
              >
                Security &amp; privacy
              </Link>
              {showDevFooterLinks ? (
                <>
                  <span className="text-navy-light/60" aria-hidden>
                    ·
                  </span>
                  <Link
                    to="/dev/supabase"
                    className="underline-offset-4 hover:text-slate-300 hover:underline"
                  >
                    Technical notes
                  </Link>
                </>
              ) : null}
              {isMod ? (
                <>
                  <span className="text-navy-light/60" aria-hidden>
                    ·
                  </span>
                  <Link
                    to="/mod"
                    className="underline-offset-4 hover:text-slate-300 hover:underline"
                  >
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
      </DemoLayout>
    </div>
  );
}
