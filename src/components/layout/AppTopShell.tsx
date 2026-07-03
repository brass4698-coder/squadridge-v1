// ============================================================
// AppTopShell (Phase 5)
//
// Dark, frosted top-nav shell for authenticated pages that aren't part of
// the facilitator sidebar app (currently: /decks). Distinct from:
//   - PublicShell (light, marketing)
//   - AuthenticatedShell (dark, facilitator sidebar + main content)
//
// Renders:
//   - DemoBanner at the very top (only visible for the demo user)
//   - Frosted sticky nav with SquadRidge wordmark, primary links, avatar
//     dropdown / sign-in button
//   - <Outlet /> or {children} for the page body
// ============================================================
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { DemoBanner } from '../demo/DemoBanner';
import { UserAvatarMenu } from './UserAvatarMenu';
import { useAuth } from '../../contexts/AuthContext';

interface AppTopShellProps {
  /** Optional page content. When omitted the shell renders `<Outlet />`. */
  children?: ReactNode;
}

const NAV = [
  { label: 'Decks', href: '/decks', authOnly: true },
  { label: 'Ledger', href: '/ledger', authOnly: false },
  { label: 'How it works', href: '/how-it-works', authOnly: false },
  { label: 'Security', href: '/security', authOnly: false },
];

export function AppTopShell({ children }: AppTopShellProps) {
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = NAV.filter((item) => !item.authOnly || Boolean(session));

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--sr-bg)' }}>
      <DemoBanner />

      <header className="nav-frosted sticky top-0 z-40" data-scrolled={scrolled ? 'true' : 'false'}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--sr-primary), var(--sr-primary-pressed))',
                color: 'var(--sr-on-primary)',
              }}
            >
              SR
            </span>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'var(--sr-ink)' }}
            >
              SquadRidge
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  'rounded-full px-3 py-1.5 text-sm transition-colors ' +
                  (isActive
                    ? 'font-medium text-[var(--sr-ink)]'
                    : 'font-normal text-[var(--sr-ink-secondary)] hover:text-[var(--sr-ink)]')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!session ? (
              <Link to="/request-access" className="btn-pill btn-pill--primary text-sm">
                Request access
              </Link>
            ) : null}
            <UserAvatarMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">{children ?? <Outlet />}</main>
    </div>
  );
}
