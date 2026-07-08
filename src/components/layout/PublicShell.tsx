import { type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const publicNav = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Security', href: '/security' },
  { label: 'Ledger', href: '/ledger' },
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
  { label: 'Request access', href: '/request-access' },
  { label: 'Contact', href: '/contact' },
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
  const isHomepage = pathname === '/';

  return (
    <div
      className={
        isPublicMarketing
          ? 'relative flex min-h-screen flex-col bg-surface text-ink'
          : 'theme-light flex min-h-screen flex-col bg-surface'
      }
    >
      {isHomepage ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              backgroundImage:
                'linear-gradient(oklch(from var(--sr-ink) l c h / 0.028) 1px, transparent 1px), linear-gradient(90deg, oklch(from var(--sr-ink) l c h / 0.028) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent 80%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 42% at 50% -6%, oklch(from var(--sr-primary) l c h / 0.14), transparent 70%)',
            }}
          />
        </>
      ) : null}

      <header
        className={
          isPublicMarketing
            ? 'nav-frosted sticky top-0 z-40'
            : 'sticky top-0 z-40 border-b border-line bg-surface'
        }
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
          >
            {isPublicMarketing ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z" />
                <path d="M12 7.5 16 10v4l-4 2.5L8 14v-4l4-2.5Z" className="text-brand" />
              </svg>
            ) : null}
            SquadRidge
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Public navigation">
            {publicNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  'text-sm transition-opacity hover:opacity-70 ' +
                  (isActive ? 'font-medium text-ink' : 'font-normal text-ink-secondary')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/sign-in"
              className="text-sm text-ink-secondary transition-opacity hover:opacity-70"
            >
              Sign in
            </Link>
            <Link
              to="/request-access"
              className={
                isPublicMarketing
                  ? 'rounded-full border border-brand/40 px-4 py-1.5 text-sm text-brand transition-colors duration-200 hover:bg-brand-soft'
                  : 'rounded bg-brand px-4 py-2 text-sm font-medium text-brand-on transition-opacity hover:opacity-90'
              }
            >
              Request access
            </Link>
          </div>
        </div>
      </header>

      <main className={isPublicMarketing ? 'relative z-10 flex-1' : 'flex-1'}>{children}</main>

      <footer
        className={
          isPublicMarketing
            ? 'relative z-10 border-t border-line bg-surface px-6 py-12'
            : 'border-t border-line bg-surface px-6 py-12'
        }
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-xs text-ink-secondary transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-ink-secondary">
              &copy; {new Date().getFullYear()} SquadRidge. All rights reserved.
            </p>
            <p className="text-xs text-ink-secondary">
              Session room content is private. Only approved outcomes are published.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
