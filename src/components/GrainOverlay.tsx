import type { CSSProperties } from 'react';

/** Public dir; BASE_URL keeps paths correct for `base`-configured deploys. */
const noiseUrl = `${import.meta.env.BASE_URL}noise.png`;

/**
 * Viewport grain: fixed layer on top of the app (pointer-events none).
 * Uses normal alpha compositing — `mix-blend-mode: soft-light` was nearly invisible on dark navy.
 */
const grainStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  /* Below app UI (`App.tsx` wrapper z-10) so CTAs/text are never covered by the grain layer */
  zIndex: 1,
  opacity: 0.048,
  backgroundImage: `url("${noiseUrl}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '176px 176px',
};

export function GrainOverlay() {
  return <div style={grainStyle} aria-hidden="true" />;
}
