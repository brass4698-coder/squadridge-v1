import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoUser } from '../../lib/demoLogin';
import { ROLE_DASHBOARD_MAP, ROLE_LABELS, type RoleKey } from '../../types/roles';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';

const DEMO_ROLES: RoleKey[] = [
  'facilitator',
  'participant',
  'institution_admin',
  'mediator',
  'observer',
];

/**
 * Demo-only role + scenario switcher for governance walkthroughs.
 */
export function DemoRoleSwitcher() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { presetId, setPresetId, presets } = useDemoGovernance();

  if (!isDemoUser(session)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="demo-role-switch">
        Demo role
      </label>
      <select
        id="demo-role-switch"
        className="rounded-sm border border-line bg-surface-elevated px-2 py-1 text-xs text-ink"
        defaultValue="facilitator"
        onChange={(e) => {
          const role = e.target.value as RoleKey;
          const path =
            role === 'observer'
              ? '/app/executive'
              : role === 'institution_admin'
                ? '/app/institution'
                : (ROLE_DASHBOARD_MAP[role] ?? '/app');
          navigate(path);
        }}
      >
        {DEMO_ROLES.map((r) => (
          <option key={r} value={r}>
            {r === 'mediator'
              ? 'Inquiry (ombuds)'
              : r === 'observer'
                ? 'Executive'
                : r === 'institution_admin'
                  ? 'Program lead'
                  : ROLE_LABELS[r]}
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
