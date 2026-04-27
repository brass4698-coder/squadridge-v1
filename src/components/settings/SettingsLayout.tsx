import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-[44px] items-center border-b-2 px-1 pb-2 pt-1 font-sans text-[0.85rem] font-medium transition-colors ${
    isActive
      ? 'border-teal text-slate-100'
      : 'border-transparent text-slate-500 hover:border-white/10 hover:text-slate-300'
  }`;

/**
 * Sub-navigation for account settings: profile, safety, notifications (placeholder).
 */
export function SettingsLayout() {
  return (
    <div className="mx-auto w-full max-w-3xl px-gutter py-8">
      <h1 className="font-heading text-fluid-h2 text-gray-light">Settings</h1>
      <p className="mt-1 font-sans text-[0.9rem] text-slate-500">
        Account, trust, and safety. Set your perspective and matching context on{' '}
        <span className="text-slate-400">/find-squad</span> before you join the queue.
      </p>
      <nav
        className="mb-8 mt-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-white/[0.08]"
        aria-label="Settings sections"
      >
        <NavLink to="/settings" end className={tabClass}>
          Overview
        </NavLink>
        <NavLink to="/settings/profile" className={tabClass}>
          Profile &amp; keys
        </NavLink>
        <NavLink to="/settings/safety" className={tabClass}>
          Safety center
        </NavLink>
        <span
          className="inline-flex min-h-[44px] cursor-not-allowed items-center border-b-2 border-transparent px-1 pb-2 pt-1 font-sans text-[0.85rem] font-medium text-slate-600"
          title="Coming soon"
        >
          Notifications
        </span>
      </nav>
      <Outlet />
    </div>
  );
}
