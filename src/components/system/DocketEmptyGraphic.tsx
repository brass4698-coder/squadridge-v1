/**
 * Tokenized docket / ledger empty graphic for chart placeholders and bare dashboards.
 * Pure SVG — no raster assets, no glow.
 */
export function DocketEmptyGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="160"
      height="96"
      viewBox="0 0 160 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="8"
        y="12"
        width="144"
        height="72"
        rx="6"
        stroke="var(--sr-line)"
        strokeWidth="1.25"
        fill="var(--sr-bg-elevated)"
      />
      <path
        d="M20 28h48M20 36h72M20 44h56"
        stroke="var(--sr-line-strong)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect
        x="108"
        y="52"
        width="10"
        height="20"
        rx="1.5"
        fill="var(--sr-primary)"
        opacity="0.35"
      />
      <rect
        x="122"
        y="44"
        width="10"
        height="28"
        rx="1.5"
        fill="var(--sr-primary)"
        opacity="0.55"
      />
      <rect
        x="136"
        y="36"
        width="10"
        height="36"
        rx="1.5"
        fill="var(--sr-primary)"
        opacity="0.75"
      />
      <circle cx="28" cy="64" r="3" fill="var(--sr-verify)" opacity="0.85" />
      <path
        d="M36 64h40"
        stroke="var(--sr-ink-faint)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
}
