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
  'font-sans text-[0.875rem] font-medium text-ink-faint no-underline transition-colors hover:text-ink-secondary hover:underline';

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
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-surface text-ink">
      <a
        href="#main-content"
        className="sr-only z-[200] rounded bg-record-paper px-3 py-2 font-sans text-sm font-semibold text-record-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
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
          id="main-content"
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

        <footer className="border-t border-line-divider bg-surface-sunken">
          <div className={twMerge(publicShellInnerClass, 'pt-8 pb-6 md:pt-12 md:pb-8')}>
            <p className="mb-4 max-w-3xl font-sans text-[0.875rem] leading-relaxed text-ink-faint md:mb-5">
              The room is private. The record is deliberate. The two are never the same artifact.
            </p>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="min-w-0">
                <Link
                  to="/"
                  className="inline-block font-display text-[18px] font-semibold tracking-tight text-ink no-underline transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  SquadRidge
                </Link>

                <p className="mt-2.5 max-w-[50ch] font-sans text-[0.875rem] font-normal leading-relaxed text-ink-faint md:mt-3 md:text-[0.9375rem]">
                  Verified dialogue infrastructure for sealed facilitator-led rooms and durable
                  public records.
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-8 sm:flex-row sm:flex-wrap sm:gap-x-10 lg:gap-x-12">
                <div className="min-w-[140px]">
                  <p className="mb-2.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
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

                <div className="min-w-[160px]">
                  <p className="mb-2.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                    Access
                  </p>

                  <ul className={twMerge(shellListResetClass, 'flex flex-col gap-2')}>
                    <li className="list-none">
                      <a href="/#waitlist" className={footerLinkClass}>
                        Apply for a pilot
                      </a>
                    </li>

                    {contactEmail ? (
                      <li className="list-none">
                        <a
                          href={`mailto:${contactEmail}?subject=${encodeURIComponent('General inquiry')}`}
                          className={footerLinkClass}
                        >
                          General inquiries
                        </a>
                      </li>
                    ) : null}

                    {contactEmail ? (
                      <li className="list-none">
                        <a
                          href={`mailto:${contactEmail}?subject=${encodeURIComponent('Privacy / data question')}`}
                          className={footerLinkClass}
                        >
                          Privacy & data
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
                <Link to="/" className="btn-secondary min-w-[140px] text-[0.85rem] no-underline">
                  Start over
                </Link>

                <p className="text-center font-sans text-[0.8rem] leading-snug text-ink-faint sm:text-left">
                  Return to the platform overview and re-enter the controlled path.
                </p>
              </div>
            ) : null}

            <p className="mt-5 border-t border-line-divider pt-5 text-center font-sans text-[0.8125rem] leading-normal text-ink-subtle sm:text-left md:whitespace-nowrap">
              © {year} SquadRidge. All rights reserved.
            </p>
          </div>
        </footer>
      </DemoLayout>
    </div>
  );
}
