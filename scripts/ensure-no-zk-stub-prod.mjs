#!/usr/bin/env node
/**
 * Fail fast if a production-style build is attempted with hash-only ZK stub enabled.
 * Vite also blocks this in vite.config.ts; this script catches mis-set env in CI before `npm run build`.
 */
const stub = process.env.VITE_ZK_STUB === 'true';
if (stub) {
  console.error(
    'FAIL: VITE_ZK_STUB=true. Pilot and production bundles must use real Semaphore + verify-zk-proof (set false or unset).',
  );
  process.exit(1);
}
console.log('PASS: VITE_ZK_STUB is not enabled for unsafe hash-only verification.');
