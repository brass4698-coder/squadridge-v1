import { type ReactNode, useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { SectionLabel } from '../SectionLabel';
import { DemoLayout } from '../../demo/DemoLayout';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { publicShellInnerClass, shellListResetClass } from './publicShellTokens';

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

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Use cases', href: '/use-cases' },
      { label: 'Ledger', href: '/ledger' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Security', href: '/security' },
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Request pilot access', href: '/request-access' },
      { label: 'Contact', href: '/contact' },
      { label: 'Sign in', href: '/sign-in' },
    ],
  },
] as const;

const PUBLIC_MARKETING_PREFIXES = [
  '/how-it-works',
  '/use-cases',
  '/security',
  '/ledger',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/request-access',
  '/sign-in',
  '/enter',
  '/access-pending',
];

function isPublicMarketingRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_MARKETING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isPublicMarketing = isPublicMarketingRoute(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const { showDemoChrome } = useDemoWalkthrough();

  useEffect(() => {
    if (isPublicMarketing) {
      document.body.setAttribute('data-theme', 'institutional');
      return () => {
        document.body.removeAttribute('data-theme');
      };
    }
    document.body.removeAttribute('data-theme');
    return undefined;
  }, [isPublicMarketing]);

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

  return (
    <DemoLayout>
      <div className="sr-page-glow relative flex min-h-screen flex-col bg-surface text-ink">
        <header
          className={
            isPublicMarketing
              ? 'nav-frosted sticky top-0 z-40 border-b border-line'
              : 'sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md'
          }
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
              className="ml-6 hidden h-full flex-1 items-center gap-2 nav:flex lg:gap-2.5"
              aria-label="Public navigation"
            >
              {desktopNav.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    'inline-flex items-center rounded-[var(--sr-radius-md)] px-3 py-2 text-sm leading-none tracking-normal no-underline transition-colors lg:px-3.5 ' +
                    (isActive
                      ? 'bg-surface-accent font-medium text-ink'
                      : 'text-ink-secondary hover:bg-surface-elevated hover:text-ink')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex h-full shrink-0 items-center gap-2 border-l border-line pl-4 sm:gap-3 sm:pl-5">
              <Link
                to="/sign-in"
                className="hidden h-10 items-center rounded-[var(--sr-radius-md)] px-3.5 text-sm leading-none text-ink-secondary no-underline transition-colors hover:text-ink nav:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/request-access"
                className="btn-institutional btn-institutional--primary hidden h-10 min-h-10 items-center nav:inline-flex"
              >
                Request pilot access
              </Link>
              <button
                type="button"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--sr-radius-md)] border border-line text-ink-secondary hover:text-ink nav:hidden"
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
              className="border-t border-line bg-surface-elevated nav:hidden"
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
                    className={({ isActive }) =>
                      'rounded-xl px-3 py-3 text-sm no-underline ' +
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
                  className="rounded-xl px-3 py-3 text-sm text-ink-secondary no-underline hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/request-access"
                  className="btn-institutional btn-institutional--primary mt-2 w-full"
                >
                  Request pilot access
                </Link>
              </nav>
            </div>
          ) : null}
        </header>

        <main
          data-scroll-root={isPublicMarketing ? undefined : true}
          className={
            (isPublicMarketing
              ? 'sr-marketing-surface relative z-10 flex-1 text-left'
              : 'flex-1 text-left') + (showDemoChrome ? ' pb-28' : '')
          }
        >
          {children}
        </main>

        <footer
          className="relative z-10 border-t border-line bg-surface-elevated/60 px-0 py-14"
          data-scroll-section
        >
          {' '}
          <div className={publicShellInnerClass}>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] md:gap-14">
              <div>
                <SquadRidgeLockup size="sm" className="mb-4 text-ink" alt="SquadRidge" />
                <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">
                  Private session rooms · facilitator-governed release · approved outcomes only. Not
                  a chat product.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                {footerColumns.map((col) => (
                  <div key={col.title}>
                    <SectionLabel className="mb-3">{col.title}</SectionLabel>
                    <ul className={`${shellListResetClass} mt-0 flex flex-col gap-2.5`}>
                      {col.links.map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className="text-sm text-ink-secondary transition-colors hover:text-brand"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-12 border-t border-line pt-6 text-xs text-ink-faint">
              &copy; {new Date().getFullYear()} SquadRidge.
            </p>
          </div>
        </footer>
      </div>
    </DemoLayout>
  );
}
