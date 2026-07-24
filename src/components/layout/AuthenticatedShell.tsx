import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appRoutes } from '../../lib/appRoutes';
import { getHighestPriorityRole, hasAnyRole } from '../../lib/roles';
import { ROLE_LABELS, type RoleKey } from '../../types/roles';
import { isDemoUser } from '../../lib/demoLogin';
import { workspaceRoleFromPath } from '../../lib/workspaceRole';
import { DemoBanner } from '../demo/DemoBanner';
import { DemoLayout } from '../../demo/DemoLayout';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';
import { DemoGovernanceProvider } from '../../demo/DemoGovernanceContext';
import { SquadLogo } from '../SquadLogo';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { UserAvatarMenu } from './UserAvatarMenu';
import {
  DemoModePill,
  MatterChip,
  RoleChip,
  ShellContextProvider,
  StateChip,
  useShellContext,
} from '../shell';
import { DemoRoleSwitcher } from '../shell/DemoRoleSwitcher';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  demoId?: string;
}

function IconGrid() {
  return (
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
}

function IconRooms() {
  return (
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
}

function IconPeople() {
  return (
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
}

function IconGate() {
  return (
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconLedger() {
  return (
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
    </svg>
  );
}

function IconInsights() {
  return (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconSettings() {
  return (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function overviewHref(role: RoleKey | null): string {
  if (!role) return appRoutes.dashboard;
  if (role === 'facilitator') return appRoutes.facilitator;
  if (role === 'participant') return '/app/participant';
  if (role === 'institution_admin') return '/app/institution';
  if (role === 'mediator') return '/app/mediator';
  if (role === 'observer') return '/app/executive';
  if (role === 'super_admin') return '/app/admin';
  if (role === 'analyst') return '/app/analyst';
  return appRoutes.dashboard;
}

function buildNav(role: RoleKey | null, isAdmin: boolean): NavItem[] {
  const overview = overviewHref(role);
  const items: NavItem[] = [{ label: 'Overview', href: overview, icon: <IconGrid /> }];

  if (role === 'participant') {
    items.push(
      { label: 'My rooms', href: '/app/participant', icon: <IconRooms /> },
      { label: 'Release drafts', href: '/app/participant#drafts', icon: <IconGate /> },
      { label: 'Published records', href: appRoutes.appLedger, icon: <IconLedger /> },
      { label: 'Settings', href: appRoutes.settings, icon: <IconSettings /> },
    );
    return items;
  }

  if (role === 'observer') {
    items.push(
      { label: 'Governance', href: '/app/executive', icon: <IconGrid /> },
      { label: 'Published records', href: appRoutes.appLedger, icon: <IconLedger /> },
      { label: 'Settings', href: appRoutes.settings, icon: <IconSettings /> },
    );
    return items;
  }

  if (role === 'institution_admin' || role === 'super_admin') {
    items.push(
      { label: 'Rooms / matters', href: appRoutes.sessions, icon: <IconRooms /> },
      { label: 'Release gate', href: appRoutes.releaseGate, icon: <IconGate /> },
      { label: 'Published records', href: appRoutes.appLedger, icon: <IconLedger /> },
      { label: 'Insights', href: appRoutes.insights, icon: <IconInsights /> },
      { label: 'Settings', href: appRoutes.settings, icon: <IconSettings /> },
    );
    if (isAdmin) {
      items.push({
        label: 'Invites',
        href: '/app/admin/invites',
        icon: <IconPeople />,
      });
    }
    return items;
  }

  if (role === 'analyst') {
    items.push(
      { label: 'Insights', href: appRoutes.insights, icon: <IconInsights /> },
      { label: 'Published records', href: appRoutes.appLedger, icon: <IconLedger /> },
      { label: 'Settings', href: appRoutes.settings, icon: <IconSettings /> },
    );
    return items;
  }

  // facilitator / mediator default operational nav
  items.push(
    {
      label: 'Rooms / sessions',
      href: appRoutes.sessions,
      icon: <IconRooms />,
      demoId: 'nav-sessions',
    },
    { label: 'Pilot guide', href: appRoutes.pilotGuide, icon: <IconInsights /> },
    { label: 'Participants / parties', href: appRoutes.participants, icon: <IconPeople /> },
    { label: 'Release gate', href: appRoutes.releaseGate, icon: <IconGate /> },
    { label: 'Published records', href: appRoutes.appLedger, icon: <IconLedger /> },
    { label: 'Insights', href: appRoutes.insights, icon: <IconInsights /> },
    { label: 'Settings', href: appRoutes.settings, icon: <IconSettings /> },
  );
  if (isAdmin) {
    items.push({ label: 'Invites', href: '/app/admin/invites', icon: <IconPeople /> });
  }
  return items;
}

function ShellHeaderBar() {
  const { session, roles } = useAuth();
  const shell = useShellContext();
  const location = useLocation();
  const best = getHighestPriorityRole(roles);
  const roleLabel = shell.roleLabel || (best ? ROLE_LABELS[best] : 'Member');
  const demo = isDemoUser(session);
  const roleAccent = workspaceRoleFromPath(location.pathname);

  return (
    <div className="flex h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-elevated/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {demo ? <DemoModePill /> : null}
        <RoleChip label={roleLabel} accent={roleAccent} />
        {shell.matterLabel ? <MatterChip label={shell.matterLabel} /> : null}
        <StateChip label={shell.stateLabel} />
        {shell.lastUpdated ? (
          <span className="hidden text-xs text-ink-faint lg:inline">
            Updated {shell.lastUpdated}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {demo ? <DemoRoleSwitcher /> : null}
        {shell.primaryAction ? (
          <Link
            to={shell.primaryAction.href}
            className="hidden rounded-[var(--sr-radius-md)] border border-brand/40 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand no-underline sm:inline-flex"
          >
            {shell.primaryAction.label}
          </Link>
        ) : null}
        <UserAvatarMenu />
      </div>
    </div>
  );
}

interface AuthenticatedShellProps {
  children: ReactNode;
  role?: 'facilitator' | 'admin';
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, roles } = useAuth();
  const { showDemoChrome } = useDemoWalkthrough();
  const best = getHighestPriorityRole(roles);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/sign-in?reason=signed-out', { replace: true });
  }, [navigate, signOut]);

  const isAdmin = hasAnyRole(roles, ['super_admin', 'institution_admin']);
  const navItems = useMemo(() => buildNav(best, isAdmin), [best, isAdmin]);

  const surfaceClass = (() => {
    if (location.pathname.includes('release-gate') || location.pathname.includes('/release')) {
      return 'sr-surface-gate';
    }
    if (location.pathname.includes('ledger')) return 'sr-surface-record';
    if (location.pathname.includes('institution') || location.pathname.includes('executive')) {
      return 'sr-surface-portfolio';
    }
    return 'sr-surface-room';
  })();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-soft text-brand'
        : 'text-ink-secondary hover:bg-surface-elevated hover:text-ink',
    ].join(' ');

  return (
    <DemoGovernanceProvider>
      <ShellContextProvider>
        <DemoLayout>
          <div className="flex h-screen overflow-hidden bg-surface sr-shell-main">
            <aside
              className={[
                'sr-shell-sidebar m-2 flex h-[calc(100%-1rem)] shrink-0 flex-col rounded-[var(--sr-radius-xl)] border border-line transition-all duration-200',
                sidebarOpen ? 'w-56' : 'w-14',
              ].join(' ')}
              aria-label="Main navigation"
            >
              <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
                {sidebarOpen ? (
                  <>
                    <span className="inline-flex min-w-0 flex-1 items-center text-ink" aria-hidden>
                      <SquadRidgeLockup size="sm" showTagline={false} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ink-secondary transition-opacity hover:opacity-70"
                      aria-label="Collapse sidebar"
                    >
                      <span aria-hidden>×</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="mx-auto inline-flex size-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                    aria-label="Expand sidebar"
                  >
                    <SquadLogo size={28} aria-hidden />
                  </button>
                )}
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                {navItems.map((item) => (
                  <NavLink
                    key={`${item.label}-${item.href}`}
                    to={item.href}
                    className={navLinkClass}
                    title={!sidebarOpen ? item.label : undefined}
                    end={item.href === '/app' || item.href === overviewHref(best)}
                    data-demo={item.demoId}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen ? <span>{item.label}</span> : null}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-line p-3">
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary transition-opacity hover:opacity-70"
                >
                  {sidebarOpen ? <span>Sign out</span> : <span aria-label="Sign out">⎋</span>}
                </button>
              </div>
            </aside>

            <main
              className="sr-shell-panel m-2 ml-0 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-surface-secondary"
              data-scroll-root
            >
              <DemoBanner />
              <ShellHeaderBar />
              <div
                className={`flex-1 p-6 ${surfaceClass} ${showDemoChrome ? 'pb-28' : ''}`}
                data-surface={
                  surfaceClass.includes('gate')
                    ? 'gate'
                    : surfaceClass.includes('record')
                      ? 'record'
                      : surfaceClass.includes('portfolio')
                        ? 'portfolio'
                        : 'room'
                }
              >
                {children ?? <Outlet />}
              </div>
            </main>
          </div>
        </DemoLayout>
      </ShellContextProvider>
    </DemoGovernanceProvider>
  );
}
