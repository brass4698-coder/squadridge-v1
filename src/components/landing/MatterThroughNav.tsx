const STAGES = [
  { id: 'stage-room', label: 'Room' },
  { id: 'stage-gate', label: 'Gate' },
  { id: 'stage-record', label: 'Record' },
] as const;

/**
 * Compact in-page navigator for the room → gate → record proof stack.
 */
export function MatterThroughNav() {
  return (
    <nav
      className="sticky top-14 z-30 border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/95 backdrop-blur-sm"
      aria-label="Follow one matter through the system"
    >
      <div className="mx-auto flex w-full max-w-shell flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
          Follow one matter through the system.
        </p>
        <ul className="m-0 flex list-none items-center gap-1 p-0 sm:gap-2">
          {STAGES.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1 sm:gap-2">
              {i > 0 ? (
                <span
                  className="font-mono text-[0.65rem] text-[color:var(--color-text-muted)]"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
              <a
                href={`#${s.id}`}
                className="sr-interactive rounded-sm border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-raised)] px-3 py-1.5 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-secondary no-underline transition-colors hover:border-line-strong hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
