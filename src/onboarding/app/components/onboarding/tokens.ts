/**
 * Onboarding palette — keep in sync with `--color-onboarding-*` in src/styles/theme.css @theme inline.
 */
export const ONBOARDING_BG = '#0a0f1a';
export const ONBOARDING_CARD = '#0c1219';

/** Progress bar, step dots, principle icons — one hex everywhere. */
export const ACCENT_AMBER = '#C9A66B';

/** For rgba() in TS when needed (shadows, overlays). */
export const ACCENT_AMBER_RGB = '201, 166, 107';

/** Principle row icon canvas (~15% smaller than the previous 47px). */
export const PRINCIPLE_ICON_SIZE = 40;

/**
 * Principle icon stroke width in SVG user units. Thinner than 3 so large strokes read closer
 * to the 2px progress bar while using the same ACCENT_AMBER.
 */
export const PRINCIPLE_ICON_STROKE_WIDTH = 2 as const;
