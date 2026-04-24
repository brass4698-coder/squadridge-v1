import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Activity, Shield } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { AuthIssueBanner } from '../auth/AuthIssueBanner';
import { OfflineBanner } from '../OfflineBanner';
import { ZkStubBanner } from '../ZkStubBanner';
import { DEMO_PROPOSAL_ID, getPublicContactEmail, mainContentPaddingClass } from '../../lib';
import { useIsModerator } from '../../hooks';
import { AppHeaderNav } from './AppHeaderNav';
import { Breadcrumbs } from './Breadcrumbs';
import { MobileHomeFab } from './MobileHomeFab';
import { DemoLayout } from '../../demo/DemoLayout';
import { useDemoWalkthrough } from '../../demo';

export function AppLayout() {
  const contactEmail = getPublicContactEmail();
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const showDevFooterLinks =
    import.meta.env.DEV &&
    pathname !== '/' &&
    !pathname.startsWith('/ledger') &&
    !pathname.startsWith('/security') &&
    !pathname.startsWith('/pitch-deck-hub');
  const { showDemoChrome } = useDemoWalkthrough();

  const mainPad = mainContentPaddingClass(pathname);
  const demoMainPad = showDemoChrome ? 'pb-24' : '';

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-navy text-white">
      <DemoLayout>
        {pathname === '/' ||
        pathname.startsWith('/ledger') ||
        pathname.startsWith('/security') ||
        pathname.startsWith('/settings/profile') ? null : (
          <ZkStubBanner />
        )}
        <OfflineBanner />
        <AuthIssueBanner />
        <AppHeaderNav variant="full" />
        <main
          className={`mx-auto flex w-full max-w-6xl flex-1 flex-col px-gutter ${mainPad} ${demoMainPad}`}
        >
          <Breadcrumbs />
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <RouteErrorBoundary onRetry={reset} embedded>
                <Outlet />
              </RouteErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </main>
        <MobileHomeFab />
        <footer className="border-t border-navy-light/50 bg-transparent">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-gutter py-10 text-center">
            <p className="max-w-md font-sans text-[0.9rem] font-normal leading-relaxed text-slate-500">
              Verified dialogue infrastructure for facilitator-led pilots, sensitive conversations,
              and citable public outcomes.
            </p>
            <ul
              className="flex max-w-2xl list-none flex-wrap items-center justify-center gap-x-8 gap-y-3 px-1 font-sans text-[0.85rem] text-slate-500"
              aria-label="Site"
            >
              <li>
                <Link
                  to="/security"
                  className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-slate-300 hover:underline"
                >
                  <Shield className="size-3 shrink-0 opacity-[0.42]" aria-hidden />
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to={`/ledger/${DEMO_PROPOSAL_ID}`}
                  className="underline-offset-4 hover:text-slate-300 hover:underline"
                >
                  Sample output
                </Link>
              </li>
              <li>
                <a
                  href="/#waitlist"
                  className="underline-offset-4 hover:text-slate-300 hover:underline"
                >
                  Pilot access
                </a>
              </li>
              <li>
                <Link
                  to="/pitch-deck-hub"
                  className="underline-offset-4 hover:text-slate-300 hover:underline"
                >
                  Pitch materials
                </Link>
              </li>
              {showDevFooterLinks ? (
                <li>
                  <Link
                    to="/admin/health"
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-slate-300 hover:underline"
                  >
                    <Activity className="size-3 shrink-0 opacity-[0.42]" aria-hidden />
                    Supabase health (mods)
                  </Link>
                </li>
              ) : null}
              {isMod && pathname !== '/' ? (
                <li>
                  <Link
                    to="/mod"
                    className="underline-offset-4 hover:text-slate-300 hover:underline"
                  >
                    Moderation
                  </Link>
                </li>
              ) : null}
            </ul>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="font-sans text-[0.85rem] font-normal text-slate-600 underline-offset-4 hover:text-slate-300 hover:underline"
              >
                {contactEmail}
              </a>
            ) : null}
            {pathname !== '/' ? (
              <div className="flex max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
                <Link
                  to="/"
                  className="inline-flex min-h-[44px] min-w-[140px] items-center justify-center rounded-lg border border-[#2d3f55] bg-[#141c2e] px-5 py-2.5 font-heading text-[0.85rem] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[color,background-color,border-color] hover:border-teal/45 hover:bg-[#1a2436] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/60"
                >
                  Start over
                </Link>
                <p className="text-center font-sans text-[0.8rem] leading-snug text-slate-500 sm:text-left">
                  Return to the landing page and begin again from the top.
                </p>
              </div>
            ) : null}
          </div>
        </footer>
      </DemoLayout>
    </div>
  );
}
