import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Optional AI nudges / toggle metaphor — Step 4 principle row (matches Lightbulb / SoundWave / Timeboxed pattern). */
export function AIOptionalNudgesIcon({
  size = 48,
  color = ACCENT_AMBER,
  className,
}: IconProps) {
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
      {/* Light bulb */}
      <circle cx="24" cy="16" r="5.5" stroke="currentColor" strokeWidth={sw} />
      <line x1="24" y1="21.5" x2="24" y2="25" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="21.5" y1="27.5" x2="26.5" y2="27.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />

      {/* Sparkles */}
      <path
        d="M 12 12 L 12 16 M 10 14 L 14 14"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <path
        d="M 36 12 L 36 16 M 34 14 L 38 14"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Toggle switch */}
      <rect
        x="17"
        y="33.5"
        width="14"
        height="5.5"
        rx="2.75"
        stroke="currentColor"
        strokeWidth={sw}
      />
      <circle cx="20.5" cy="36.25" r="1.75" fill="currentColor" />
    </svg>
  );
}
