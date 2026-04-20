/**
 * Soak / smoke helpers for matchmaking (non-production load tests).
 *
 * Modes:
 *   (default) With SUPABASE_SERVICE_ROLE_KEY: calls matchmaking_queue_stats + optional matchmaking_sweep_active_pools.
 *   With --enqueue N: creates N anonymous sessions and enqueues into --pool with alternating A/B sides
 *     (requires VITE_SUPABASE_URL + anon key; uses signInAnonymously — rate limits apply).
 *
 * Never commit service role keys. Use a dev / staging project only.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadDotEnv() {
  const p = path.join(root, '.env');
  if (!fs.existsSync(p)) return {};
  const text = fs.readFileSync(p, 'utf8');
  const env = {};
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function getAnonKey(env) {
  return env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
}

async function main() {
  const env = { ...process.env, ...loadDotEnv() };
  const url = env.VITE_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = getAnonKey(env).trim();

  const args = process.argv.slice(2);
  const enqueueIdx = args.indexOf('--enqueue');
  const n =
    enqueueIdx >= 0 && args[enqueueIdx + 1] ? Number.parseInt(args[enqueueIdx + 1], 10) : 0;
  const poolArg = args.includes('--pool') ? args[args.indexOf('--pool') + 1] : 'soak-test-pool';

  if (n > 0) {
    if (!url || !anonKey) {
      console.error('Need VITE_SUPABASE_URL and anon/publishable key for --enqueue');
      process.exit(1);
    }
    console.log(`Enqueue ${n} anonymous users into pool "${poolArg}" (alternating A/B)…`);
    for (let i = 0; i < n; i++) {
      const sb = createClient(url, anonKey);
      const { error: authErr } = await sb.auth.signInAnonymously();
      if (authErr) {
        console.error('signInAnonymously failed:', authErr.message);
        process.exit(1);
      }
      const side = i % 2 === 0 ? 'A' : 'B';
      const { data, error } = await sb.rpc('matchmaking_enqueue_and_try', {
        p_pool_key: poolArg,
        p_side: side,
      });
      if (error) {
        console.error(`enqueue ${i + 1} failed:`, error.message);
        process.exit(1);
      }
      console.log(`  user ${i + 1} side ${side}:`, JSON.stringify(data));
      await sb.auth.signOut();
    }
    console.log('Done. Check Dashboard or run this script without --enqueue with service role for stats.');
    process.exit(0);
  }

  if (!url || !serviceKey) {
    console.log(
      'SKIP: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for queue stats / manual sweep.',
    );
    console.log(
      'Or use: node scripts/matchmaking-soak.mjs --enqueue 4 --pool my-pool  (anon key in .env)',
    );
    process.exit(0);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: stats, error: e1 } = await admin.rpc('matchmaking_queue_stats');
  if (e1) {
    console.error('matchmaking_queue_stats:', e1.message);
    process.exit(1);
  }
  console.log('matchmaking_queue_stats:', JSON.stringify(stats, null, 2));

  if (args.includes('--sweep')) {
    const { error: e2 } = await admin.rpc('matchmaking_sweep_active_pools');
    if (e2) {
      console.error('matchmaking_sweep_active_pools:', e2.message);
      process.exit(1);
    }
    console.log('matchmaking_sweep_active_pools: ok');
  }

  const { data: runs, error: e3 } = await admin
    .from('matchmaking_sweep_runs')
    .select('id, ran_at, pool_keys_swept')
    .order('ran_at', { ascending: false })
    .limit(5);
  if (e3) {
    console.warn('matchmaking_sweep_runs (optional):', e3.message);
  } else {
    console.log('recent sweep runs:', JSON.stringify(runs, null, 2));
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
