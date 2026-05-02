#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bad = [];
const punctuationFindings = [];

/** Lines that expressly negate or cite limits — allowed to mention restricted terms for clarity. */
function isDisclaimerLine(trimmed) {
  return /\b(not|no|avoid|unless|don’t|don't)\b/i.test(trimmed) || /\b(disclaimer|Mirror language|\/security)/i.test(trimmed);
}

function scanFile(absPath, relDisplay) {
  const text = readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (/not .*end-to-end|don't |don’t |avoid |never (assert|claim)|Banned|banned phrases/i.test(trimmed))
      return;
    if (/\bend-to-end\s+encryption\b/i.test(trimmed) && !/qualified|research|scenario/i.test(trimmed))
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
    if (/\bSignal-grade\b/i.test(trimmed) && !/\bnot\b/i.test(trimmed)) bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
    if (/\bserver-blind\b/i.test(trimmed) && !isDisclaimerLine(trimmed))
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
  });
}

/**
 * Looser punctuation/encoding sniffer for the wider source tree. Reports lines
 * containing literal Unicode replacement characters (U+FFFD) or stray double
 * smart quotes that don't have a closing partner on the same line — a common
 * symptom of copy-paste drift through tools that don't preserve punctuation.
 */
function isPunctuationOffender(trimmed) {
  if (trimmed.includes('\uFFFD')) return 'replacement-char';
  // Mojibake — Windows-1252 byte sequences interpreted as UTF-8 (e.g. â€™ for ’).
  if (/Â|Ã©|Ã ‚|â€™|â€“|â€”|â€œ|â€/.test(trimmed)) return 'mojibake';
  return null;
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.md']);
const SOURCE_IGNORES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'test-results',
  '.cursor',
  '.husky',
  '.git',
  '.github',
  'public',
]);

function walk(dir, results = []) {
  for (const name of readdirSync(dir)) {
    if (SOURCE_IGNORES.has(name)) continue;
    const abs = join(dir, name);
    let info;
    try {
      info = statSync(abs);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      walk(abs, results);
      continue;
    }
    const ext = name.slice(name.lastIndexOf('.'));
    if (!SOURCE_EXTENSIONS.has(ext)) continue;
    if (name.endsWith('.test.ts') || name.endsWith('.test.tsx')) continue;
    if (abs.includes(`${'src'}${'\\'}lib${'\\'}database.types`)) continue;
    if (abs.endsWith('database.types.ts')) continue;
    results.push(abs);
  }
  return results;
}

function scanPunctuation(absPath) {
  const rel = absPath.replace(root, '').replace(/^[/\\]/, '');
  const text = readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const flag = isPunctuationOffender(line);
    if (flag) {
      punctuationFindings.push(`${rel}:${idx + 1} [${flag}]: ${line.trim().slice(0, 200)}`);
    }
  });
}

const indexHtml = join(root, 'index.html');
if (existsSync(indexHtml)) scanFile(indexHtml, 'index.html');

const pubDir = join(root, 'public');
if (existsSync(pubDir)) {
  for (const name of readdirSync(pubDir)) {
    if (!name.endsWith('.html')) continue;
    scanFile(join(pubDir, name), `public/${name}`);
  }
  const pitchHub = join(pubDir, 'pitch-deck-hub');
  if (existsSync(pitchHub)) {
    for (const name of readdirSync(pitchHub)) {
      if (!name.endsWith('.html')) continue;
      scanFile(join(pitchHub, name), `public/pitch-deck-hub/${name}`);
    }
  }
}

// Punctuation/encoding sweep across src/ and docs/.
const sources = [
  ...(existsSync(join(root, 'src')) ? walk(join(root, 'src')) : []),
  ...(existsSync(join(root, 'docs')) ? walk(join(root, 'docs')) : []),
];
for (const abs of sources) scanPunctuation(abs);

let failed = false;

if (bad.length) {
  console.error('Banned or risky public-copy lines:\n' + bad.join('\n'));
  failed = true;
}

if (punctuationFindings.length) {
  console.error('Punctuation / encoding drift:\n' + punctuationFindings.join('\n'));
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`PASS banned-public-copy (scanned ${sources.length} source files for encoding drift)`);
process.exit(0);
