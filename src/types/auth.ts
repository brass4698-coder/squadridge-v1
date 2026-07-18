// ============================================================
// SquadRidge Auth Types
// ============================================================

import type { RoleKey, UserRole } from './roles';

export type UserStatus = 'pending' | 'active' | 'suspended';

/**
 * Invite / auth-shell profile (columns from 20260630 + 20260704 reconcile).
 * Phase1 operator identity uses `callsign` / `role_archetype` /
 * `onboarding_completed_at` on the same `profiles` table — see
 * `Database['public']['Tables']['profiles']` in `src/types/supabase.ts`.
 */
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  primary_role: RoleKey | null;
  /** Invite boolean flag — not `onboarded_at`. */
  onboarding_completed: boolean;
  last_dashboard: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppPreferences {
  user_id: string;
  last_dashboard: string | null;
  theme: string | null;
  density: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  roles: UserRole[];
  loading: boolean;
  initialized: boolean;
}

export type { RoleKey, UserRole };
