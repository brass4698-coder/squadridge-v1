#!/usr/bin/env node
/**
 * Forbid raw `console.log/info/debug/warn/error` calls in code paths that handle
 * production data (Edge Functions, src/lib server-side helpers, scripts that talk
 * to Supabase). Those paths must use the structured logger (`supabase/functions/_shared/log.ts`)
 * or the matchmaking-soak `logEvent` helper, both of which redact PII before
 * emitting JSON.
 *
 * The single permitted use-site is the structured logger itself, which wraps
 * `console.*` and is annotated with an explicit eslint-disable on the call line.
 *
 * Audit reference: docs/security/threat-model.md "Logging discipline".
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/**
 * Directories whose .ts/.tsx/.mjs/.js files are checked. Globs aren't supported
 * here intentionally — keep the list explicit so it's obvious what's covered.
 */
const SCAN_DIRS = [
  join(root, 'supabase', 'functions'),
  join(root, 'src', 'lib'),
  join(root, 'scripts'),
];

/** Files explicitly permitted to call `console.*`. Keep tiny. */
const ALLOWLIST = new Set([
  // The structured logger itself — its emit() function wraps console.*.
  join(root, 'supabase', 'functions', '_shared', 'log.ts').replace(/\\/g, '/'),
  // The check script itself uses console for its own pass/fail output.
  join(root, 'scripts', 'check-no-raw-console.mjs').replace(/\\/g, '/'),
  // Self-tests for the other scripts emit console pass/fail; keep them simple.
  join(root, 'scripts', 'check-prod-readiness.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'ensure-no-zk-stub-prod.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'ensure-no-demo-decoys-prod.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'ensure-no-demo-login-prod.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'check-banned-public-copy.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'check-database-types-drift.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'bundle-ingest-message.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'clean.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'waitlist-smoke.mjs').replace(/\\/g, '/'),
  join(root, 'scripts', 'generate-investor-deck-model.ts').replace(/\\/g, '/'),
  // Local/dev seed CLI — console is the operator interface; not a prod data path.
  join(root, 'scripts', 'seedDemo.mjs').replace(/\\/g, '/'),
  // Build-time helper (no Supabase / production data); writes a static asset.
  join(root, 'scripts', 'generate-noise-png.mjs').replace(/\\/g, '/'),
]);

const EXTS = new Set(['.ts', '.tsx', '.mjs', '.js']);
/** Skip generated bundles and tests (tests intentionally use console for assertion clarity). */
const SKIP_NAME_PATTERNS = [/\.bundle\.mjs$/, /\.test\.ts$/, /\.test\.tsx$/, /\.spec\.ts$/, /\.spec\.tsx$/];

const CONSOLE_RE = /(?<![A-Za-z0-9_$])console\s*\.\s*(log|info|debug|warn|error)\s*\(/g;

function walk(dir, files) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
      continue;
    }
    const norm = full.replace(/\\/g, '/');
    if (!EXTS.has(extOf(norm))) continue;
    if (SKIP_NAME_PATTERNS.some((re) => re.test(norm))) continue;
    if (ALLOWLIST.has(norm)) continue;
    files.push(norm);
  }
}

function extOf(p) {
  const i = p.lastIndexOf('.');
  return i < 0 ? '' : p.slice(i);
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  try {
    statSync(dir);
  } catch {
    continue;
  }
  const files = [];
  walk(dir, files);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    let lineMatched = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Allow per-line opt-out comment for the rare exception. The directive
      // can target either rule name — `no-console` (broad ESLint rule) or
      // `no-restricted-syntax` (the `src/lib/**` override that bans console.*
      // CallExpressions specifically). Either way, we treat the next line as
      // an explicit, audited exception.
      const prev = i > 0 ? lines[i - 1] : '';
      const prevIsDisable =
        /eslint-disable-next-line\b[^/]*\b(no-console|no-restricted-syntax)\b/.test(prev);
      const sameLineIsDisable =
        /eslint-disable-line\b[^/]*\b(no-console|no-restricted-syntax)\b/.test(line);
      if (prevIsDisable || sameLineIsDisable) continue;
      CONSOLE_RE.lastIndex = 0;
      let m;
      while ((m = CONSOLE_RE.exec(line)) !== null) {
        offenders.push({
          file: relative(root, file).replace(/\\/g, '/'),
          line: i + 1,
          method: m[1],
          excerpt: line.trim(),
        });
        lineMatched = true;
      }
    }
    if (lineMatched) {
      // continue scanning more files
    }
  }
}

if (offenders.length > 0) {
  console.error(
    `FAIL: ${offenders.length} raw console.* call(s) found in production-data paths.\n` +
      'Use the structured logger (supabase/functions/_shared/log.ts) or matchmaking-soak `logEvent`.\n' +
      'Per-line override: add `// eslint-disable-next-line no-console` on the previous line ' +
      'and explain why in a comment (avoid this for code that handles user data).\n',
  );
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  console.${o.method}  ${truncate(o.excerpt, 100)}`);
  }
  process.exit(1);
}

console.log('PASS: no raw console.* calls in production-data paths.');

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
