import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoUser } from '../../lib/demoLogin';
import { ROLE_DASHBOARD_MAP, ROLE_LABELS, type RoleKey } from '../../types/roles';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import {
  WORKSPACE_ROLE_LABEL,
  workspaceRoleFromPath,
  type WorkspaceRoleAccent,
} from '../../lib/workspaceRole';
import { cn } from '../../lib/cn';

type DemoSwitcherRole = RoleKey | 'moderator';

const DEMO_ROLES: {
  id: DemoSwitcherRole;
  label: string;
  path: string;
  accent: WorkspaceRoleAccent;
}[] = [
  {
    id: 'facilitator',
    label: ROLE_LABELS.facilitator,
    path: '/app/facilitator',
    accent: 'facilitator',
  },
  {
    id: 'participant',
    label: ROLE_LABELS.participant,
    path: '/app/participant',
    accent: 'participant',
  },
  {
    id: 'moderator',
    label: WORKSPACE_ROLE_LABEL.moderator,
    path: '/app/moderator',
    accent: 'moderator',
  },
  {
    id: 'institution_admin',
    label: 'Program lead',
    path: '/app/institution',
    accent: 'facilitator',
  },
  { id: 'mediator', label: 'Inquiry (ombuds)', path: '/app/mediator', accent: 'mediator' },
  { id: 'observer', label: 'Executive', path: '/app/executive', accent: 'mediator' },
];

function pathForRole(role: DemoSwitcherRole): string {
  if (role === 'moderator') return '/app/moderator';
  if (role === 'observer') return '/app/executive';
  if (role === 'institution_admin') return '/app/institution';
  return ROLE_DASHBOARD_MAP[role] ?? '/app';
}

/**
 * Demo-only role + scenario switcher for governance walkthroughs.
 */
export function DemoRoleSwitcher() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { presetId, setPresetId, presets } = useDemoGovernance();
  const accent = workspaceRoleFromPath(location.pathname);

  if (!isDemoUser(session)) return null;

  const selected =
    DEMO_ROLES.find((r) => location.pathname.startsWith(r.path.replace(/\?.*/, '')))?.id ??
    (accent === 'moderator'
      ? 'moderator'
      : accent === 'participant'
        ? 'participant'
        : accent === 'mediator'
          ? 'mediator'
          : 'facilitator');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="demo-role-switch">
        Demo role
      </label>
      <select
        id="demo-role-switch"
        className={cn(
          'rounded-sm border bg-surface-elevated px-2 py-1 text-xs font-medium text-ink',
          accent ? `sr-chip-role-${accent}` : 'border-line',
        )}
        value={selected}
        onChange={(e) => {
          const role = e.target.value as DemoSwitcherRole;
          navigate(pathForRole(role));
        }}
      >
        {DEMO_ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="demo-preset-switch">
        Demo scenario
      </label>
      <select
        id="demo-preset-switch"
        className="rounded-sm border border-line bg-surface-elevated px-2 py-1 text-xs text-ink"
        value={presetId}
        onChange={(e) => setPresetId(e.target.value as typeof presetId)}
      >
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
