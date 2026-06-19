import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard',   href: '/dashboard',          icon: 'grid' },
  { label: 'Sessions',    href: '/sessions',            icon: 'layers' },
  { label: 'Participants',href: '/participants',         icon: 'users' },
  { label: 'Ledger',      href: '/ledger',              icon: 'book-open' },
  { label: 'Settings',    href: '/settings',            icon: 'settings' },
];

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid:       'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
    layers:     'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    users:      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    'book-open':'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    settings:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v6m0-18v3M4.22 10.22l2.12 2.12M17.66 6.34l-2.12 2.12M2 12h3m14 0h3M4.22 13.78l2.12-2.12M17.66 17.66l-2.12-2.12',
    menu:       'M3 12h18M3 6h18M3 18h18',
    x:          'M18 6L6 18M6 6l12 12',
    'log-out':  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    plus:       'M12 5v14M5 12h14',
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name] ?? ''} />
    </svg>
  );
}

export function AuthenticatedShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth() as any;
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut?.();
    navigate('/');
  }

  const Sidebar = (
    <aside
      className="flex h-full w-56 flex-col border-r"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center border-b px-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Link
          to="/"
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SquadRidge
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Application navigation" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                    isActive ? 'font-medium' : ''
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                })}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* New session CTA */}
      <div className="px-3 pb-3">
        <Link
          to="/sessions/new"
          className="flex w-full items-center justify-center gap-2 rounded py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Icon name="plus" />
          New Session
        </Link>
      </div>

      {/* User / sign out */}
      <div
        className="flex items-center justify-between border-t px-4 py-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="overflow-hidden">
          <p
            className="truncate text-xs font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {(user as any)?.user_metadata?.full_name ?? 'Account'}
          </p>
          <p
            className="truncate text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {(user as any)?.email ?? ''}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-2 shrink-0 p-1 transition-opacity hover:opacity-60"
          aria-label="Sign out"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Icon name="log-out" />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col">{Sidebar}</div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        />
      )}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 md:hidden">{Sidebar}</div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div
          className="flex h-14 items-center justify-between border-b px-4 md:hidden"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Link
            to="/"
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SquadRidge
          </Link>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Icon name={sidebarOpen ? 'x' : 'menu'} />
          </button>
        </div>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
