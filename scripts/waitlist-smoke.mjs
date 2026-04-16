/**
 * Verifies waitlist_signup_count RPC and waitlist_signups insert (including duplicate handling).
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY in .env.
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

function getKey(env) {
  return env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
}

async function main() {
  const env = { ...process.env, ...loadDotEnv() };
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = getKey(env).trim();

  if (!url || !key) {
    console.log(
      'SKIP: Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env to run waitlist smoke tests.',
    );
    process.exit(0);
  }

  const supabase = createClient(url, key);

  const { data: c0, error: e0 } = await supabase.rpc('waitlist_signup_count');
  if (e0) {
    console.error('waitlist_signup_count failed:', e0.message);
    process.exit(1);
  }
  const n0 = typeof c0 === 'number' ? c0 : Number.parseInt(String(c0), 10);
  if (!Number.isFinite(n0) || n0 < 0) {
    console.error('Unexpected count:', c0);
    process.exit(1);
  }
  console.log('waitlist_signup_count:', n0);

  const email = `waitlist-smoke-${Date.now()}@example.invalid`;
  const { error: ins1 } = await supabase.from('waitlist_signups').insert({ email });
  if (ins1) {
    console.error('insert failed:', ins1.message);
    process.exit(1);
  }
  console.log('insert ok:', email);

  const { error: ins2 } = await supabase.from('waitlist_signups').insert({ email });
  if (!ins2 || ins2.code !== '23505') {
    console.error('Expected duplicate key (23505) on second insert, got:', ins2?.message ?? ins2);
    process.exit(1);
  }
  console.log('duplicate handled (23505) as expected');

  const { data: c1, error: e1 } = await supabase.rpc('waitlist_signup_count');
  if (e1) {
    console.error('waitlist_signup_count after insert failed:', e1.message);
    process.exit(1);
  }
  const n1 = typeof c1 === 'number' ? c1 : Number.parseInt(String(c1), 10);
  if (!Number.isFinite(n1) || n1 < n0 + 1) {
    console.error('Count did not increase after insert:', n0, '->', c1);
    process.exit(1);
  }
  console.log('waitlist_signup_count after insert:', n1);
  console.log('OK: waitlist smoke tests passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
