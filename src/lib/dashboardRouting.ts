// ============================================================
// MENDguild Dashboard Routing helpers
// ============================================================
import { supabase } from './supabase';
import type { UserRole, RoleKey } from '../types/roles';
import { getHighestPriorityRole, getDashboardForRole } from './roles';

export async function getDefaultDashboard(userId?: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_default_dashboard_for_user', {
    p_user_id: userId ?? null,
  });
  if (error || !data) {
    console.warn('[dashboardRouting] fallback to /app', error);
    return '/app';
  }
  return data as string;
}

export async function saveLastDashboard(
  userId: string,
  dashboard: string
): Promise<void> {
  await supabase
    .from('app_preferences')
    .upsert({ user_id: userId, last_dashboard: dashboard, updated_at: new Date().toISOString() });
}

export function resolveLocalDashboard(roles: UserRole[]): string {
  const best = getHighestPriorityRole(roles);
  if (!best) return '/app';
  return getDashboardForRole(best as RoleKey);
}
