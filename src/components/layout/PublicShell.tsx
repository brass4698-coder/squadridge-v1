import { type ReactNode, useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { DemoLayout } from '../../demo/DemoLayout';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { allowsImmediatePublicPaint } from '../../lib/publicRoutes';
import { prefetchPublicRoute } from '../../lib/prefetchPublicRoute';
import { PublicFooter } from './PublicFooter';
import { publicShellInnerClass } from './publicShellTokens';

const desktopNav = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Security', href: '/security' },
];

const publicNav = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Security', href: '/security' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

function isPublicMarketingRoute(pathname: string): boolean {
  return allowsImmediatePublicPaint(pathname);
}

/** Public ledger journey — continuous dark register (same unified dark palette). */
function isLedgerRoute(pathname: string): boolean {
  return pathname === '/ledger' || pathname.startsWith('/ledger/');
}

const NAV_SCROLL_THRESHOLD_PX = 32;

export function PublicShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isLedger = isLedgerRoute(pathname);
  const isPublicMarketing = isPublicMarketingRoute(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const { showDemoChrome } = useDemoWalkthrough();

  useEffect(() => {
    if (isLedger) {
      document.body.setAttribute('data-theme', 'ledger-dark');
      return () => {
        document.body.removeAttribute('data-theme');
      };
    }
    if (isPublicMarketing) {
      document.body.setAttribute('data-theme', 'institutional');
      return () => {
        document.body.removeAttribute('data-theme');
      };
    }
    document.body.removeAttribute('data-theme');
    return undefined;
  }, [isLedger, isPublicMarketing]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <DemoLayout>
      <div className="sr-page-glow relative flex min-h-screen flex-col bg-surface text-ink">
        <header
          className={
            isPublicMarketing
              ? 'nav-frosted sticky top-0 z-40 border-b'
              : 'sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md'
          }
          data-scrolled={scrolled ? 'true' : 'false'}
        >
          <div className={`${publicShellInnerClass} flex h-16 items-center gap-4`}>
            <Link
              to="/"
              className="inline-flex h-full shrink-0 items-center text-ink no-underline"
              aria-label="SquadRidge home"
            >
              <SquadRidgeLockup size="sm" showTagline={false} />
            </Link>

            <nav
              className="ml-6 hidden h-full flex-1 items-center gap-1 nav:flex lg:gap-1.5"
              aria-label="Public navigation"
            >
              {desktopNav.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onMouseEnter={() => prefetchPublicRoute(item.href)}
                  onFocus={() => prefetchPublicRoute(item.href)}
                  className={({ isActive }) =>
                    'sr-nav-link inline-flex items-center rounded-[var(--sr-radius-md)] px-3 py-2 text-sm leading-none tracking-normal no-underline lg:px-3.5 ' +
                    (isActive
                      ? 'bg-surface-accent font-medium text-ink'
                      : 'text-ink-secondary hover:bg-surface-elevated hover:text-ink')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex h-full shrink-0 items-center gap-2 border-l border-line pl-5 sm:gap-3 sm:pl-6">
              <Link
                to="/sign-in"
                className="sr-nav-link hidden h-10 items-center rounded-[var(--sr-radius-md)] px-3.5 text-sm leading-none text-ink-secondary no-underline hover:text-ink nav:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/request-access"
                className="btn-institutional btn-institutional--primary sr-press hidden h-10 min-h-10 items-center nav:inline-flex"
                onMouseEnter={() => prefetchPublicRoute('/request-access')}
                onFocus={() => prefetchPublicRoute('/request-access')}
              >
                Request pilot access
              </Link>
              <button
                type="button"
                className="focus-ring sr-press inline-flex h-10 w-10 items-center justify-center rounded-[var(--sr-radius-md)] border border-line text-ink-secondary transition-colors hover:text-ink nav:hidden"
                aria-expanded={mobileOpen}
                aria-controls={menuId}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <X className="size-4" aria-hidden />
                ) : (
                  <Menu className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div
              id={menuId}
              className="sr-glass-sidebar border-t border-line nav:hidden"
              role="dialog"
              aria-label="Site menu"
            >
              <nav
                className={`${publicShellInnerClass} flex flex-col gap-1 py-4`}
                aria-label="Mobile"
              >
                {publicNav.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onMouseEnter={() => prefetchPublicRoute(item.href)}
                    onFocus={() => prefetchPublicRoute(item.href)}
                    className={({ isActive }) =>
                      'sr-nav-link rounded-xl px-3 py-3 text-sm no-underline ' +
                      (isActive
                        ? 'bg-surface-accent text-ink'
                        : 'text-ink-secondary hover:text-ink')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  to="/sign-in"
                  className="sr-nav-link rounded-xl px-3 py-3 text-sm text-ink-secondary no-underline hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/request-access"
                  className="btn-institutional btn-institutional--primary sr-press mt-2 w-full"
                  onMouseEnter={() => prefetchPublicRoute('/request-access')}
                  onFocus={() => prefetchPublicRoute('/request-access')}
                >
                  Request pilot access
                </Link>
              </nav>
            </div>
          ) : null}
        </header>

        <main
          key={pathname}
          data-scroll-root={isPublicMarketing ? undefined : true}
          className={
            'sr-page-enter ' +
            (isPublicMarketing
              ? 'sr-marketing-surface relative z-10 flex-1 text-left'
              : 'flex-1 text-left') +
            (showDemoChrome ? ' pb-28' : '')
          }
        >
          {children}
        </main>

        <PublicFooter />
      </div>
    </DemoLayout>
  );
}
