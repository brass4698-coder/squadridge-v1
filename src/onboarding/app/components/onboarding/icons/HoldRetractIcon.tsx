import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Pause + retract — Hold / Retract circuit breakers. */
export function HoldRetractIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
  const sw = PRINCIPLE_ICON_STROKE_WIDTH;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
      aria-hidden
    >
      <rect x="16" y="14" width="4.5" height="18" rx="1" stroke="currentColor" strokeWidth={sw} />
      <rect x="27.5" y="14" width="4.5" height="18" rx="1" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 32 36 L 16 36 M 16 36 L 19 33.5 M 16 36 L 19 38.5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
