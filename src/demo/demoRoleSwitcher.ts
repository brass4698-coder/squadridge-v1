import type { RoleKey } from '../types/roles';
import { ROLE_PRIORITY } from '../types/roles';

/** sessionStorage only — never mutates production user_roles. */
export const DEMO_ROLE_STORAGE_KEY = 'sr_demo_role';

const ROLE_SET = new Set<string>(ROLE_PRIORITY);

export function getDemoRoleOverride(): RoleKey | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY);
  if (!raw || !ROLE_SET.has(raw)) return null;
  return raw as RoleKey;
}

export function setDemoRoleOverride(role: RoleKey | null): void {
  if (typeof window === 'undefined') return;
  if (!role) {
    sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
}

export function clearDemoRoleOverride(): void {
  setDemoRoleOverride(null);
}
