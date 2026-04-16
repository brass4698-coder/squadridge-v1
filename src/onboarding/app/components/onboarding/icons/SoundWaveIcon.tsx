import { ACCENT_AMBER, PRINCIPLE_ICON_STROKE_WIDTH } from '../tokens';

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SoundWaveIcon({
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
      <line
        x1="10"
        y1="22"
        x2="10"
        y2="26"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="18"
        x2="17"
        y2="30"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="14"
        x2="24"
        y2="34"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="31"
        y1="18"
        x2="31"
        y2="30"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="22"
        x2="38"
        y2="26"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
