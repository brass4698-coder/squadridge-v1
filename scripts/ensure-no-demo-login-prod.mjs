#!/usr/bin/env node
/** Fail CI/release when demo password login is enabled for production builds. */
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');
if (env.VITE_ENABLE_DEMO_LOGIN === 'true') {
  console.error(
    'FAIL: VITE_ENABLE_DEMO_LOGIN=true in production — demo password login must not ship in release artifacts.',
  );
  process.exit(1);
}
console.log('PASS: demo login disabled for production check');
