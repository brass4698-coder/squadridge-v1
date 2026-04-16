import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Document with check — e.g. platform-enforced rounds / verification. */
export function CheckmarkIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <path
        d="M 12 9.5 L 12 27.5 L 36 27.5 L 36 15 L 30.5 9.5 Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 30.5 9.5 L 30.5 15 L 36 15"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 17 18 L 21.5 22.5 L 31 13"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity={0.3} />
      <line x1="12" y1="36.5" x2="26" y2="36.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" opacity={0.15} />
    </svg>
  );
}
