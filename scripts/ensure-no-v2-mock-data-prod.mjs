#!/usr/bin/env node
/**
 * Fail CI/release when VITE_V2_MOCK_DATA is enabled for production builds.
 * Mock mode serves SESSION_FIXTURES as the facilitator workspace — unsafe for pilots.
 */
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');
if (env.VITE_V2_MOCK_DATA === 'true') {
  console.error(
    'FAIL: VITE_V2_MOCK_DATA=true in production — facilitator fixtures must not ship in release artifacts. Unset or set false for pilot/production.',
  );
  process.exit(1);
}
console.log('PASS: VITE_V2_MOCK_DATA is not enabled for production check');
