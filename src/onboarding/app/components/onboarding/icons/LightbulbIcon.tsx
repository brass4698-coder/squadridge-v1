import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LightbulbIcon({
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
      {/* Bulb */}
      <path
        fill="none"
        d="M24 9C19.6 9 16 12.6 16 17C16 19.6 17.2 21.9 19.1 23.4C20.3 24.4 20.9 25.4 21.2 26.5H26.8C27.1 25.4 27.7 24.4 28.9 23.4C30.8 21.9 32 19.6 32 17C32 12.6 28.4 9 24 9Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <path
        fill="none"
        d="M21.5 26.5H26.5V29C26.5 30.4 25.4 31.5 24 31.5C22.6 31.5 21.5 30.4 21.5 29V26.5Z"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Base */}
      <rect
        x={20}
        y={31.5}
        width={8}
        height={3}
        rx={1.2}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
      />
      <line
        x1={21}
        y1={35.5}
        x2={27}
        y2={35.5}
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
