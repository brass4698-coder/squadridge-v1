/**
 * Soak / smoke helpers for matchmaking (non-production load tests).
 *
 * Modes:
 *   (default) With SUPABASE_SERVICE_ROLE_KEY: calls matchmaking_queue_stats + optional matchmaking_sweep_active_pools.
 *   With --enqueue N: creates N anonymous sessions and enqueues into --pool with alternating A/B sides
 *     (requires VITE_SUPABASE_URL + anon key; uses signInAnonymously — rate limits apply).
 *
 * Never commit service role keys. Use a dev / staging project only.
 *
 * Logging: this script is run by hand against dev/staging projects. We still avoid
 * leaking PII (anon-session ids, user ids, JWTs) into stdout — the redactor below
 * masks UUIDs, JWTs, and emails. Errors emit a concise tag rather than the raw
 * Supabase error.message, which can echo SQL fragments. See `docs/security/threat-model.md`.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function redactPII(s) {
  if (typeof s !== 'string') return String(s);
  return s
    .replace(/eyJ[A-Za-z0-9_\-.]{20,}/g, '<jwt-redacted>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid-redacted>')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email-redacted>');
}

function logEvent(level, event, ctx = {}) {
  const sanitized = { level, event };
  for (const [k, v] of Object.entries(ctx)) {
    if (typeof v === 'string') sanitized[k] = redactPII(v);
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) sanitized[k] = v;
  }
  // Centralized stdout/stderr write — the only allowed raw `process.stdout.write`
  // call in this file (per scripts/check-no-raw-console.mjs).
  const line = JSON.stringify(sanitized) + '\n';
  if (level === 'error') process.stderr.write(line);
  else process.stdout.write(line);
}

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
      logEvent('error', 'soak_missing_env', {
        error_message: 'need VITE_SUPABASE_URL and anon/publishable key for --enqueue',
      });
      process.exit(1);
    }
    logEvent('info', 'soak_enqueue_start', { count: n, pool: poolArg });
    for (let i = 0; i < n; i++) {
      const sb = createClient(url, anonKey);
      const { error: authErr } = await sb.auth.signInAnonymously();
      if (authErr) {
        logEvent('error', 'soak_sign_in_anonymously_failed', { error_message: authErr.message });
        process.exit(1);
      }
      const side = i % 2 === 0 ? 'A' : 'B';
      const { data, error } = await sb.rpc('matchmaking_enqueue_and_try', {
        p_pool_key: poolArg,
        p_side: side,
      });
      if (error) {
        logEvent('error', 'soak_enqueue_failed', {
          index: i + 1,
          error_message: error.message,
        });
        process.exit(1);
      }
      logEvent('info', 'soak_enqueue_ok', {
        index: i + 1,
        side,
        // Redact any UUIDs/tokens that may appear in the RPC response.
        result: typeof data === 'string' ? data : JSON.stringify(data),
      });
      await sb.auth.signOut();
    }
    logEvent('info', 'soak_enqueue_done', { count: n });
    process.exit(0);
  }

  if (!url || !serviceKey) {
    logEvent('info', 'soak_skip', {
      hint: 'set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for queue stats / manual sweep, or run with --enqueue N',
    });
    process.exit(0);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: stats, error: e1 } = await admin.rpc('matchmaking_queue_stats');
  if (e1) {
    logEvent('error', 'soak_queue_stats_failed', { error_message: e1.message });
    process.exit(1);
  }
  logEvent('info', 'soak_queue_stats', { result: JSON.stringify(stats) });

  if (args.includes('--sweep')) {
    const { error: e2 } = await admin.rpc('matchmaking_sweep_active_pools');
    if (e2) {
      logEvent('error', 'soak_sweep_failed', { error_message: e2.message });
      process.exit(1);
    }
    logEvent('info', 'soak_sweep_ok');
  }

  const { data: runs, error: e3 } = await admin
    .from('matchmaking_sweep_runs')
    .select('id, ran_at, pool_keys_swept')
    .order('ran_at', { ascending: false })
    .limit(5);
  if (e3) {
    logEvent('warn', 'soak_sweep_runs_unavailable', { error_message: e3.message });
  } else {
    logEvent('info', 'soak_sweep_runs', { result: JSON.stringify(runs) });
  }

  process.exit(0);
}

main().catch((e) => {
  logEvent('error', 'soak_fatal', { error_message: e instanceof Error ? e.message : String(e) });
  process.exit(1);
});
