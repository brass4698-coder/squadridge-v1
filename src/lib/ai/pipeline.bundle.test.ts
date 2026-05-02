import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Bundle hygiene guard for `src/lib/ai/pipeline.ts`.
 *
 * `@xenova/transformers` ships ~MB of WASM + tokenisers and pulls hundreds of
 * MB of ONNX weights at runtime. It MUST stay behind a dynamic `import()`
 * inside `analyzeToneWithModel` — never a top-level static import — or the
 * main entry chunk regresses for every user, including those who never opt
 * into the AI pipeline.
 *
 * This test reads the source file directly so it catches regressions even
 * before bundling.
 */
describe('ai/pipeline.ts bundle hygiene', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.join(here, 'pipeline.ts'), 'utf-8');

  it('never imports @xenova/transformers at module top-level', () => {
    // Match `import ... from '@xenova/transformers'` (single OR double quotes)
    // in any leading position. Dynamic `await import('@xenova/transformers')`
    // is allowed and explicitly tested for separately below.
    const staticImportRegex = /(^|\n)\s*import\s+[^;]*from\s+['"]@xenova\/transformers['"]\s*;?/m;
    expect(source).not.toMatch(staticImportRegex);
  });

  it('keeps the lazy `await import("@xenova/transformers")` call site', () => {
    expect(source).toMatch(/await\s+import\s*\(\s*[^)]*['"]@xenova\/transformers['"]/);
  });
});
