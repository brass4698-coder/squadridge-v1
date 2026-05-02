import type { CSSProperties } from 'react';

const LOGO_SVG = '/assets/squadridge-logo.svg';
const FALLBACK_SVG = '/logo-bridge.svg';

export interface LogoProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Decorative mark in nav/onboarding — hide from assistive tech when paired with wordmark. */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Shield/ridge brand mark (`public/assets/squadridge-logo.svg`), with a minimal
 * bridge SVG fallback.
 *
 * The asset itself wraps a base64-embedded raster. To guarantee no visible
 * border / outer ring shows up in any context, the image is wrapped in an
 * `overflow-hidden` span and slightly oversized so the outermost pixels (where
 * any baked-in stroke would live) are cropped uniformly. This is purely visual
 * — alignment and sizing for callers stay identical.
 */
export function SquadLogo({ size = 34, className, style, 'aria-hidden': ariaHidden }: LogoProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      style={{ width: size, height: size, ...style }}
      className={
        className
          ? `relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`
          : 'relative inline-flex shrink-0 items-center justify-center overflow-hidden'
      }
    >
      <img
        src={LOGO_SVG}
        alt=""
        role="presentation"
        aria-hidden="true"
        decoding="async"
        className="block h-[108%] w-[108%] max-w-none object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.includes('logo-bridge')) {
            img.src = FALLBACK_SVG;
          }
        }}
      />
    </span>
  );
}

export default SquadLogo;
