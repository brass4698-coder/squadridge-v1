import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { RoleKey } from '../../types/roles';
import { ROLE_LABELS } from '../../types/roles';
import { getDemoRoleOverride } from '../../demo/demoRoleSwitcher';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const iconDash = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const iconChat = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const iconPeople = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const iconLedger = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const iconSettings = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const NAV_BY_ROLE: Record<RoleKey | 'ops_moderator', NavItem[]> = {
  facilitator: [
    { label: 'Dashboard', href: '/app/facilitator', icon: iconDash },
    { label: 'Sessions', href: '/sessions', icon: iconChat },
    { label: 'Live control', href: '/sessions', icon: iconPeople },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  mediator: [
    { label: 'Matters', href: '/app/mediator', icon: iconDash },
    { label: 'Sessions', href: '/sessions', icon: iconChat },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  participant: [
    { label: 'Home', href: '/app/participant', icon: iconDash },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  observer: [
    { label: 'Outcomes', href: '/app/observer', icon: iconDash },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  analyst: [
    { label: 'Metrics', href: '/app/analyst', icon: iconDash },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  institution_admin: [
    { label: 'Institution', href: '/app/institution', icon: iconDash },
    { label: 'Ledger', href: '/ledger', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  super_admin: [
    { label: 'Admin', href: '/app/admin', icon: iconDash },
    { label: 'Facilitator', href: '/app/facilitator', icon: iconChat },
    { label: 'Ops', href: '/admin/rooms', icon: iconPeople },
    { label: 'Demo catalog', href: '/app/demo/catalog', icon: iconLedger },
    { label: 'Settings', href: '/settings', icon: iconSettings },
  ],
  ops_moderator: [
    { label: 'Ops rooms', href: '/admin/rooms', icon: iconDash },
    { label: 'Health', href: '/admin/health', icon: iconChat },
    { label: 'Reports', href: '/admin/reports', icon: iconPeople },
  ],
};

export type ShellRole = RoleKey | 'ops_moderator' | 'admin';

interface AuthenticatedShellProps {
  children?: ReactNode;
  role?: ShellRole;
}

function resolveRole(role: ShellRole): RoleKey | 'ops_moderator' {
  if (role === 'admin') return 'ops_moderator';
  const demo = getDemoRoleOverride();
  if (demo) return demo;
  return role;
}

export function AuthenticatedShell({ children, role = 'facilitator' }: AuthenticatedShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const resolved = resolveRole(role);
  const nav = NAV_BY_ROLE[resolved] ?? NAV_BY_ROLE.facilitator;
  const badgeLabel =
    resolved === 'ops_moderator'
      ? 'Ops moderator'
      : (ROLE_LABELS[resolved as RoleKey] ?? 'Workspace');

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'text-[var(--color-accent)] bg-[var(--color-accent-light)]'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]',
    ].join(' ');

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <aside
        className={[
          'flex h-full shrink-0 flex-col border-r transition-all duration-200',
          sidebarOpen ? 'w-56' : 'w-14',
        ].join(' ')}
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
        aria-label="Main navigation"
      >
        <div
          className="flex h-14 shrink-0 items-center justify-between border-b px-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {sidebarOpen && (
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              SquadRidge
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-auto rounded p-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {sidebarOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.href + item.label}
              to={item.href}
              className={navLinkClass}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => navigate('/sign-in')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-secondary)' }}
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div
          className="flex h-14 shrink-0 items-center justify-between border-b px-6"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div />
          <span
            className="rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
            }}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="flex-1 p-6">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
