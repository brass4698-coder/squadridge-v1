import type { IconProps } from './iconProps';
import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

/** Nodes, encrypted links, shield + lock — e.g. optional tooling / network layer. */
export function NodesShieldIcon({ size = 48, color = ACCENT_AMBER, className }: IconProps) {
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
      <circle cx="8.5" cy="24" r="3" stroke="currentColor" strokeWidth={sw} />
      <circle cx="39.5" cy="24" r="3" stroke="currentColor" strokeWidth={sw} />
      <line
        x1="11.5"
        y1="24"
        x2="18"
        y2="24"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      <line
        x1="36.5"
        y1="24"
        x2="30"
        y2="24"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      <path
        d="M 24 12 L 18.5 14 L 18.5 23 C 18.5 27.5 21 31 24 33 C 27 31 29.5 27.5 29.5 23 L 29.5 14 Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="21" y="21.5" width="6" height="6.5" rx="0.5" stroke="currentColor" strokeWidth={sw} />
      <path
        d="M 22 21.5 L 22 19.5 C 22 18.5 22.5 17.5 24 17.5 C 25.5 17.5 26 18.5 26 19.5 L 26 21.5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
