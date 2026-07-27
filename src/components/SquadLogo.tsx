import type { CSSProperties } from 'react';

const ICON_SVG = '/assets/squadridge-icon.svg';
const ICON_PNG = '/assets/squadridge-mark.png';

export interface LogoProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Decorative mark in nav/onboarding — hide from assistive tech when paired with wordmark. */
  'aria-hidden'?: boolean | 'true' | 'false';
}

/** SquadRidge mark — split diamond vault (symbolic logo). */
export function SquadLogo({ size = 34, className, style, 'aria-hidden': ariaHidden }: LogoProps) {
  return (
    <img
      src={ICON_SVG}
      alt=""
      role="presentation"
      width={size}
      height={size}
      aria-hidden={ariaHidden}
      className={
        className ? `block shrink-0 object-contain ${className}` : 'block shrink-0 object-contain'
      }
      style={style}
      decoding="async"
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.includes('squadridge-mark.png')) {
          img.src = ICON_PNG;
        }
      }}
    />
  );
}

export default SquadLogo;
