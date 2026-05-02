import { test, expect } from '@playwright/test';

/**
 * Hermetic matchmaking demo coverage. The `/match?demo=1` route uses a
 * client-only timeline and does not require Supabase, so the full demo flow
 * (loading -> ready -> confirm) can run under the preview server.
 */
test.describe('Matchmaking demo flow (hermetic)', () => {
  test('demo timeline reaches the Match-ready confirmation panel', async ({ page }) => {
    await page.goto('/match?demo=1');
    await expect(page.getByText(/match ready/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /confirm to enter the room/i })).toBeVisible();
  });

  test('confirmation panel exposes both confirm and back-out controls', async ({ page }) => {
    await page.goto('/match?demo=1');
    await expect(page.getByText(/match ready/i)).toBeVisible({ timeout: 15_000 });
    // The confirm CTA and the cancel/back path are both required affordances.
    await expect(page.getByRole('button', { name: /confirm|enter|join/i }).first()).toBeVisible();
    await expect(
      page
        .getByRole('button', { name: /cancel|back|leave/i })
        .or(page.getByRole('link', { name: /cancel|back|leave/i }))
        .first(),
    ).toBeVisible();
  });

  test('non-demo /match without a Supabase session does not silently dead-end', async ({
    page,
  }) => {
    await page.goto('/match');
    // Either we're redirected to sign-in / find-squad, or a guidance banner
    // explains why matchmaking is unavailable. Anything except a blank screen
    // is acceptable — we just refuse to ship a route that hangs on `loading`.
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const url = page.url();
    const main = await page.locator('main').textContent();
    expect(main?.trim().length ?? 0).toBeGreaterThan(20);
    expect(url).toMatch(/match|sign-in|find-squad/);
  });
});
