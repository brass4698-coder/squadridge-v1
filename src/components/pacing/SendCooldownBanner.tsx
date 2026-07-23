interface SendCooldownBannerProps {
  remainingMs: number;
  className?: string;
}

/** Calm countdown while Power of Pause send cooldown is active. */
export function SendCooldownBanner({ remainingMs, className = '' }: SendCooldownBannerProps) {
  if (remainingMs <= 0) return null;
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-sr-md border border-line bg-surface-1 px-3 py-2 text-fluid-sm text-ink-muted ${className}`}
    >
      Sending resumes in {seconds}s. The room stays open — you can keep reading.
    </div>
  );
}
