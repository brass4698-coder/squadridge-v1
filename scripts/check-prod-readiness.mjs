#!/usr/bin/env node
/**
 * Production readiness checklist (PASS/FAIL). Extend as migrations and policies evolve.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const checks = [];

function read(p) {
  return readFileSync(join(root, p), 'utf8');
}

function pass(name) {
  checks.push({ name, ok: true });
  console.log(`PASS  ${name}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
}

// 1. No public /dev/supabase route
try {
  const app = read('src/App.tsx');
  if (app.includes('path="/dev/supabase"') || app.includes("path='/dev/supabase'")) {
    fail('Remove /dev/supabase route', 'still present in App.tsx');
  } else {
    pass('No /dev/supabase route in App.tsx');
  }
} catch (e) {
  fail('No /dev/supabase route', String(e));
}

// 2. Moderator admin health route
try {
  const app = read('src/App.tsx');
  if (!app.includes('path="/admin/health"')) {
    fail('Admin health route', 'missing /admin/health');
  } else if (!app.includes('RequireModerator')) {
    fail('Admin health route', 'missing RequireModerator');
  } else {
    pass('Protected /admin/health route');
  }
} catch (e) {
  fail('Admin health route', String(e));
}

// 3. Migrations on disk
for (const m of [
  'supabase/migrations/20260418080000_fix_role_other_detail.sql',
  'supabase/migrations/20260418090000_ttl_cleanup.sql',
  'supabase/migrations/20260418100000_revoke_anon_matchmaking.sql',
]) {
  if (existsSync(join(root, m))) {
    pass(`Migration present: ${m.split('/').pop()}`);
  } else {
    fail(`Migration missing: ${m}`);
  }
}

// 4. CORS helper + ZK handler use shared cors
try {
  const zk = read('supabase/functions/_shared/handleZkProofVerification.ts');
  if (zk.includes("'Access-Control-Allow-Origin': '*'")) {
    fail('ZK CORS', 'wildcard * still in handleZkProofVerification');
  } else {
    pass('ZK handler avoids wildcard CORS');
  }
  if (!read('supabase/functions/_shared/cors.ts').includes('ALLOWED_ORIGINS')) {
    fail('Shared CORS', 'cors.ts missing ALLOWED_ORIGINS');
  } else {
    pass('Shared CORS uses ALLOWED_ORIGINS');
  }
} catch (e) {
  fail('CORS files', String(e));
}

// 5. Edge rate-limit function
if (existsSync(join(root, 'supabase/functions/rate-limit/index.ts'))) {
  pass('Edge function rate-limit/index.ts');
} else {
  fail('Edge rate-limit', 'missing');
}

// 6. Hosting CSP
try {
  const netlify = read('netlify.toml');
  if (!netlify.includes('Content-Security-Policy')) {
    fail('netlify.toml CSP', 'missing Content-Security-Policy header');
  } else {
    pass('netlify.toml defines CSP');
  }
} catch (e) {
  fail('netlify.toml', String(e));
}

try {
  const vercel = read('vercel.json');
  if (!vercel.includes('Content-Security-Policy')) {
    fail('vercel.json CSP', 'missing Content-Security-Policy header');
  } else {
    pass('vercel.json defines CSP');
  }
} catch (e) {
  fail('vercel.json', String(e));
}

// 7. Sentry required in production (source check)
try {
  const sentry = read('src/lib/sentry.ts');
  if (!sentry.includes('VITE_SENTRY_DSN is required in production')) {
    fail('Sentry production', 'initSentry does not require DSN in prod');
  } else {
    pass('Sentry init requires DSN in production builds');
  }
} catch (e) {
  fail('Sentry check', String(e));
}

const failed = checks.filter((c) => !c.ok);
console.log(`\nDone: ${checks.filter((c) => c.ok).length}/${checks.length} passed.`);
if (failed.length) {
  process.exitCode = 1;
}
