import { type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

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
];

export function PublicShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SquadRidge
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Public navigation">
            {publicNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  'text-sm transition-opacity hover:opacity-70 ' +
                  (isActive ? 'font-medium' : 'font-normal')
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/sign-in"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign in
            </Link>
            <Link
              to="/request-access"
              className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Request access
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children ?? <Outlet />}</main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-12"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              &copy; {new Date().getFullYear()} SquadRidge. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Session room content is private. Only approved outcomes are published.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
