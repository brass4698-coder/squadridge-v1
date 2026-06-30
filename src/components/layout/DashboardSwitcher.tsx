// ============================================================
// DashboardSwitcher — shown only for multi-role users
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { saveLastDashboard } from '../../lib/dashboardRouting';
import { ROLE_DASHBOARD_MAP, ROLE_LABELS, type RoleKey } from '../../types/roles';

export function DashboardSwitcher() {
  const { roles, user } = useAuthContext();
  const navigate = useNavigate();

  const uniqueRoles = Array.from(new Set(roles.map((r) => r.role_key))) as RoleKey[];

  if (uniqueRoles.length <= 1) return null;

  async function switchTo(role: RoleKey) {
    const path = ROLE_DASHBOARD_MAP[role];
    if (user) await saveLastDashboard(user.id, path);
    navigate(path);
  }

  return (
    <div>
      <p className="text-xs text-sq-muted mb-1 font-medium uppercase tracking-wide">Switch Dashboard</p>
      <div className="space-y-0.5">
        {uniqueRoles.map((role) => (
          <button
            key={role}
            onClick={() => void switchTo(role)}
            className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-sq-surface-offset text-sq-muted hover:text-sq-text transition-colors"
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>
    </div>
  );
}
