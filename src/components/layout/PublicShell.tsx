import { type ReactNode, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';

const publicNav = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Security', href: '/security' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'About', href: '/about' },
];

const footerLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Security', href: '/security' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
  { label: 'Request access', href: '/request-access' },
];

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

  return (
    <div
      className={
        isPublicMarketing
          ? 'relative flex min-h-screen flex-col bg-surface text-ink'
          : 'theme-light flex min-h-screen flex-col bg-surface'
      }
    >
      <header
        className={
          isPublicMarketing
            ? 'nav-frosted sticky top-0 z-40 border-b border-line'
            : 'sticky top-0 z-40 border-b border-line bg-surface'
        }
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-ink" aria-label="SquadRidge home">
            <SquadRidgeLockup size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Public navigation">
            {publicNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  'text-sm transition-colors ' +
                  (isActive
                    ? 'font-medium text-ink'
                    : 'font-normal text-ink-secondary hover:text-ink')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/sign-in"
              className="hidden text-sm text-ink-secondary transition-colors hover:text-ink sm:inline"
            >
              Sign in
            </Link>
            <Link to="/request-access" className="btn-institutional btn-institutional--primary">
              Request access
            </Link>
          </div>
        </div>
      </header>

      <main className={isPublicMarketing ? 'relative z-10 flex-1' : 'flex-1'}>{children}</main>

      <footer
        className={
          isPublicMarketing
            ? 'relative z-10 border-t border-line bg-surface px-6 py-14'
            : 'border-t border-line bg-surface px-6 py-12'
        }
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-xs text-ink-secondary transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <SquadRidgeLockup size="sm" className="mb-3 text-ink" alt="SquadRidge" />
            <p className="max-w-xl text-xs leading-relaxed text-ink-secondary">
              Structured facilitation infrastructure for mediators and institutions. Session room
              content is private; only approved outcomes are published.
            </p>
            <p className="text-xs text-ink-faint">&copy; {new Date().getFullYear()} SquadRidge.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
