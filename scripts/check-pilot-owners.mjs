#!/usr/bin/env node
/**
 * Pilot owners completeness check.
 *
 * Verifies that docs/operations/pilot-owners.md contains at least one
 * cohort block whose Status is `planned` or `active`, and that every
 * required role in that block has a non-empty name, email, and phone
 * or chat handle (plus backup contact for the five non-incident roles).
 *
 * Behaviour:
 *   - Always reports PASS / FAIL per cohort and a summary line.
 *   - Exits 1 only when PILOT_OWNERS_REQUIRED=true (or --require flag).
 *     Otherwise exits 0 even if no compliant cohort is present.
 *
 * Wiring: opt-in failure is enforced by the production deploy workflow
 * (.github/workflows/deploy-frontend.yml) which sets
 * PILOT_OWNERS_REQUIRED=true. Day-to-day CI does not block on this.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const ownersPath = join(root, 'docs/operations/pilot-owners.md');

const required = process.env.PILOT_OWNERS_REQUIRED === 'true' || process.argv.includes('--require');

const ROLES_WITH_BACKUP = [
  'product owner',
  'technical owner',
  'moderation owner',
  'facilitator owner',
  'partner owner',
];
const INCIDENT_ROLE = 'incident lead (during this pilot window)';
const ALL_ROLES = [...ROLES_WITH_BACKUP, INCIDENT_ROLE];

const COHORT_HEADING_RE = /^### Pilot (\d{4}-\d{2}-\d{2}) — (.+?)\s*$/;
const STATUS_RE = /^Status:\s*(planned|active|closed)\b/i;

const checks = [];

function pass(name) {
  checks.push({ name, ok: true });
  console.log(`PASS  ${name}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
}

function stripFences(text) {
  // Drop everything inside ``` fences so the cohort template inside a fence
  // is not parsed as a real cohort block.
  const out = [];
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) out.push(line);
  }
  return out;
}

function splitCohortBlocks(lines) {
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(COHORT_HEADING_RE);
    if (m) {
      if (current) blocks.push(current);
      current = { date: m[1], title: m[2], lines: [line] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) blocks.push(current);
  return blocks;
}

function findStatus(blockLines) {
  for (const line of blockLines) {
    const m = line.trim().match(STATUS_RE);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findRoleSection(blockLines, role) {
  // Match a list line like "- product owner" or "- incident lead (during this pilot window)".
  const roleRe = new RegExp(`^\\s*-\\s*${escapeRegex(role)}\\s*$`, 'i');
  let start = -1;
  for (let i = 0; i < blockLines.length; i += 1) {
    if (roleRe.test(blockLines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  // Collect indented sub-bullets until we hit a non-indented bullet, a heading,
  // or another role.
  const sub = [];
  for (let i = start + 1; i < blockLines.length; i += 1) {
    const line = blockLines[i];
    if (/^### /.test(line)) break;
    if (/^\s*-\s+/.test(line) && !/^\s{2,}-\s+/.test(line)) break;
    sub.push(line);
  }
  return sub;
}

function fieldValue(subLines, fieldName) {
  // Look for "  - <fieldName>: <value>" allowing arbitrary leading whitespace.
  const re = new RegExp(`^\\s*-\\s*${escapeRegex(fieldName)}\\s*:\\s*(.*)$`, 'i');
  for (const line of subLines) {
    const m = line.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function validateRole(blockLines, role, requireBackup) {
  const sub = findRoleSection(blockLines, role);
  if (!sub) return [`role "${role}" not present`];
  const errors = [];
  const name = fieldValue(sub, 'name');
  const email = fieldValue(sub, 'email');
  const handle = fieldValue(sub, 'phone or chat handle');
  if (!name) errors.push(`${role}: missing name`);
  if (!email) errors.push(`${role}: missing email`);
  else if (!email.includes('@')) errors.push(`${role}: email "${email}" missing "@"`);
  if (!handle) errors.push(`${role}: missing phone or chat handle`);
  if (requireBackup) {
    const backup = fieldValue(sub, 'backup contact');
    if (!backup) errors.push(`${role}: missing backup contact`);
  }
  return errors;
}

function validateCohort(block) {
  const status = findStatus(block.lines);
  if (!status) return { skipped: true, reason: 'no Status: line' };
  if (status === 'closed') return { skipped: true, reason: 'closed' };
  const errors = [];
  for (const role of ROLES_WITH_BACKUP) {
    errors.push(...validateRole(block.lines, role, true));
  }
  errors.push(...validateRole(block.lines, INCIDENT_ROLE, false));
  return { skipped: false, status, errors };
}

if (!existsSync(ownersPath)) {
  fail('Pilot owners file present', `expected ${ownersPath}`);
} else {
  pass('Pilot owners file present');
  const text = readFileSync(ownersPath, 'utf8');
  const lines = stripFences(text);
  const blocks = splitCohortBlocks(lines);

  if (blocks.length === 0) {
    fail(
      'At least one cohort block defined',
      'no real cohort block found outside the template (heading "### Pilot YYYY-MM-DD — ...")',
    );
  } else {
    pass(`Cohort block(s) parsed (${blocks.length})`);

    let activeOrPlannedCount = 0;
    for (const block of blocks) {
      const result = validateCohort(block);
      const label = `Cohort ${block.date} — ${block.title}`;
      if (result.skipped) {
        if (result.reason === 'closed') {
          pass(`${label} (skipped: closed)`);
        } else {
          fail(label, `cannot validate: ${result.reason}`);
        }
        continue;
      }
      activeOrPlannedCount += 1;
      if (result.errors.length === 0) {
        pass(`${label} (status: ${result.status}) — all required roles populated`);
      } else {
        fail(`${label} (status: ${result.status})`, result.errors.join('; '));
      }
    }

    if (activeOrPlannedCount === 0) {
      fail(
        'At least one active or planned cohort',
        'no cohort block has Status: planned or Status: active — production deploys require one',
      );
    } else {
      pass(`${activeOrPlannedCount} active or planned cohort(s) found`);
    }
  }
}

const failed = checks.filter((c) => !c.ok);
const passed = checks.filter((c) => c.ok);
console.log(`\nDone: ${passed.length}/${checks.length} passed.`);

if (failed.length === 0) {
  console.log('PASS: pilot-owners completeness check');
  process.exit(0);
}

if (required) {
  console.error(
    `\nFAIL: pilot-owners completeness check (PILOT_OWNERS_REQUIRED=true).\n` +
      'See docs/operations/pilot-owners.md for the template and ' +
      'docs/operations/pilot-runbook.md § Pilot owners for context.',
  );
  process.exit(1);
}

console.log(
  '\nWARN: pilot-owners completeness check has failures, but PILOT_OWNERS_REQUIRED is not set.\n' +
    'This script only blocks production deploys (deploy-frontend.yml) and the manual pre-flight.',
);
process.exit(0);
