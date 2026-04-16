import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Eye + iris + privacy slash — on-device translation / visibility. */
export function ShieldDialIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
        d="M 8.5 24 C 12.5 16.5 17.5 12.5 24 12.5 C 30.5 12.5 35.5 16.5 39.5 24 C 35.5 31.5 30.5 35.5 24 35.5 C 17.5 35.5 12.5 31.5 8.5 24 Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth={sw} />
      <line x1="12.5" y1="33.5" x2="35.5" y2="14.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
