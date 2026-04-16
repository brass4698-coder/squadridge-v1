import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Clock + progress arc — time-boxed rounds (semantic inner dial; no outer decorative ring). */
export function TimeboxedRoundsIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth={sw} />
      <line x1="24" y1="24" x2="24" y2="17.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="24" y1="24" x2="28.5" y2="24" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <path
        d="M 24 11.5 A 12.5 12.5 0 0 1 36.5 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" />
    </svg>
  );
}
