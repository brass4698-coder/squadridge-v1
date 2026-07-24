import { Link } from 'react-router-dom';
import { ROLE_DASHBOARD_MAP, ROLE_LABELS, ROLE_PRIORITY, type RoleKey } from '../../types/roles';
import {
  clearDemoRoleOverride,
  getDemoRoleOverride,
  setDemoRoleOverride,
} from '../../demo/demoRoleSwitcher';
import { useState } from 'react';
import { isDemoSquadShortcutsEnabled } from '../../lib';

type CatalogEntry = {
  label: string;
  href: string;
  group: string;
  note?: string;
};

const CATALOG: CatalogEntry[] = [
  { group: 'Marketing', label: 'Landing', href: '/' },
  { group: 'Marketing', label: 'How it works', href: '/how-it-works' },
  { group: 'Marketing', label: 'Security', href: '/security' },
  { group: 'Marketing', label: 'Request access', href: '/request-access' },
  { group: 'Marketing', label: 'Ledger index', href: '/ledger' },
  { group: 'Role workspaces', label: 'Facilitator', href: '/app/facilitator' },
  { group: 'Role workspaces', label: 'Mediator', href: '/app/mediator' },
  { group: 'Role workspaces', label: 'Participant', href: '/app/participant' },
  { group: 'Role workspaces', label: 'Observer', href: '/app/observer' },
  { group: 'Role workspaces', label: 'Analyst', href: '/app/analyst' },
  { group: 'Role workspaces', label: 'Institution', href: '/app/institution' },
  { group: 'Role workspaces', label: 'Super admin', href: '/app/admin' },
  { group: 'Facilitator', label: 'Dashboard', href: '/dashboard' },
  { group: 'Facilitator', label: 'Sessions', href: '/sessions' },
  { group: 'Facilitator', label: 'Session control', href: '/sessions/sess-001/control' },
  { group: 'Facilitator', label: 'Outcome release', href: '/sessions/sess-001/release' },
  { group: 'Participant', label: 'Invite acceptance', href: '/p/invite/demo-token' },
  { group: 'Participant', label: 'Room (Slow down)', href: '/p/room/demo-token' },
  { group: 'Participant', label: 'Waiting room', href: '/p/waiting/demo-token' },
  { group: 'Ops', label: 'Admin rooms', href: '/admin/rooms' },
  { group: 'Ops', label: 'Health probes', href: '/admin/health' },
  { group: 'Ops', label: 'CSI', href: '/admin/csi' },
  {
    group: 'Demo',
    label: 'Cinematic full-flow simulation',
    href: '/demo/simulation',
    note: 'Role → access → room → assist → public ledger + private proposal',
  },
  {
    group: 'Demo',
    label: 'Offline squad demo',
    href: '/session/demo-session-001',
    note: 'Requires demo flag',
  },
  { group: 'UI primitives', label: 'StatusBadge (in dashboards)', href: '/dashboard' },
  { group: 'UI primitives', label: 'ConfirmModal / Slow down overlay', href: '/p/room/demo-token' },
];

/**
 * Auth-gated / DEV demo catalog — illustrative surfaces for diligence.
 * Route is RoleProtectedRoute(super_admin) + empty roles allowed in DEV/demo.
 * Never implies production identity impersonation.
 */
export function DemoCatalogPage() {
  const [role, setRole] = useState<RoleKey | null>(() => getDemoRoleOverride());
  const demoEnabled = isDemoSquadShortcutsEnabled();

  function applyRole(next: RoleKey | '') {
    if (!next) {
      clearDemoRoleOverride();
      setRole(null);
      return;
    }
    setDemoRoleOverride(next);
    setRole(next);
  }

  if (!demoEnabled) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Demo catalog unavailable
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Enable `VITE_ENABLE_DEMO_SQUAD` in non-production environments, or use local DEV. Catalog
          is also gated to super_admin (or empty roles in DEV).
        </p>
      </div>
    );
  }

  const groups = [...new Set(CATALOG.map((c) => c.group))];

  return (
    <div className="mx-auto max-w-3xl" data-testid="demo-catalog">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-accent)' }}
      >
        Illustrative · Demo only
      </p>
      <h1
        className="mt-2 text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Demo catalog
      </h1>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        Reach marketing pages, role dashboards, facilitator flows, participant token paths, admin
        ops, and UI surfaces. Fixtures are illustrative — not production claims. CI keeps demo
        decoys out of release artifacts.
      </p>

      <section
        className="mt-8 rounded-lg border px-5 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        aria-labelledby="demo-role-switcher"
      >
        <h2
          id="demo-role-switcher"
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Demo role switcher
        </h2>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Session-only flag (`sessionStorage`). Does not mutate `user_roles`.
        </p>
        <label className="mt-3 block text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Impersonate workspace chrome
          <select
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
            }}
            value={role ?? ''}
            onChange={(e) => applyRole(e.target.value as RoleKey | '')}
            data-testid="demo-role-select"
          >
            <option value="">None (use real role)</option>
            {ROLE_PRIORITY.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <ul className="mt-4 flex flex-wrap gap-2">
          {ROLE_PRIORITY.map((r) => (
            <li key={r}>
              <Link
                to={ROLE_DASHBOARD_MAP[r]}
                className="rounded border px-2.5 py-1 text-xs"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Open {ROLE_LABELS[r]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {groups.map((group) => (
        <section key={group} className="mt-8">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {group}
          </h2>
          <ul className="mt-3 space-y-2">
            {CATALOG.filter((c) => c.group === group).map((entry) => (
              <li key={entry.href + entry.label}>
                <Link
                  to={entry.href}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span className="font-medium">{entry.label}</span>
                  <span
                    className="font-mono text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {entry.href}
                  </span>
                  {entry.note ? (
                    <span
                      className="w-full text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {entry.note}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-8 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Tip: open{' '}
        <Link to="/demo/simulation" className="underline-offset-2 hover:underline">
          /demo/simulation
        </Link>{' '}
        for the cinematic full flow, or append <code>?demo=1</code> to enter the existing
        walkthrough where scripted.
      </p>
    </div>
  );
}
