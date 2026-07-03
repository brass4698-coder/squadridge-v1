// ============================================================
// RoleAwareNav — shows only routes the user can access
// ============================================================
import { NavLink } from 'react-router-dom';
import { useUserRoles } from '../../hooks/useUserRoles';
import type { RoleKey } from '../../types/roles';

interface NavItem {
  label: string;
  path: string;
  roles: RoleKey[];
}

const ALL_ROLES: RoleKey[] = [
  'super_admin',
  'institution_admin',
  'facilitator',
  'mediator',
  'analyst',
  'participant',
  'observer',
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Admin', path: '/app/admin', roles: ['super_admin'] },
  { label: 'Institution', path: '/app/institution', roles: ['institution_admin', 'super_admin'] },
  { label: 'Facilitator', path: '/app/facilitator', roles: ['facilitator', 'super_admin'] },
  { label: 'Mediator', path: '/app/mediator', roles: ['mediator', 'super_admin'] },
  { label: 'Analyst', path: '/app/analyst', roles: ['analyst', 'super_admin'] },
  { label: 'Participant', path: '/app/participant', roles: ['participant', 'super_admin'] },
  { label: 'Observer', path: '/app/observer', roles: ['observer', 'super_admin'] },
  { label: 'Settings', path: '/app/settings', roles: ALL_ROLES },
  { label: 'Profile', path: '/app/profile', roles: ALL_ROLES },
];

export function RoleAwareNav() {
  const { hasAnyRole } = useUserRoles();

  const visible = NAV_ITEMS.filter((item) => hasAnyRole(item.roles));

  return (
    <nav aria-label="Main navigation">
      <ul className="space-y-0.5">
        {visible.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sq-primary-highlight text-sq-primary font-medium'
                    : 'text-sq-muted hover:bg-sq-surface-offset hover:text-sq-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
