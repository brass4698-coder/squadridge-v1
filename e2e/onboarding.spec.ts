import { test, expect } from '@playwright/test';

test.describe('critical paths', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SquadRidge/i);
  });

  test('/dev/supabase is not a public route', async ({ page }) => {
    await page.goto('/dev/supabase');
    // SPA fallback: unknown paths redirect to home per App routes.
    // Match pathname only — some environments omit a trailing slash in the serialized URL.
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });
});
