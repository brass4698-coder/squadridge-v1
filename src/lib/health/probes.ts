import { isSupabaseConfigured } from '../env';
import { supabase } from '../../utils/supabase';

export type ProbeId = 'env' | 'auth_session' | 'db_squads' | 'realtime' | 'rpc_smoke';

export type ProbeResult = {
  id: ProbeId;
  label: string;
  ok: boolean;
  detail: string;
  ms: number;
};

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const t0 = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - t0) };
}

/** Metadata-only health probe suite for /admin/health. */
export async function runHealthProbes(): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];

  {
    const t0 = performance.now();
    const ok = isSupabaseConfigured();
    results.push({
      id: 'env',
      label: 'Environment',
      ok,
      detail: ok ? 'Supabase URL + publishable key present' : 'Missing VITE_SUPABASE_* config',
      ms: Math.round(performance.now() - t0),
    });
  }

  if (!isSupabaseConfigured()) {
    for (const id of ['auth_session', 'db_squads', 'realtime', 'rpc_smoke'] as const) {
      results.push({
        id,
        label: id,
        ok: false,
        detail: 'Skipped — env not configured',
        ms: 0,
      });
    }
    return results;
  }

  {
    const { value, ms } = await timed(async () => {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    });
    results.push({
      id: 'auth_session',
      label: 'Auth session',
      ok: !value.error,
      detail: value.error
        ? value.error.message
        : value.data.session
          ? 'Session present'
          : 'No session (anonymous probe ok)',
      ms,
    });
  }

  {
    const { value, ms } = await timed(async () => {
      return supabase.from('squads').select('id').limit(1);
    });
    results.push({
      id: 'db_squads',
      label: 'Database (squads)',
      ok: !value.error,
      detail: value.error ? value.error.message : 'public.squads reachable',
      ms,
    });
  }

  {
    const { value, ms } = await timed(async () => {
      try {
        const channel = supabase.channel(`health-probe-${Date.now()}`);
        const status = await new Promise<string>((resolve) => {
          const timeout = window.setTimeout(() => resolve('timeout'), 2500);
          channel.subscribe((s) => {
            if (s === 'SUBSCRIBED' || s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
              window.clearTimeout(timeout);
              resolve(s);
            }
          });
        });
        void supabase.removeChannel(channel);
        return status;
      } catch (e) {
        return e instanceof Error ? e.message : 'realtime_error';
      }
    });
    const ok = value === 'SUBSCRIBED';
    results.push({
      id: 'realtime',
      label: 'Realtime',
      ok,
      detail: typeof value === 'string' ? value : 'unknown',
      ms,
    });
  }

  {
    const { value, ms } = await timed(async () => {
      // Lightweight reachability: head select is enough; dedicated RPC may not exist in all envs.
      return supabase.from('interventions').select('id').limit(1);
    });
    results.push({
      id: 'rpc_smoke',
      label: 'Critical table (interventions)',
      ok: !value.error,
      detail: value.error
        ? value.error.message
        : 'interventions selectable (RLS may return zero rows)',
      ms,
    });
  }

  return results;
}
