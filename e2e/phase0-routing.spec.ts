import { test, expect } from '@playwright/test';

test.describe('Phase 0 routing', () => {
  test('legacy facilitator nav redirect does not 404', async ({ page }) => {
    await page.goto('/f/dashboard');
    await expect(page).toHaveURL(/\/(app|sign-in)/);
    await expect(page.getByText('404')).not.toBeVisible();
  });

  test('find-squad legacy redirect reaches invite gate', async ({ page }) => {
    await page.goto('/find-squad');
    await expect(page).toHaveURL(/\/invite/);
    await expect(page.getByRole('heading', { name: /Invitation link required/i })).toBeVisible();
  });

  test('participant invite deep link loads acceptance screen', async ({ page }) => {
    await page.goto('/p/invite/demo-token');
    await expect(page.getByRole('button', { name: /Accept invitation/i })).toBeVisible();
  });

  test('participant flow uses path token through verify step', async ({ page }) => {
    await page.goto('/p/invite/demo-token');
    await page.getByRole('button', { name: /Accept invitation/i }).click();
    await expect(page).toHaveURL(/\/p\/verify\/demo-token/);
    await expect(page.getByRole('heading', { name: /Confirm your email/i })).toBeVisible();
  });

  test('unauthorized page renders for direct visit', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(page.getByRole('heading', { name: /not authorized/i })).toBeVisible();
  });

  test('session detail route is registered and requires sign-in', async ({ page }) => {
    await page.goto('/sessions/sess-001');
    await expect(page).toHaveURL(/\/sign-in/);
    expect(new URL(page.url()).searchParams.get('next')).toContain('/app/sessions/sess-001');
  });

  test('legacy dashboard path redirects to app namespace', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(app|sign-in)/);
  });
});
