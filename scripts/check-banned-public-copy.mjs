#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bad = [];

/** Lines that expressly negate or cite limits — allowed to mention restricted terms for clarity. */
function isDisclaimerLine(trimmed) {
  return (
    /\b(not|no|avoid|unless|don’t|don't)\b/i.test(trimmed) ||
    /\b(disclaimer|Mirror language|\/security)/i.test(trimmed)
  );
}

function scanFile(absPath, relDisplay, { checkModeratorDecrypt = false } = {}) {
  const text = readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (
      /not .*end-to-end|don't |don’t |avoid |never (assert|claim)|Banned|banned phrases/i.test(
        trimmed,
      )
    )
      return;
    if (/\bend-to-end\s+encryption\b/i.test(trimmed) && !/qualified|research|scenario/i.test(trimmed))
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
    if (/\bSignal-grade\b/i.test(trimmed) && !/\bnot\b/i.test(trimmed))
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
    if (/\bserver-blind\b/i.test(trimmed) && !isDisclaimerLine(trimmed))
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
    if (checkModeratorDecrypt && /moderator keys can decrypt/i.test(trimmed)) {
      bad.push(`${relDisplay}:${idx + 1}: ${trimmed}`);
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
  const pitchHub = join(root, 'supabase', 'functions', 'serve-deck', 'static');
  if (existsSync(pitchHub)) {
    for (const name of readdirSync(pitchHub)) {
      if (!name.endsWith('.html')) continue;
      scanFile(join(pitchHub, name), `supabase/functions/serve-deck/static/${name}`);
    }
  }
}

/** Public marketing surfaces that must not imply encrypted v2 rooms. */
const marketingClaimFiles = [
  'src/components/shared/TrustBoundaryBlock.tsx',
  'src/components/landing/BoundarySection.tsx',
  'src/components/landing/LandingHero.tsx',
  'src/pages/v2/LandingPage.tsx',
];
for (const rel of marketingClaimFiles) {
  const abs = join(root, ...rel.split('/'));
  if (existsSync(abs)) scanFile(abs, rel, { checkModeratorDecrypt: true });
}

if (bad.length) {
  console.error('Banned or risky public-copy lines:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('PASS banned-public-copy');
process.exit(0);
