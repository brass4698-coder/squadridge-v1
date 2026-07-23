// ============================================================
// SquadRidge Role Types
// ============================================================

export type RoleKey =
  | 'super_admin'
  | 'institution_admin'
  | 'facilitator'
  | 'mediator'
  | 'analyst'
  | 'participant'
  | 'observer';

export interface Role {
  id: string;
  key: RoleKey;
  label: string;
  description: string | null;
}

export interface UserRole {
  role_key: RoleKey;
  workspace_id: string | null;
  institution_id: string | null;
  granted_at: string;
}

/** Ordered from highest to lowest priority */
export const ROLE_PRIORITY: RoleKey[] = [
  'super_admin',
  'institution_admin',
  'facilitator',
  'mediator',
  'analyst',
  'participant',
  'observer',
];

export const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: 'Super Admin',
  institution_admin: 'Institution Admin',
  facilitator: 'Facilitator',
  mediator: 'Mediator',
  analyst: 'Analyst',
  participant: 'Participant',
  observer: 'Observer',
};

export const ROLE_DASHBOARD_MAP: Record<RoleKey, string> = {
  super_admin: '/app/admin',
  institution_admin: '/app/institution',
  facilitator: '/app/facilitator',
  mediator: '/app/mediator',
  analyst: '/app/analyst',
  participant: '/app/participant',
  observer: '/app/executive',
};
