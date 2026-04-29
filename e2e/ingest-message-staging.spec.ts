import { test, expect } from '@playwright/test';

/**
 * Optional staging smoke for the authenticated ingest-message + Realtime path.
 *
 * The default Playwright run uses placeholder Supabase credentials in `.env.e2e`
 * and exercises only offline / demo routes. This spec runs against a real
 * staging deploy that has:
 *
 *   - Anonymous auth enabled
 *   - The `create_demo_squad` RPC migrated and callable by anon
 *     (`VITE_ENABLE_DEMO_SQUAD=true` so the developer affordance is visible)
 *   - The `ingest-message` Edge Function deployed
 *   - Realtime enabled on `public.messages`
 *
 * Set `PLAYWRIGHT_STAGING_BASE_URL` to the deployed origin to opt in. The spec
 * skips otherwise so default `npm run e2e` stays hermetic.
 *
 * Coverage: signs in anonymously, creates a single-user demo squad, sends a
 * message through the ingest-message Edge Function, and asserts the message
 * round-trips back via the Realtime subscription on the same client.
 */

test.describe('ingest-message + Realtime (staging-only)', () => {
  test.skip(
    !process.env.PLAYWRIGHT_STAGING_BASE_URL?.trim(),
    'Set PLAYWRIGHT_STAGING_BASE_URL to a staging deploy with anonymous auth and VITE_ENABLE_DEMO_SQUAD=true to run.',
  );

  test('authenticated user can send a message and receive it via Realtime', async ({ page }) => {
    const base = process.env.PLAYWRIGHT_STAGING_BASE_URL!.replace(/\/$/, '');
    const messageBody = `playwright-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    await page.goto(`${base}/session`);

    const createDemo = page.getByRole('button', { name: /Create demo squad/i });
    await expect(
      createDemo,
      'Create demo squad affordance must be visible (VITE_ENABLE_DEMO_SQUAD=true)',
    ).toBeVisible({
      timeout: 30_000,
    });
    await createDemo.click();

    await page.waitForURL(/\/session\/[0-9a-f-]{36}/, { timeout: 30_000 });

    const composer = page.getByLabel('Message');
    await expect(composer).toBeVisible({ timeout: 30_000 });
    await composer.fill(messageBody);

    await page.getByRole('button', { name: /^Send$/ }).click();

    await expect(
      page.getByText(messageBody, { exact: false }),
      'Message body must appear in the room after ingest-message + Realtime round-trip',
    ).toBeVisible({ timeout: 20_000 });
  });
});
