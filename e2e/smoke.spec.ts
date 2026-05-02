import { test, expect } from '@playwright/test';

test.describe('critical path smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SquadRidge/i);
  });

  test('investor surfaces are reachable without auth', async ({ page }) => {
    for (const path of ['/dialogues', '/trust', '/insights', '/partners']) {
      await page.goto(path);
      await expect(page).toHaveTitle(/SquadRidge/i);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('/insights/dashboard requires sign-in (no anonymous moderator UI)', async ({ page }) => {
    await page.goto('/insights/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('admin CSI requires sign-in (no anonymous moderator UI)', async ({ page }) => {
    await page.goto('/admin/csi');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('/pitch-deck-hub is internal-only and requires sign-in', async ({ page }) => {
    await page.goto('/pitch-deck-hub');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('/dev/supabase is not a public route', async ({ page }) => {
    await page.goto('/dev/supabase');
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('offline demo session page renders', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    await expect(page.getByText('Offline squad demo')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });

  test('ledger index renders', async ({ page }) => {
    await page.goto('/ledger');
    await expect(page.getByRole('heading', { name: /SquadRidge\s*Ledger/i })).toBeVisible();
  });

  test('match demo gate reaches confirmation', async ({ page }) => {
    await page.goto('/match?demo=1');
    await expect(page.getByText('Match ready')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /Confirm to enter the room/i })).toBeVisible();
  });
});
