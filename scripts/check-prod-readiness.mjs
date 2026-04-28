#!/usr/bin/env node
/**
 * Production readiness checklist (PASS/FAIL). Extend as migrations and policies evolve.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

// 2. Moderator admin health route (nested under /admin in React Router)
try {
  const app = read('src/App.tsx');
  const hasAdminNest = app.includes('path="/admin"');
  const hasHealthChild = /path=\{?["']health["']\}?/.test(app) && app.includes('SupabaseHealthPage');
  if (!hasAdminNest || !hasHealthChild) {
    fail('Admin health route', 'expect /admin nest with path "health" → SupabaseHealthPage');
  } else if (!app.includes('RequireModerator')) {
    fail('Admin health route', 'missing RequireModerator');
  } else {
    pass('Protected /admin/health route');
  }
} catch (e) {
  fail('Admin health route', String(e));
}

// 3. Migrations on disk (any non-empty set — CI also applies them)
try {
  const migDir = join(root, 'supabase/migrations');
  if (!existsSync(migDir)) {
    fail('Migrations directory', 'supabase/migrations missing');
  } else {
    const sqlFiles = readdirSync(migDir).filter((f) => f.endsWith('.sql'));
    if (sqlFiles.length === 0) {
      fail('Migrations', 'no .sql files in supabase/migrations');
    } else {
      pass(`Migrations present (${sqlFiles.length} SQL files)`);
    }
  }
} catch (e) {
  fail('Migrations check', String(e));
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
  } else if (!netlify.includes('X-Content-Type-Options')) {
    fail('netlify.toml security headers', 'missing X-Content-Type-Options');
  } else {
    pass('netlify.toml defines CSP + baseline security headers');
  }
} catch (e) {
  fail('netlify.toml', String(e));
}

try {
  const vercel = read('vercel.json');
  if (!vercel.includes('Content-Security-Policy')) {
    fail('vercel.json CSP', 'missing Content-Security-Policy header');
  } else if (!vercel.includes('X-Content-Type-Options')) {
    fail('vercel.json security headers', 'missing X-Content-Type-Options');
  } else {
    pass('vercel.json defines CSP + baseline security headers');
  }
} catch (e) {
  fail('vercel.json', String(e));
}

// 7. Sentry init fail-soft (never bricks bootstrap)
try {
  const sentry = read('src/lib/sentry.ts');
  if (!sentry.includes('Sentry.init')) {
    fail('Sentry init', 'missing Sentry.init');
  } else if (!sentry.includes('catch') || !sentry.includes('Initialization failed')) {
    fail('Sentry fail-soft', 'Sentry.init should be wrapped in try/catch with user-visible warning');
  } else {
    pass('Sentry init is fail-soft (try/catch)');
  }
} catch (e) {
  fail('Sentry check', String(e));
}

// 7b. Sentry user-id is hashed (no raw auth.users.id leaves the browser)
try {
  const sentry = read('src/lib/sentry.ts');
  if (!sentry.includes('hashUserIdForSentry') && !sentry.includes('sentryUserHash')) {
    fail(
      'Sentry user hash',
      'src/lib/sentry.ts must use hashUserIdForSentry (raw auth.users.id is PII-adjacent)',
    );
  } else if (!sentry.includes('beforeSend')) {
    fail('Sentry beforeSend', 'src/lib/sentry.ts must define a beforeSend pre-send hook');
  } else {
    pass('Sentry hashes user ids and defines beforeSend');
  }
} catch (e) {
  fail('Sentry user-hash check', String(e));
}

// 7c. Sentry user-hash salt documented in .env.example
try {
  const ex = read('.env.example');
  if (!ex.includes('VITE_SENTRY_USER_HASH_SALT')) {
    fail(
      '.env.example Sentry hash salt',
      'must document VITE_SENTRY_USER_HASH_SALT (required in prod when VITE_SENTRY_DSN is set)',
    );
  } else {
    pass('.env.example documents VITE_SENTRY_USER_HASH_SALT');
  }
} catch (e) {
  fail('.env.example Sentry hash salt', String(e));
}

// 8b. Explicit Semaphore demo decoy gate documented (vite env)
try {
  const ex = read('.env.example');
  if (
    !ex.includes('VITE_SEMAPHORE_DEMO_GROUP') ||
    (!ex.includes('buildAnonymityGroup') &&
      !ex.includes('Issuer-managed') &&
      !ex.includes('bundled demo Merkle'))
  ) {
    fail(
      '.env.example Semaphore demo',
      'must document VITE_SEMAPHORE_DEMO_GROUP and reference issuer-managed decoys vs demo',
    );
  } else {
    pass('.env.example documents VITE_SEMAPHORE_DEMO_GROUP');
  }
} catch (e) {
  fail('.env.example', String(e));
}

// 9. Production / CI bundles must not enable hash-only ZK stub (vite + ensure script also guard this)
if (process.env.VITE_ZK_STUB === 'true') {
  fail('VITE_ZK_STUB', 'must not be true when building or checking production readiness');
} else {
  pass('VITE_ZK_STUB is not set to true for this check');
}

const failed = checks.filter((c) => !c.ok);
console.log(`\nDone: ${checks.filter((c) => c.ok).length}/${checks.length} passed.`);
if (failed.length) {
  process.exitCode = 1;
}
