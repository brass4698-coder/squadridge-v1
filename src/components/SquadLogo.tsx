import type { CSSProperties } from 'react';

const LOGO_PNG = '/assets/logo.png';
const FALLBACK_SVG = '/logo-bridge.svg';

export interface LogoProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Decorative mark in nav/onboarding — hide from assistive tech when paired with wordmark. */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/** Raster bridge mark (`public/assets/logo.png`), with SVG fallback if the PNG is missing. */
export function SquadLogo({ size = 34, className, style, 'aria-hidden': ariaHidden }: LogoProps) {
  return (
    <img
      src={LOGO_PNG}
      alt=""
      role="presentation"
      width={size}
      height={size}
      aria-hidden={ariaHidden}
      className={className ? `object-contain ${className}` : 'object-contain'}
      style={style}
      decoding="async"
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.includes('logo-bridge')) {
          img.src = FALLBACK_SVG;
        }
      }}
    />
  );
}

export default SquadLogo;
