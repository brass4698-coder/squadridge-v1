import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Security', href: '/security' },
  { label: 'Public Ledger', href: '/ledger' },
];

export function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="MENDguild — return to homepage"
        >
          MENDguild
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm transition-colors"
              style={{
                color:
                  pathname === link.href
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                fontWeight: pathname === link.href ? '500' : '400',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/sign-in"
            className="text-sm transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Sign in
          </Link>
          <Link
            to="/request-access"
            className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-label="Request pilot access to MENDguild"
          >
            Request Access
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span
            className="block h-px w-5 transition-transform"
            style={{
              backgroundColor: 'var(--color-text-primary)',
              transform: menuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="block h-px w-5 transition-opacity"
            style={{
              backgroundColor: 'var(--color-text-primary)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block h-px w-5 transition-transform"
            style={{
              backgroundColor: 'var(--color-text-primary)',
              transform: menuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t px-6 py-4 md:hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/request-access"
                className="block rounded px-4 py-2.5 text-center text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onClick={() => setMenuOpen(false)}
              >
                Request Access
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
