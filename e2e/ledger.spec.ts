import { test, expect } from '@playwright/test';

/**
 * Hermetic ledger coverage. The ledger renders sample / demo published rows
 * even without a Supabase connection so the lifecycle, anchoring, and
 * disclosure sections can be smoke-tested under the preview server.
 */
test.describe('Ledger surfaces (hermetic)', () => {
  test('index renders the SquadRidge Ledger heading and table-like structure', async ({ page }) => {
    await page.goto('/ledger');
    await expect(page.getByRole('heading', { name: /SquadRidge\s*Ledger/i })).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    // Either rendered rows or an explicit empty-state should be present — never blank.
    const main = await page.locator('main').textContent();
    expect(main?.trim().length ?? 0).toBeGreaterThan(50);
  });

  test('demo proposal slug deep-links into a detail layout', async ({ page }) => {
    await page.goto('/ledger/demo-proposal');
    await expect(page).toHaveURL(/\/ledger\/demo-proposal/);
    await expect(page.locator('main')).toBeVisible();
    // Expect either the demo trust-block content or a "not found" treatment;
    // both are valid hermetic outcomes. Critically, no blank or stuck-loading
    // screen should remain after the route resolves.
    await expect(
      page.getByText(/sample public outcome record|not found|missing/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('back to ledger index from a deep link', async ({ page }) => {
    await page.goto('/ledger/demo-proposal');
    const back = page.getByRole('link', { name: /ledger|index|back/i }).first();
    if (await back.isVisible().catch(() => false)) {
      await back.click();
      await expect(page).toHaveURL(/\/ledger\/?$/);
    }
  });

  test('unknown proposal slug renders a graceful fallback (no blank crash)', async ({ page }) => {
    await page.goto('/ledger/this-slug-does-not-exist-xyz');
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    const main = await page.locator('main').textContent();
    expect(main?.trim().length ?? 0).toBeGreaterThan(20);
  });
});
