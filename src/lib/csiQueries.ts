import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type CsiSnapshotRow = Database['public']['Tables']['conflict_severity_snapshots']['Row'];
export type EscalationAlertRow = Database['public']['Tables']['escalation_alerts']['Row'];

export async function fetchCsiSnapshots(
  supabase: SupabaseClient<Database>,
  limit = 50,
): Promise<CsiSnapshotRow[]> {
  const { data, error } = await supabase
    .from('conflict_severity_snapshots')
    .select('*')
    .order('snapshot_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as CsiSnapshotRow[];
}

export async function fetchEscalationAlerts(
  supabase: SupabaseClient<Database>,
  limit = 50,
): Promise<EscalationAlertRow[]> {
  const { data, error } = await supabase
    .from('escalation_alerts')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as EscalationAlertRow[];
}
