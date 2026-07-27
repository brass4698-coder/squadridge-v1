import { test, expect } from '@playwright/test';

test.describe('critical path smoke', () => {
  test('home loads with product framing', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SquadRidge/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('ledger index renders', async ({ page }) => {
    await page.goto('/ledger');
    await expect(page).toHaveTitle(/ledger/i);
    await expect(page.getByRole('heading', { name: /Outcome ledger/i })).toBeVisible();
  });

  test('request access is the pilot intake path', async ({ page }) => {
    await page.goto('/request-access');
    await expect(page).toHaveTitle(/Request pilot access/i);
  });

  test('sign-in page renders', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveTitle(/Sign in/i);
  });

  test('admin CSI requires sign-in (no anonymous moderator UI)', async ({ page }) => {
    await page.goto('/admin/csi');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('app workspace requires auth', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('legacy demo session redirects off retired path', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    await expect(page).not.toHaveURL(/\/session\/demo-session-001$/);
  });

  test('legacy match demo redirects to request-access', async ({ page }) => {
    await page.goto('/match?demo=1');
    await expect(page).toHaveURL(/\/request-access/);
  });

  test('/dev/supabase is not a public route', async ({ page }) => {
    await page.goto('/dev/supabase');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
  });
});
