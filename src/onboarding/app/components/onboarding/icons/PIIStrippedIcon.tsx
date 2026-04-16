import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** User + shield + removal — device-side redaction / PII stripped. */
export function PIIStrippedIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <circle cx="24" cy="16.5" r="4.5" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 15 32 L 15 28 C 15 25.5 18 23 24 23 C 30 23 33 25.5 33 28 L 33 32"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 24 10 L 18.5 12 L 18.5 18 C 18.5 21 20.5 23.5 24 25 C 27.5 23.5 29.5 21 29.5 18 L 29.5 12 Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="31.5" y1="29.5" x2="36.5" y2="34.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="31.5" y1="34.5" x2="36.5" y2="29.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
