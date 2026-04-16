import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Bidirectional speech bubbles — on-device translation / language exchange. */
export function TranslationIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <rect x="8.5" y="13" width="12" height="10" rx="2.5" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 12 23 L 14.5 26.5 L 17 23"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <rect x="27.5" y="22.5" width="12" height="10" rx="2.5" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 31 32.5 L 33.5 36 L 36 32.5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M 20.5 18 L 27.5 18 M 22.5 16 L 20.5 18 L 22.5 20"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 27.5 27 L 20.5 27 M 25.5 25 L 27.5 27 L 25.5 29"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
