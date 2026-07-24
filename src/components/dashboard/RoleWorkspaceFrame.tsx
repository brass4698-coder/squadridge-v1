import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  WORKSPACE_ROLE_LABEL,
  roleFrameClass,
  type WorkspaceRoleAccent,
} from '../../lib/workspaceRole';

type Props = {
  role: WorkspaceRoleAccent;
  children: ReactNode;
  className?: string;
  /** Optional data-demo hook for the walkthrough. */
  demoId?: string;
};

/**
 * Soft role-coded frame for operational dashboards — accent rail + wash, not a theme flip.
 */
export function RoleWorkspaceFrame({ role, children, className, demoId }: Props) {
  return (
    <div className={cn(roleFrameClass(role), className)} data-role={role} data-demo={demoId}>
      <div className="sr-role-frame__badge" aria-hidden>
        <span className="sr-role-frame__dot" />
        <span className="sr-role-frame__label">{WORKSPACE_ROLE_LABEL[role]}</span>
      </div>
      {children}
    </div>
  );
}
