/**
 * Visual role accents for operational dashboards (orthogonal to room/gate/ledger modes).
 * Map product roles + demo “moderator” safety lane to CSS data attributes / classes.
 */

export type WorkspaceRoleAccent = 'facilitator' | 'participant' | 'moderator' | 'mediator';

export const WORKSPACE_ROLE_LABEL: Record<WorkspaceRoleAccent, string> = {
  facilitator: 'Facilitator',
  participant: 'Participant',
  moderator: 'Moderator',
  mediator: 'Mediator',
};

/** Path → accent used by shell + tour. */
export function workspaceRoleFromPath(pathname: string): WorkspaceRoleAccent | null {
  if (pathname.startsWith('/app/participant')) return 'participant';
  if (
    pathname.startsWith('/app/moderator') ||
    pathname.startsWith('/admin/rooms') ||
    pathname === '/mod'
  ) {
    return 'moderator';
  }
  if (pathname.startsWith('/app/mediator') || pathname.startsWith('/app/ombuds')) return 'mediator';
  if (
    pathname === '/app' ||
    pathname.startsWith('/app/facilitator') ||
    pathname.startsWith('/app/sessions') ||
    pathname.startsWith('/app/release-gate') ||
    pathname.startsWith('/app/participants') ||
    pathname.startsWith('/app/pilot-guide')
  ) {
    return 'facilitator';
  }
  return null;
}

export function roleFrameClass(role: WorkspaceRoleAccent): string {
  return `sr-role-frame sr-role-${role}`;
}
