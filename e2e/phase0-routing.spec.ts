import { test, expect } from '@playwright/test';

test.describe('Phase 0 routing', () => {
  test('legacy facilitator nav redirect does not 404', async ({ page }) => {
    await page.goto('/f/dashboard');
    await expect(page).toHaveURL(/\/(app|sign-in)/);
    await expect(page.getByText('404')).not.toBeVisible();
  });

  test('find-squad legacy redirect reaches pilot request-access', async ({ page }) => {
    await page.goto('/find-squad');
    await expect(page).toHaveURL(/\/request-access/);
  });

  test('legacy match and verify soft-retire to request-access', async ({ page }) => {
    await page.goto('/match');
    await expect(page).toHaveURL(/\/request-access/);
    await page.goto('/verify');
    await expect(page).toHaveURL(/\/request-access/);
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

  test('participant invite demo-token completes through /p/room', async ({ page }) => {
    await page.goto('/p/invite/demo-token');
    await page.getByRole('button', { name: /Accept invitation/i }).click();
    await expect(page).toHaveURL(/\/p\/verify\/demo-token/);

    await page.getByLabel(/Organisational email/i).fill('pilot@ngo.example');
    await page.getByRole('button', { name: /^Continue$/i }).click();
    await page.getByRole('button', { name: /Continue to consent/i }).click();

    await expect(page).toHaveURL(/\/p\/consent\/demo-token/);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /Confirm & Continue to Briefing/i }).click();

    await expect(page).toHaveURL(/\/p\/briefing\/demo-token/);
    await page.getByRole('button', { name: /Enter Waiting Room/i }).click();

    await expect(page).toHaveURL(/\/p\/waiting\/demo-token/);
    await page.getByRole('button', { name: /Enter Room/i }).click();
    await expect(page).toHaveURL(/\/p\/room\/demo-token/);
    await expect(page.getByText('Protected Session · Live')).toBeVisible();
  });

  test('unauthorized page renders for direct visit', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(
      page.getByRole('heading', { name: /don.?t have access to this page/i }),
    ).toBeVisible();
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
