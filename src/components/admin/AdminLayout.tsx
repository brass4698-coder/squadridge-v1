import { NavLink, Outlet } from 'react-router-dom';
import { getPilotSurfaceConfig } from '../../lib/env';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 font-sans text-[0.85rem] font-medium ${
    isActive
      ? 'bg-white/[0.08] text-slate-100'
      : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
  }`;

/**
 * Staff-only shell: search/filter patterns are per-page; nav links share RBAC (RequireModerator).
 */
export function AdminLayout() {
  const pilot = getPilotSurfaceConfig();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-gutter py-8">
      {pilot.zkStubExplicit ? (
        <div
          role="alert"
          className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 font-sans text-[0.85rem] text-amber-light"
        >
          Demo verification crypto (<code className="text-amber">VITE_ZK_STUB</code>) is active — do
          not treat verification states here as production Semaphore proofs for diligence or pilots.
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <nav className="shrink-0 lg:w-52" aria-label="Admin">
          <p className="mb-2 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-amber/90">
            Operator
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/admin/reports" className={itemClass}>
                Reports
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/verification" className={itemClass}>
                Verification
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/rooms" className={itemClass}>
                Rooms
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/csi" className={itemClass}>
                CSI
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/metrics" className={itemClass}>
                Metrics
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/logs" className={itemClass}>
                Audit log
              </NavLink>
            </li>
          </ul>
          {/* Internal tools — not a product surface; kept off the public IA on purpose. */}
          <p className="mb-2 mt-6 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
            Internal tools
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/admin/demo-hub" className={itemClass}>
                Demo command center
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/demo" className={itemClass}>
                Demo controls
              </NavLink>
            </li>
            <li>
              <NavLink to="/pitch-deck-hub" className={itemClass}>
                Pitch deck hub
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/health" className={itemClass}>
                Supabase health
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
