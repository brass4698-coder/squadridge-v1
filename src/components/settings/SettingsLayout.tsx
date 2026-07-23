import { NavLink, Outlet } from 'react-router-dom';
import { appRoutes } from '../../lib/appRoutes';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-[44px] items-center border-b-2 px-1 pb-2 pt-1 text-sm font-medium transition-colors ${
    isActive
      ? 'border-brand text-ink'
      : 'border-transparent text-ink-faint hover:border-line hover:text-ink-secondary'
  }`;

const base = appRoutes.settings;

/** Tab bar + outlet for account settings — stays inside AuthenticatedShell. */
export function SettingsLayout() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-h2 font-medium text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Account, trust, and notification preferences for your governed workspace.
      </p>
      <nav
        className="mb-8 mt-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line"
        aria-label="Settings sections"
      >
        <NavLink to={base} end className={tabClass}>
          Overview
        </NavLink>
        <NavLink to={`${base}/profile`} className={tabClass}>
          Profile &amp; keys
        </NavLink>
        <NavLink to={`${base}/safety`} className={tabClass}>
          Safety center
        </NavLink>
        <NavLink to={`${base}/notifications`} className={tabClass}>
          Notifications
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
