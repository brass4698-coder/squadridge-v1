import { test, expect } from '@playwright/test';

test.describe('Staging verification smoke (optional)', () => {
  test.skip(
    !process.env.PLAYWRIGHT_STAGING_BASE_URL?.trim(),
    'Set PLAYWRIGHT_STAGING_BASE_URL to a deployed app (staging) with real ZK flags to run.',
  );

  test('verification page renders on staging host', async ({ page }) => {
    const base = process.env.PLAYWRIGHT_STAGING_BASE_URL!.replace(/\/$/, '');
    await page.goto(`${base}/verify`);
    await expect(page.getByRole('heading', { name: /Prove you belong/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
