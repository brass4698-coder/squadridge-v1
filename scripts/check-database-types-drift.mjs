#!/usr/bin/env node
/**
 * After `supabase gen types typescript --local`, compare public.Tables (and messages.Row keys)
 * to `src/types/supabase.ts`. Fails if codegen introduces tables/columns missing from the committed file.
 * Run with local stack up (e.g. CI `db` job after `supabase db reset`).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const handPath = join(root, 'src', 'types', 'supabase.ts');

function braceSlice(s, openBraceIdx) {
  let depth = 0;
  for (let k = openBraceIdx; k < s.length; k++) {
    const c = s[k];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(openBraceIdx, k + 1);
    }
  }
  throw new Error('Unbalanced braces');
}

function extractPublicTablesInner(src) {
  // Accept both legacy `export interface Database` (hand file) and the newer
  // `export type Database = {` form emitted by `supabase gen types typescript --local`.
  let dbIdx = src.indexOf('export interface Database');
  if (dbIdx === -1) dbIdx = src.indexOf('export type Database');
  if (dbIdx === -1) throw new Error('No export interface/type Database');
  // Match `public:` only when it's a standalone schema key, not inside `graphql_public:`.
  // Codegen indents schemas 2 spaces; hand file indents schemas 2 spaces inside `interface Database`.
  const publicMatch = /(^|\r?\n)\s*public:/m.exec(src.slice(dbIdx));
  if (!publicMatch) throw new Error('No public: in Database');
  const publicIdx = dbIdx + publicMatch.index + publicMatch[0].indexOf('public:');
  const tablesKw = src.indexOf('Tables:', publicIdx);
  if (tablesKw === -1) throw new Error('No Tables: in public');
  /** First "{" opens Tables dict */
  const open = src.indexOf('{', tablesKw);
  return braceSlice(src, open);
}

function parseTopLevelTableKeysFromTablesInner(inner) {
  /** inner is substring starting at `{` containing `users: {` ... at 6-space indent */
  const names = new Set();
  const lines = inner.split('\n');
  for (const line of lines) {
    const m = /^[\s]{6}([a-zA-Z0-9_]+):\s*\{/.exec(line);
    if (m) names.add(m[1]);
  }
  return names;
}

function extractTableBlock(tablesInner, tableName) {
  const needle = `      ${tableName}:`;
  const idx = tablesInner.indexOf(needle);
  if (idx === -1) return null;
  const bracePos = tablesInner.indexOf('{', idx);
  if (bracePos === -1) return null;
  return braceSlice(tablesInner, bracePos);
}

function parseRowPropNames(tableBlock) {
  const names = new Set();
  const rowIdx = tableBlock.indexOf('Row:');
  if (rowIdx === -1) return names;
  const afterRow = tableBlock.slice(rowIdx);
  const open = afterRow.indexOf('{');
  if (open === -1) return names;
  const rowBrace = braceSlice(afterRow, open);
  const propRe = /^[\s]{10}([a-zA-Z0-9_]+)(\?)?:/gm;
  let mm;
  while ((mm = propRe.exec(rowBrace)) !== null) {
    names.add(mm[1]);
  }
  return names;
}

const handSrc = readFileSync(handPath, 'utf8');
const genResult = spawnSync('npx', ['supabase', 'gen', 'types', 'typescript', '--local'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 15 * 1024 * 1024,
  shell: process.platform === 'win32',
});

if (genResult.error || genResult.status !== 0) {
  const detail = `${genResult.stderr || ''}\n${genResult.stdout || ''}`;
  console.error(detail);
  // Local machines without Docker Desktop cannot run --local codegen. CI `db` job
  // starts the stack first; soft-skip here so `npm run check:all` remains usable offline.
  const dockerMissing =
    /dockerDesktopLinuxEngine|Docker Desktop is a prerequisite|Cannot connect to the Docker daemon|pipe\/docker/i.test(
      detail,
    );
  if (dockerMissing && process.env.CI !== 'true') {
    console.warn(
      'SKIP database.types drift check: local Supabase/Docker is not running. CI db job still enforces this.',
    );
    process.exit(0);
  }
  console.error('DATABASE TYPES DRIFT: supabase gen types failed (start local stack: supabase start).');
  process.exit(2);
}

const genTxt = genResult.stdout;

const handTablesInnerFull = extractPublicTablesInner(handSrc);
/** strip outer wrappers: full block is `{ users: ..., views: {} }`-like under Tables — hand file uses `Tables: { inner }` */

const genTablesInnerFull = extractPublicTablesInner(genTxt);

function keysFromFullBlock(block) {
  /** block starts with `{` first key often `users`** */
  return parseTopLevelTableKeysFromTablesInner(block);
}

const handTableNames = keysFromFullBlock(handTablesInnerFull);
const genTableNames = keysFromFullBlock(genTablesInnerFull);

const missingTables = [...genTableNames].filter((t) => !handTableNames.has(t));

const extraTablesOnlyInHand = [...handTableNames].filter((t) => !genTableNames.has(t));

/** Row keys — messages deep check */
function compareMessagesRow() {
  const gBlock = extractTableBlock(genTablesInnerFull, 'messages');
  const hBlock = extractTableBlock(handTablesInnerFull, 'messages');
  if (!gBlock || !hBlock) return;
  const gRow = parseRowPropNames(gBlock);
  const hRow = parseRowPropNames(hBlock);
  const missingCols = [...gRow].filter((c) => !hRow.has(c));
  if (missingCols.length) {
    console.error(
      'DATABASE TYPES DRIFT: messages.Row missing codegen columns:',
      missingCols.sort().join(', '),
    );
    console.error(
      `Merge migrations into ${handPath.replace(/\\/g, '/')} (messages.Row), then re-run.`,
    );
    process.exit(1);
  }
}

if (missingTables.length) {
  console.error(
    'DATABASE TYPES DRIFT: hand types missing codegen tables:',
    missingTables.sort().join(', '),
  );
  console.error(`Merge new tables/columns into ${handPath.replace(/\\/g, '/')} (Tables), then commit.`);
  process.exit(1);
}

compareMessagesRow();

if (extraTablesOnlyInHand.length) {
  console.warn(
    '[check-database-types] Note: extra table keys in hand file not in codegen (may be intentional):',
    extraTablesOnlyInHand.join(', '),
  );
}

console.log(`PASS src/types/supabase.ts covers ${genTableNames.size} codegen public tables (--local).`);
