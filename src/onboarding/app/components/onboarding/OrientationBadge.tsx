interface OrientationBadgeProps {
  label: string;
  /** Quieter labels when the page H1 is the single focal point (e.g. step 1). */
  emphasis?: 'default' | 'supporting';
}

export function OrientationBadge({ label, emphasis = 'default' }: OrientationBadgeProps) {
  if (emphasis === 'supporting') {
    return (
      <header className="mb-2 border-b border-white/[0.06] pb-3">
        <p className="font-sans text-[9px] font-semibold tracking-[0.1em] text-white/40 uppercase">
          Orientation
        </p>
        <h2 className="mt-1 font-display text-[15px] font-semibold leading-snug tracking-tight text-white/70 sm:text-base">
          {label}
        </h2>
      </header>
    );
  }

  return (
    <header className="mb-3 border-b border-white/[0.1] pb-4">
      <p className="font-sans text-[10px] font-semibold tracking-[0.11em] text-white/55 uppercase">
        Orientation
      </p>
      <h2 className="mt-1.5 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
        {label}
      </h2>
    </header>
  );
}
