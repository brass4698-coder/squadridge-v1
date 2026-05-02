import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * Demo capture spec — walks `DEMO_MAIN_STEPS` end-to-end at presenter pacing
 * and writes a full-page screenshot per step into `test-results/demo-capture/`.
 *
 * Runs as a separate Playwright project (`demo-capture`) so the default
 * `npm run e2e` stays hermetic. Invoke with:
 *
 *   npm run demo:capture
 *
 * Step list intentionally hard-coded here (mirrors `src/demo/demoScript.ts`)
 * so the spec stays standalone and a Vite import is not required from the
 * Playwright runtime. The list is asserted in
 * `src/demo/demoScript.test.ts` so drift fails CI.
 */

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const captureDir = join(root, 'test-results', 'demo-capture');
mkdirSync(captureDir, { recursive: true });

interface CaptureStep {
  id: string;
  path: string;
  /** Selector that must be visible before the screenshot fires. */
  awaitSelector?: string;
  /** Tolerated wait window before the screenshot fires (ms). */
  settleMs?: number;
}

const STEPS: CaptureStep[] = [
  { id: '01-landing', path: '/?demo=1', awaitSelector: 'main', settleMs: 600 },
  {
    id: '02-onboarding-mission',
    path: '/onboarding/mission?demo=1&owt=0',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '03-onboarding-identity',
    path: '/onboarding/identity?demo=1&owt=1',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '04-onboarding-placement',
    path: '/onboarding/placement?demo=1&owt=2',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '05-onboarding-rules',
    path: '/onboarding/rules?demo=1&owt=3',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '06-onboarding-verification',
    path: '/onboarding/verification?demo=1&owt=4',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '07-onboarding-dryrun',
    path: '/onboarding/dryrun?demo=1&owt=5',
    awaitSelector: 'main',
    settleMs: 800,
  },
  {
    id: '08-verify-standalone',
    path: '/verify?demo=1',
    awaitSelector: '[data-demo="verify-root"]',
    settleMs: 600,
  },
  {
    id: '09-intent',
    path: '/find-squad?demo=1',
    awaitSelector: '[data-demo="intent-input"]',
    settleMs: 800,
  },
  {
    id: '10-match',
    path: '/match?demo=1',
    awaitSelector: '[data-demo="match-guided-root"]',
    settleMs: 1200,
  },
  {
    id: '11-session-offline',
    path: '/session/demo-session-001?demo=1',
    awaitSelector: '[data-demo="session-composer"]',
    settleMs: 600,
  },
  {
    id: '12-ledger',
    path: '/ledger/demo-proposal-001?demo=1',
    awaitSelector: 'main',
    settleMs: 600,
  },
  { id: '13-security', path: '/security?demo=1', awaitSelector: 'main', settleMs: 600 },
  { id: '14-investors-public', path: '/investors', awaitSelector: 'main', settleMs: 400 },
];

test.describe.configure({ mode: 'serial' });

test.describe('demo capture', () => {
  for (const step of STEPS) {
    test(`captures ${step.id}`, async ({ page }) => {
      await page.goto(step.path);
      if (step.awaitSelector) {
        await expect(page.locator(step.awaitSelector).first()).toBeVisible({ timeout: 15_000 });
      }
      if (step.settleMs) {
        await page.waitForTimeout(step.settleMs);
      }
      const target = join(captureDir, `${step.id}.png`);
      await page.screenshot({ path: target, fullPage: true });
    });
  }
});
