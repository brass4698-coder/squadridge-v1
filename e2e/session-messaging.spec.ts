import { test, expect } from '@playwright/test';

/**
 * Hermetic session-messaging coverage via the offline `/session/demo-session-001`
 * walkthrough. Real squad sessions require Supabase + a verified profile (see
 * SessionAccess) so they are exercised by the staging spec; the demo
 * walkthrough is the only way to drive the composer end-to-end without
 * standing up a backend.
 */
test.describe('Session messaging (offline demo)', () => {
  test('renders the demo banner and lists seeded peer messages', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    await expect(page.getByText(/offline squad demo/i)).toBeVisible();
    await expect(page.getByText(/demo only.*your privacy/i)).toBeVisible();
    // Three seeded peer messages are the contract — guard the count to catch
    // accidental seed edits that change the demo's storyline.
    const list = page.locator('ul[aria-live="polite"] > li');
    await expect(list).toHaveCount(3);
  });

  test('composer is gated by the consent checkbox', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    const composer = page.getByLabel('Message');
    const send = page.getByRole('button', { name: /^send$/i });

    await expect(composer).toBeDisabled();
    await expect(send).toBeDisabled();

    await page.getByRole('checkbox').check();
    await expect(composer).toBeEnabled();
    // Send stays disabled until the textarea has non-whitespace content.
    await expect(send).toBeDisabled();
  });

  test('user can send a message and see it appended to the thread', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    await page.getByRole('checkbox').check();
    const composer = page.getByLabel('Message');
    const text = 'Test e2e draft from Playwright';
    await composer.fill(text);

    const send = page.getByRole('button', { name: /^send$/i });
    await expect(send).toBeEnabled();
    await send.click();

    const list = page.locator('ul[aria-live="polite"] > li');
    await expect(list).toHaveCount(4);
    await expect(list.last()).toContainText(text);
    await expect(composer).toHaveValue('');
  });

  test('Leave and forget clears local state and returns to the home route', async ({ page }) => {
    await page.goto('/session/demo-session-001');
    await page.getByRole('checkbox').check();
    await page.getByLabel('Message').fill('ephemeral');
    await page.getByRole('button', { name: /^send$/i }).click();
    await expect(page.locator('ul[aria-live="polite"] > li')).toHaveCount(4);

    await page.getByRole('button', { name: /leave and forget/i }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });
});
