import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { Activity } from 'lucide-react';

import { Link, Outlet, useLocation } from 'react-router-dom';

import { RouteErrorBoundary } from '../RouteErrorBoundary';

import { AuthIssueBanner } from '../auth/AuthIssueBanner';

import { OfflineBanner } from '../OfflineBanner';

import { ZkStubBanner } from '../ZkStubBanner';

import { footerLinkGroups, mainContentPaddingClass } from '../../lib';

import { useIsModerator } from '../../hooks';

import { AppHeaderNav } from './AppHeaderNav';

import { Breadcrumbs } from './Breadcrumbs';

import { MobileHomeFab } from './MobileHomeFab';

import { SystemStatusStrip } from './SystemStatusStrip';

import { DemoLayout } from '../../demo/DemoLayout';

import { useDemoWalkthrough } from '../../demo';

import { publicShellInnerClass, shellListResetClass } from './publicShell';

import { twMerge } from 'tailwind-merge';

const footerLinkClass =
  'sr-footer-link font-sans text-[0.875rem] font-medium text-ink-faint no-underline hover:underline';

const footerTrustSignals = [
  'Pilot access is human reviewed',
  'No transcript is treated as the public record',
  'Trust & Safety covers the operating model; Security Disclosure covers technical scope',
] as const;

function usesAppChrome(pathname: string): boolean {
  return (
    pathname.startsWith('/find-squad') ||
    pathname.startsWith('/intent') ||
    pathname.startsWith('/match') ||
    pathname.startsWith('/session') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mod') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/insights/dashboard')
  );
}

export function AppLayout() {
  const { pathname } = useLocation();

  const appChrome = usesAppChrome(pathname);

  const showDevFooterLinks =
    import.meta.env.DEV &&
    appChrome &&
    pathname !== '/' &&
    !pathname.startsWith('/ledger') &&
    !pathname.startsWith('/security') &&
    !pathname.startsWith('/pitch-deck-hub');

  const { showDemoChrome } = useDemoWalkthrough();

  const mainPad = mainContentPaddingClass(pathname);

  const demoMainPad = showDemoChrome ? 'pb-24' : '';
  const mainShellClass = appChrome
    ? twMerge(publicShellInnerClass, 'flex flex-1 flex-col', mainPad, demoMainPad)
    : twMerge('flex w-full flex-1 flex-col', demoMainPad);

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
        {appChrome ? <ZkStubBanner /> : null}

        <OfflineBanner />

        {appChrome ? <AuthIssueBanner /> : null}

        <AppHeaderNav variant={appChrome ? 'app' : 'public'} />

        {appChrome ? <SystemStatusStrip /> : null}

        <main id="main-content" className={mainShellClass}>
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

        <footer className="relative border-t border-line-divider bg-surface-sunken">
          <span aria-hidden className="sr-footer-accent absolute inset-x-0 top-0" />
          <div className={twMerge(publicShellInnerClass, 'pt-8 pb-6 md:pt-12 md:pb-8')}>
            <p className="border-b border-line-divider pb-5 font-sans text-[0.875rem] leading-relaxed text-ink-faint md:pb-6">
              The room is private. The record is deliberate. The two are never the same artifact.
            </p>

            <div className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.55fr)] lg:gap-14">
              <div className="min-w-0 rounded-md border border-line bg-surface-elevated/70 p-5 md:p-6">
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

                <p className="mt-5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  Institutional review
                </p>

                <ul className={twMerge(shellListResetClass, 'mt-3 grid gap-2')}>
                  {footerTrustSignals.map((signal) => (
                    <li
                      key={signal}
                      className="flex gap-2.5 font-sans text-[0.82rem] leading-relaxed text-ink-secondary"
                    >
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:gap-x-8">
                {footerLinkGroups.map((group) => (
                  <div key={group.title} className="min-w-0">
                    <p className="mb-2.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      {group.title}
                    </p>

                    <ul className={twMerge(shellListResetClass, 'flex flex-col gap-2.5')}>
                      {group.links.map((link) => (
                        <li key={link.label} className="list-none">
                          <Link to={link.href} className={footerLinkClass}>
                            {link.label}
                          </Link>
                        </li>
                      ))}

                      {group.title === 'Resources' && appChrome ? <ModeratorFooterLink /> : null}
                    </ul>
                  </div>
                ))}
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

            {appChrome ? (
              <div className="mt-8 flex max-w-md flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4 lg:mx-auto">
                <Link to="/" className="btn-secondary min-w-[140px] text-[0.85rem] no-underline">
                  Start over
                </Link>

                <p className="text-center font-sans text-[0.8rem] leading-snug text-ink-faint sm:text-left">
                  Return to the platform overview and re-enter the controlled path.
                </p>
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-2 border-t border-line-divider pt-5 font-sans text-[0.8125rem] leading-normal text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
              <p>© {year} SquadRidge. All rights reserved.</p>
              <p className="max-w-[44rem] sm:text-right">
                Pilot-stage operations: access, retention, and release scope are confirmed per
                partner agreement.
              </p>
            </div>
          </div>
        </footer>
      </DemoLayout>
    </div>
  );
}

function ModeratorFooterLink() {
  const { data: isMod } = useIsModerator();
  if (!isMod) return null;
  return (
    <li className="list-none">
      <Link to="/mod" className={footerLinkClass}>
        Moderation
      </Link>
    </li>
  );
}
