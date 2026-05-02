import { expect, test } from '@playwright/test';

/**
 * Smoke checks for the pitch-deck access gate.
 *
 * The hub itself is already covered by `smoke.spec.ts` (RequireModerator
 * → /sign-in). This file adds:
 *   - the formerly-public deck URLs now 404 against the static host
 *   - the still-public chrome assets continue to 200
 *   - the new viewer route is reachable but bounces unauthenticated callers
 *   - the legacy investor-deck-model.json / .embed.js are no longer public
 */

const FORMERLY_PUBLIC_DECK_URLS = [
  '/pitch-deck-hub/financial-appendix.html',
  '/pitch-deck-hub/business-pricing.html',
  '/pitch-deck-hub/appendix-faq.html',
  '/pitch-deck-hub/squadridge-core-investor-deck.html',
  '/pitch-deck-hub/technical-security.html',
];

const FORMERLY_PUBLIC_MODEL_URLS = [
  '/pitch-deck-hub/investor-deck-model.json',
  '/pitch-deck-hub/investor-deck-model.embed.js',
];

const STILL_PUBLIC_CHROME = [
  '/pitch-deck-hub/deck-hub-chrome.css',
  '/pitch-deck-hub/deck-layout-global.css',
  '/pitch-deck-hub/deck-ds.css',
  '/pitch-deck-hub/deck-scroll-deck.js',
];

test.describe('pitch-deck gating', () => {
  test('previously public deck HTML files are no longer fetchable', async ({ request }) => {
    for (const path of FORMERLY_PUBLIC_DECK_URLS) {
      const res = await request.get(path);
      // Vite preview will fall through the SPA rewrite, so the body comes
      // back as the SPA shell with status 200. The defensible check here
      // is that the response is NOT the deck HTML (which would contain a
      // <link href="deck-hub-chrome.css"> or the deck title).
      const body = await res.text();
      expect(body).not.toMatch(/deck-hub-chrome\.css/i);
      expect(body).not.toContain('SquadRidge Core Investor Deck');
      expect(body).not.toContain('Financial appendix');
    }
  });

  test('investor-deck-model assets are no longer publicly fetchable', async ({ request }) => {
    for (const path of FORMERLY_PUBLIC_MODEL_URLS) {
      const res = await request.get(path);
      const body = await res.text();
      // Same SPA-fallback caveat: assert the body does NOT contain any
      // model-leak markers.
      expect(body).not.toContain('fundraisingAskUsd');
      expect(body).not.toContain('__INVESTOR_DECK_MODEL');
    }
  });

  test('shared chrome assets remain publicly fetchable', async ({ request }) => {
    for (const path of STILL_PUBLIC_CHROME) {
      const res = await request.get(path);
      expect(res.status(), `${path} expected 200`).toBe(200);
      const body = await res.text();
      // Sanity-check that we got real CSS/JS and not the SPA shell.
      expect(body.length).toBeGreaterThan(64);
      expect(body).not.toContain('<!doctype html>');
    }
  });

  test('robots.txt disallows /pitch-deck-hub/', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/pitch-deck-hub\//i);
  });

  test('moderator-only viewer route requires sign-in', async ({ page }) => {
    await page.goto('/admin/decks/view/core-investor');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('moderator-only viewer route requires sign-in for always-moderator-only decks too', async ({
    page,
  }) => {
    await page.goto('/admin/decks/view/financial-appendix');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
