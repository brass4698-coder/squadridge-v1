import { test, expect } from '@playwright/test';

test.describe('critical path smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SquadRidge/i);
  });

  test('admin CSI requires sign-in (no anonymous moderator UI)', async ({ page }) => {
    await page.goto('/admin/csi');
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

  test('participant room Slow down overlay and cooldown', async ({ page }) => {
    await page.goto('/p/room/demo-token');
    await expect(page.getByRole('heading', { name: /Northern Watershed/i })).toBeVisible();
    await page.getByTestId('slow-down-btn').click();
    await expect(page.getByRole('heading', { name: /^Slow down$/i })).toBeVisible();
    await expect(page.getByText(/Sending resumes in/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('send-message-btn')).toBeDisabled();
  });

  test('waiting room uses path token and involvement copy', async ({ page }) => {
    await page.goto('/p/waiting/demo-token');
    await expect(page.getByTestId('waiting-room')).toBeVisible();
    await expect(page.getByText(/Involvement/i)).toBeVisible();
  });

  test('facilitator session control requires sign-in', async ({ page }) => {
    await page.goto('/sessions/sess-001/control');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('role dashboards require sign-in', async ({ page }) => {
    for (const path of [
      '/app/participant',
      '/app/mediator',
      '/app/facilitator',
      '/app/observer',
      '/app/analyst',
      '/app/institution',
      '/app/admin',
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test('demo catalog requires sign-in', async ({ page }) => {
    await page.goto('/app/demo/catalog');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('cinematic demo simulation walks role → continue', async ({ page }) => {
    await page.goto('/demo/simulation');
    await expect(page.getByTestId('demo-simulation')).toBeVisible();
    await page.getByTestId('sim-role-participant').click();
    await page.getByTestId('sim-next').click();
    await expect(page.getByRole('heading', { name: /Access barrier/i })).toBeVisible();
  });
});
