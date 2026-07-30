#!/usr/bin/env node
/**
 * Fail fast if a production-style build is attempted with bundled Semaphore demo decoys
 * enabled. Bundled decoys (`mendguild-decoy-{a,b,c}` in src/lib/zk/buildAnonymityGroup.ts)
 * are public and fixed; shipping them to production collapses the anonymity set.
 *
 * Vite also blocks this in vite.config.ts when `mode === 'production'`; this script catches
 * mis-set CI env (or `npm run build` from a contributor's machine) before `npm run build`.
 *
 * Escape hatch: set `VITE_ALLOW_DEMO_DECOYS_IN_PROD=true` for an *intentional* internal-demo
 * production build. CI prod release jobs must NOT set this.
 */
const demo = process.env.VITE_SEMAPHORE_DEMO_GROUP === 'true';
const allow = process.env.VITE_ALLOW_DEMO_DECOYS_IN_PROD === 'true';

if (demo && !allow) {
  console.error(
    'FAIL: VITE_SEMAPHORE_DEMO_GROUP=true without VITE_ALLOW_DEMO_DECOYS_IN_PROD=true.\n' +
      'Bundled Semaphore decoys collapse the anonymity set in production builds. Either:\n' +
      '  - unset VITE_SEMAPHORE_DEMO_GROUP for the production bundle (preferred), or\n' +
      '  - set VITE_ALLOW_DEMO_DECOYS_IN_PROD=true *only* for a controlled internal demo build.',
  );
  process.exit(1);
}

if (demo && allow) {
  console.log(
    'PASS: VITE_SEMAPHORE_DEMO_GROUP=true is gated behind VITE_ALLOW_DEMO_DECOYS_IN_PROD (intentional internal-demo build).',
  );
} else {
  console.log('PASS: bundled Semaphore demo decoys are not enabled for this build.');
}
