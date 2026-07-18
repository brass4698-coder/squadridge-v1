import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';

/**
 * Abstract threshold / secure-room atmosphere — corridor depth, controlled entry,
 * layered surfaces. No people, no surveillance motifs.
 */
export function ProtectedThresholdVisual({ className = '' }: { className?: string }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Abstract architectural view of a controlled threshold leading to a protected session room"
      className={className}
      aspect="video"
    >
      <svg
        viewBox="0 0 420 300"
        className="h-full w-full max-h-[280px] text-ink-faint"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Civic grid — map-like containment */}
        <g opacity="0.45" stroke="currentColor" strokeWidth="0.5">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h-${i}`} x1="0" y1={24 + i * 28} x2="420" y2={24 + i * 28} />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v-${i}`} x1={20 + i * 34} y1="0" x2={20 + i * 34} y2="300" />
          ))}
        </g>

        {/* Corridor walls — converging planes */}
        <path
          d="M0 300 L140 118 L140 300 Z"
          className="fill-surface-sunken"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.9"
        />
        <path
          d="M420 300 L280 118 L280 300 Z"
          className="fill-surface-sunken"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.9"
        />
        <path
          d="M140 118 L210 72 L280 118 L210 168 Z"
          className="fill-surface-elevated"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Threshold / door frame */}
        <rect
          x="168"
          y="98"
          width="84"
          height="118"
          className="stroke-brand"
          strokeWidth="1.25"
          fill="none"
          opacity="0.85"
        />
        <line
          x1="210"
          y1="98"
          x2="210"
          y2="216"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
        />

        {/* Layered glass / surface planes */}
        <rect
          x="152"
          y="108"
          width="116"
          height="96"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.35"
        />
        <rect
          x="158"
          y="114"
          width="104"
          height="84"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
        />

        {/* Paper stack — document process */}
        <g transform="translate(48, 188)" opacity="0.7">
          <rect
            x="0"
            y="8"
            width="52"
            height="64"
            stroke="currentColor"
            strokeWidth="0.75"
            className="fill-surface-elevated"
          />
          <rect
            x="6"
            y="4"
            width="52"
            height="64"
            stroke="currentColor"
            strokeWidth="0.75"
            className="fill-surface-sunken"
          />
          <rect
            x="12"
            y="0"
            width="52"
            height="64"
            stroke="currentColor"
            strokeWidth="0.75"
            className="fill-surface-elevated"
          />
          <line
            x1="20"
            y1="18"
            x2="56"
            y2="18"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.6"
          />
          <line
            x1="20"
            y1="28"
            x2="50"
            y2="28"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.45"
          />
          <line
            x1="20"
            y1="38"
            x2="54"
            y2="38"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.35"
          />
        </g>

        {/* Record system shelf */}
        <g transform="translate(318, 200)" opacity="0.65">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 14}
              y={40 - i * 6}
              width="10"
              height={48 + i * 4}
              stroke="currentColor"
              strokeWidth="0.6"
              className="fill-surface-sunken"
            />
          ))}
        </g>

        {/* Accent: controlled light at threshold */}
        <ellipse cx="210" cy="150" rx="28" ry="40" className="fill-brand" opacity="0.06" />
      </svg>
    </InstitutionalVisualFrame>
  );
}
