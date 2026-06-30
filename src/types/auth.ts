// ============================================================
// SquadRidge Auth Types
// ============================================================

export type UserStatus = 'pending' | 'active' | 'suspended';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  primary_role: RoleKey | null;
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

export type { RoleKey } from './roles';
export type { UserRole } from './roles';
