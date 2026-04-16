/**
 * Remove build output and local caches (safe to run anytime).
 * @see package.json "clean"
 */
import { existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const paths = ['dist', join('node_modules', '.tmp'), join('node_modules', '.vite')];

for (const rel of paths) {
  const p = join(root, rel);
  if (!existsSync(p)) continue;
  rmSync(p, { recursive: true, force: true });
  console.log('removed', rel);
}
