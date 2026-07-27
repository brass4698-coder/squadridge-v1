import { useEffect, useState, type CSSProperties } from 'react';

/** Public dir; BASE_URL keeps paths correct for `base`-configured deploys. */
const noiseUrl = `${import.meta.env.BASE_URL}noise.png`;

/**
 * Viewport grain: fixed layer (pointer-events none).
 * Uses normal alpha compositing — `mix-blend-mode: soft-light` was nearly invisible on dark navy.
 * Opacity / tile size / z-index: `--sr-grain-*` in `tokens.css` via `.sr-grain-overlay`.
 * Mount is deferred until idle so noise.png does not compete with first paint / LCP.
 */
const grainBgStyle: CSSProperties = {
  backgroundImage: `url("${noiseUrl}")`,
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function GrainOverlay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as IdleWindow;
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => {
        win.cancelIdleCallback?.(id);
      };
    }
    const timer = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return <div className="sr-grain-overlay" style={grainBgStyle} aria-hidden="true" />;
}
