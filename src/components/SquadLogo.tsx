import type { CSSProperties } from 'react';

const ICON_SVG = '/assets/squadridge-icon.svg';
const ICON_PNG = '/assets/logo.png';

export interface LogoProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Decorative mark in nav/onboarding — hide from assistive tech when paired with wordmark. */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/** SquadRidge mark — three figures at a ridge under a protected circle. */
export function SquadLogo({ size = 34, className, style, 'aria-hidden': ariaHidden }: LogoProps) {
  return (
    <img
      src={ICON_SVG}
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
        if (!img.src.includes('logo.png')) {
          img.src = ICON_PNG;
        }
      }}
    />
  );
}

export default SquadLogo;
