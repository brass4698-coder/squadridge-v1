import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { Activity } from 'lucide-react';

import { Link, Outlet, useLocation } from 'react-router-dom';

import { RouteErrorBoundary } from '../RouteErrorBoundary';

import { AuthIssueBanner } from '../auth/AuthIssueBanner';

import { OfflineBanner } from '../OfflineBanner';

import { ZkStubBanner } from '../ZkStubBanner';

import { getPublicContactEmail, mainContentPaddingClass } from '../../lib';

import { useIsModerator } from '../../hooks';

import { AppHeaderNav } from './AppHeaderNav';

import { Breadcrumbs } from './Breadcrumbs';

import { MobileHomeFab } from './MobileHomeFab';

import { DemoLayout } from '../../demo/DemoLayout';

import { useDemoWalkthrough } from '../../demo';

import { publicShellInnerClass, shellListResetClass } from './publicShell';

import { twMerge } from 'tailwind-merge';

const footerLinkClass =
  'font-sans text-[0.875rem] font-medium text-slate-500 no-underline transition-colors hover:text-slate-400 hover:underline';

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

  const year = new Date().getFullYear();

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
          className={twMerge(publicShellInnerClass, 'flex flex-1 flex-col', mainPad, demoMainPad)}
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

        <footer className="border-t border-navy-light/50 bg-[rgba(6,9,15,0.35)]">
          <div className={twMerge(publicShellInnerClass, 'pt-8 pb-6 md:pt-12 md:pb-8')}>
            <p className="mb-4 max-w-3xl font-sans text-[0.875rem] leading-relaxed text-slate-500 md:mb-5">
              Public records expose outcomes, not room-level discussion.
            </p>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="min-w-0">
                <Link
                  to="/"
                  className="inline-block font-heading text-[17px] font-semibold tracking-tight text-slate-100 no-underline transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/50"
                >
                  SquadRidge
                </Link>

                <p className="mt-2.5 max-w-[48ch] font-sans text-[0.875rem] font-normal leading-relaxed text-slate-600 md:mt-3 md:text-[0.9375rem]">
                  Verified dialogue infrastructure for facilitator-led pilots, sensitive
                  conversations, and citable public outcomes.
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-x-10 lg:gap-x-12">
                <div className="min-w-[140px]">
                  <p className="mb-2.5 font-heading text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-slate-600">
                    Platform
                  </p>

                  <ul className={twMerge(shellListResetClass, 'flex flex-col gap-2')}>
                    <li className="list-none">
                      <a href="/#how-it-works" className={footerLinkClass}>
                        How it works
                      </a>
                    </li>

                    <li className="list-none">
                      <Link to="/ledger" className={footerLinkClass}>
                        Ledger
                      </Link>
                    </li>

                    <li className="list-none">
                      <Link to="/security" className={footerLinkClass}>
                        Security
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="min-w-[140px]">
                  <p className="mb-2.5 font-heading text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-slate-600">
                    Access
                  </p>

                  <ul className={twMerge(shellListResetClass, 'flex flex-col gap-2')}>
                    <li className="list-none">
                      <a href="/#waitlist" className={footerLinkClass}>
                        Pilot access
                      </a>
                    </li>

                    {contactEmail ? (
                      <li className="list-none">
                        <a href={`mailto:${contactEmail}`} className={footerLinkClass}>
                          Contact
                        </a>
                      </li>
                    ) : null}

                    {isMod && pathname !== '/' ? (
                      <li className="list-none">
                        <Link to="/mod" className={footerLinkClass}>
                          Moderation
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </div>

            {showDevFooterLinks ? (
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <p className="mb-3 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Development
                </p>

                <ul
                  className={twMerge(
                    shellListResetClass,
                    'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8',
                  )}
                >
                  <li className="list-none">
                    <Link
                      to="/admin/health"
                      className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] font-medium text-slate-600 no-underline transition-colors hover:text-slate-400 hover:underline"
                    >
                      <Activity className="size-3 shrink-0 opacity-50" aria-hidden />
                      Supabase health
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}

            {pathname !== '/' &&
            !pathname.startsWith('/ledger') &&
            !pathname.startsWith('/security') ? (
              <div className="mt-8 flex max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4 lg:mx-auto">
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

            <p className="mt-5 border-t border-navy-light/35 pt-5 text-center font-sans text-[0.8125rem] leading-normal text-slate-600 sm:text-left md:whitespace-nowrap">
              © {year} SquadRidge. All rights reserved.
            </p>
          </div>
        </footer>
      </DemoLayout>
    </div>
  );
}
