/**
 * Authenticated fetch of invite-only pitch deck HTML/CSS/JS via Edge Function
 * `serve-deck` (server checks JWT + has_deck_access). Never use public static URLs.
 */
import { getSupabasePublicKey, getSupabaseUrl } from './env';
import { logWarn, safeErrorMessage } from './log';
import { supabase } from './supabase';
import { pitchDeckHubHtmlFileNameForDeck } from '../pitch-deck-hub/deckHtmlRoutes';

const ALLOWED_ASSET = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(html|css|js|json)$/;

export function isAllowedDeckAssetPath(path: string): boolean {
  return ALLOWED_ASSET.test(path.replace(/^.*[/\\]/, ''));
}

export function gatedDeckHtmlFileName(deckId: string): string {
  return pitchDeckHubHtmlFileNameForDeck(deckId);
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabasePublicKey();
  if (!supabaseUrl || !anonKey) return null;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
    apikey: anonKey,
  };
}

export async function fetchGatedDeckAsset(path: string): Promise<string> {
  const base = path.replace(/^.*[/\\]/, '').trim();
  if (!isAllowedDeckAssetPath(base)) {
    throw new Error('INVALID_PATH');
  }

  const headers = await authHeaders();
  const supabaseUrl = getSupabaseUrl();
  if (!headers || !supabaseUrl) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const res = await fetch(
    `${supabaseUrl}/functions/v1/serve-deck?path=${encodeURIComponent(base)}`,
    { headers, method: 'GET' },
  );

  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) code = body.error;
    } catch {
      /* non-json */
    }
    logWarn('deck_asset.fetch_failed', {
      feature: 'deck_access',
      error_message: code,
    });
    throw new Error(code);
  }

  return res.text();
}

/**
 * Build a self-contained HTML document suitable for iframe srcDoc:
 * relative CSS/JS are fetched under the same gate and inlined.
 */
export async function buildGatedDeckSrcDoc(htmlFileName: string): Promise<string> {
  const html = await fetchGatedDeckAsset(htmlFileName);
  const cache = new Map<string, string>();

  const load = async (ref: string): Promise<string> => {
    const base = ref.replace(/^.*[/\\]/, '').trim();
    if (!isAllowedDeckAssetPath(base)) return '';
    const hit = cache.get(base);
    if (hit !== undefined) return hit;
    const text = await fetchGatedDeckAsset(base);
    cache.set(base, text);
    return text;
  };

  let out = html;

  const cssRe = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi;
  const cssMatches = [...html.matchAll(cssRe)];
  for (const m of cssMatches) {
    const href = m[1];
    if (
      !href ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('/')
    ) {
      continue;
    }
    try {
      const css = await load(href);
      out = out.replace(m[0], `<style data-gated-deck="${href}">\n${css}\n</style>`);
    } catch (err) {
      logWarn('deck_asset.css_inline_failed', {
        feature: 'deck_access',
        error_message: safeErrorMessage(err),
      });
    }
  }

  const scriptRe = /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi;
  const scriptMatches = [...out.matchAll(scriptRe)];
  for (const m of scriptMatches) {
    const src = m[2];
    if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      continue;
    }
    try {
      const js = await load(src);
      out = out.replace(m[0], `<script data-gated-deck="${src}">\n${js}\n</script>`);
    } catch (err) {
      logWarn('deck_asset.js_inline_failed', {
        feature: 'deck_access',
        error_message: safeErrorMessage(err),
      });
    }
  }

  return out;
}

export async function openGatedDeckInNewTab(htmlFileName: string): Promise<void> {
  const doc = await buildGatedDeckSrcDoc(htmlFileName);
  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    URL.revokeObjectURL(url);
    throw new Error('POPUP_BLOCKED');
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
