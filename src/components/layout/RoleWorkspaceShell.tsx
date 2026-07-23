import { AuthenticatedShell } from './AuthenticatedShell';
import { useUserRoles } from '../../hooks/useUserRoles';
import { getDemoRoleOverride } from '../../demo/demoRoleSwitcher';

/** Layout outlet shell that prefers demo role override, then highest assigned role. */
export function RoleWorkspaceShell() {
  const { highestRole } = useUserRoles();
  const demo = getDemoRoleOverride();
  const role = demo ?? highestRole ?? 'facilitator';
  return <AuthenticatedShell role={role} />;
}
