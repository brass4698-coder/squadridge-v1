#!/usr/bin/env node
/**
 * Bundles ingest-message Edge (Deno): TS + ../../src imports → single edge.bundle.mjs next to index.ts.
 */
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outfile = join(root, 'supabase/functions/ingest-message/edge.bundle.mjs');
const entry = join(root, 'supabase/functions/ingest-message/edgeHandler.ts');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  outfile,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  legalComments: 'none',
  sourcemap: false,
  logLevel: 'info',
  allowOverwrite: true,
});

console.log(`Wrote ${outfile}`);
