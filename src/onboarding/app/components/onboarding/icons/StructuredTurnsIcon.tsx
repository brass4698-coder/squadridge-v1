import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Three participants — structured turns / equal airtime. */
export function StructuredTurnsIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <circle cx="14" cy="16.5" r="3" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 10.5 31 L 10.5 26.5 C 10.5 24.5 11.5 23 14 23 C 16.5 23 17.5 24.5 17.5 26.5 L 17.5 31"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="16.5" r="3" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 20.5 31 L 20.5 26.5 C 20.5 24.5 21.5 23 24 23 C 26.5 23 27.5 24.5 27.5 26.5 L 27.5 31"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="16.5" r="3" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 30.5 31 L 30.5 26.5 C 30.5 24.5 31.5 23 34 23 C 36.5 23 37.5 24.5 37.5 26.5 L 37.5 31"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
