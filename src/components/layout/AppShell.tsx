// ============================================================
// AppShell — authenticated app wrapper with sidebar nav
// ============================================================
import React, { type ReactNode } from 'react';
import { RoleAwareNav } from './RoleAwareNav';
import { DashboardSwitcher } from './DashboardSwitcher';
import { useAuthContext } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { profile, signOut } = useAuthContext();

  return (
    <div className="flex min-h-screen bg-sq-bg text-sq-text">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-sq-border bg-sq-surface flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-sq-border">
          <span className="font-semibold text-sq-text">MENDguild</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          <RoleAwareNav />
        </div>

        {/* Bottom: switcher + profile + signout */}
        <div className="border-t border-sq-border p-3 space-y-2">
          <DashboardSwitcher />
          <div className="text-xs text-sq-muted truncate">{profile?.email}</div>
          <button
            onClick={() => void signOut()}
            className="text-xs text-sq-muted hover:text-sq-error transition-colors w-full text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
