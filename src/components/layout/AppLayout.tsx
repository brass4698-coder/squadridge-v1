import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '../RouteErrorBoundary';
import { AuthIssueBanner } from '../auth/AuthIssueBanner';
import { OfflineBanner } from '../OfflineBanner';
import { ZkStubBanner } from '../ZkStubBanner';
import { getPublicContactEmail } from '../../lib/env';
import { useIsModerator } from '../../hooks/useIsModerator';
import { AppHeaderNav } from './AppHeaderNav';

export function AppLayout() {
  const contactEmail = getPublicContactEmail();
  const { pathname } = useLocation();
  const { data: isMod } = useIsModerator();
  const showDevFooterLinks = import.meta.env.DEV;

  const onboardingRoute = pathname.startsWith('/onboarding');

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden bg-navy text-white">
      <ZkStubBanner />
      <OfflineBanner />
      <AuthIssueBanner />
      <AppHeaderNav variant={onboardingRoute ? 'minimal' : 'full'} />
      <main
        className={`mx-auto flex w-full flex-1 flex-col ${
          onboardingRoute ? 'max-w-none p-0' : 'max-w-6xl px-md'
        } ${
          pathname === '/'
            ? 'pt-0 pb-xl'
            : pathname.startsWith('/session') || pathname.startsWith('/match') || pathname.startsWith('/intent')
              ? 'pt-0 pb-xl'
              : pathname.startsWith('/onboarding') ||
                pathname.startsWith('/ledger') ||
                pathname.startsWith('/verify') ||
                pathname.startsWith('/security')
              ? 'pt-0 pb-xl'
              : 'py-xl'
        }`}
      >
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <RouteErrorBoundary onRetry={reset} embedded>
              <Outlet />
            </RouteErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
      <footer className="border-t border-[#1a2236] bg-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-md py-10 text-center">
          <p className="max-w-md font-sans text-[0.85rem] font-normal leading-relaxed text-[#3d4f63]">
            Infrastructure for conversations the world needs but can&apos;t have openly.
          </p>
          <nav
            className="flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-[0.85rem] text-[#5c6573]"
            aria-label="Site"
          >
            <Link to="/security" className="underline-offset-4 hover:text-[#a8b2c1] hover:underline">
              Security &amp; privacy
            </Link>
            {showDevFooterLinks ? (
              <>
                <span className="text-[#2d3f55]" aria-hidden>
                  ·
                </span>
                <Link to="/dev/supabase" className="underline-offset-4 hover:text-[#a8b2c1] hover:underline">
                  Technical notes
                </Link>
              </>
            ) : null}
            {isMod ? (
              <>
                <span className="text-[#2d3f55]" aria-hidden>
                  ·
                </span>
                <Link to="/mod" className="underline-offset-4 hover:text-[#a8b2c1] hover:underline">
                  Moderation
                </Link>
              </>
            ) : null}
          </nav>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="font-sans text-[0.85rem] font-normal text-[#3d4f63] underline-offset-4 hover:text-[#a8b2c1] hover:underline"
            >
              {contactEmail}
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
