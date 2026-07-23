import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const publicNav = [
  { label: 'How it works', href: '/how-it-works', homeAnchor: '#how-it-works' },
  { label: 'Security', href: '/security' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Ledger', href: '/ledger' },
] as const;

const homeJump = [
  { label: 'Zero Knowledge', href: '/#zero-knowledge' },
  { label: 'Room & record', href: '/#room-and-record' },
  { label: 'Demo paths', href: '/#demo' },
  { label: 'Pilot', href: '/#pilot' },
] as const;

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
  { label: 'Demo walkthrough', href: '/?demo=1' },
];

/**
 * Public marketing shell — smart sticky header, mobile nav, honest footer.
 */
export function PublicShell({ children }: { children?: ReactNode }) {
  const [condensed, setCondensed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const reduce = useReducedMotion();
  const menuId = useId();
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:px-3 focus:py-2 focus:text-sm"
        style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
      >
        Skip to content
      </a>

      <header
        className="sticky top-0 z-40 border-b transition-[height,box-shadow,background-color] duration-300"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: condensed
            ? 'color-mix(in oklab, var(--color-surface) 92%, transparent)'
            : 'var(--color-surface)',
          backdropFilter: condensed ? 'blur(10px)' : undefined,
          boxShadow: condensed
            ? '0 1px 0 color-mix(in oklab, var(--color-border) 80%, transparent)'
            : 'none',
        }}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-[height] duration-300 ${
            condensed ? 'h-12' : 'h-14'
          }`}
        >
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SquadRidge
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Public navigation">
            {publicNav.map((item) => {
              const useHash = onHome && 'homeAnchor' in item && item.homeAnchor;
              if (useHash) {
                return (
                  <a
                    key={item.href}
                    href={item.homeAnchor}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
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
              );
            })}
            {onHome
              ? homeJump.slice(0, 2).map((item) => (
                  <a
                    key={item.href}
                    href={item.href.replace(/^\//, '')}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.label}
                  </a>
                ))
              : null}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/?demo=1"
              className="hidden text-sm transition-opacity hover:opacity-70 sm:inline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Demo
            </Link>
            <Link
              to="/sign-in"
              className="hidden text-sm transition-opacity hover:opacity-70 sm:inline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign in
            </Link>
            <Link
              to="/request-access"
              className="rounded px-3 py-2 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] sm:px-4"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Request access
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded border lg:hidden"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
              }}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span aria-hidden className="text-lg leading-none">
                {mobileOpen ? '×' : '☰'}
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              id={menuId}
              key="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="border-t lg:hidden"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
                {[
                  ...publicNav.map((n) => ({ label: n.label, href: n.href })),
                  ...homeJump,
                  { label: 'Demo walkthrough', href: '/?demo=1' },
                  { label: 'Sign in', href: '/sign-in' },
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    to={item.href}
                    className="rounded px-2 py-3 text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="main-content" className="flex-1">
        {children ?? <Outlet />}
      </main>

      <footer
        className="border-t px-6 py-12"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p
                className="mb-2 text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                SquadRidge
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Zero‑Knowledge Harmony Rooms for high-stakes organizational truce. The room stays
                private; only approved outcomes become a verifiable record.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.href + item.label}
                  to={item.href}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div
            className="flex flex-col gap-1 border-t pt-6"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              &copy; {new Date().getFullYear()} SquadRidge. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Session room content is private. Only approved outcomes are published. Anonymity is
              not guaranteed; room-level E2EE is on the roadmap—see{' '}
              <Link
                to="/security"
                className="underline-offset-2 hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Security
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
