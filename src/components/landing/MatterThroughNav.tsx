const STAGES = [
  { id: 'stage-room', label: 'Room' },
  { id: 'stage-gate', label: 'Gate' },
  { id: 'stage-record', label: 'Record' },
] as const;

/**
 * Compact in-page navigator for the room → gate → record proof stack.
 * Non-sticky so it does not compete with the public shell header.
 */
export function MatterThroughNav() {
  return (
    <nav
      className="border-b border-line bg-surface-sunken/40"
      aria-label="Follow one matter through the system"
    >
      <div className="mx-auto flex w-full max-w-shell flex-col gap-3.5 px-4 py-3.5 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          Follow one matter through the system
        </p>
        <ul className="m-0 flex list-none items-center gap-2 p-0 sm:gap-3">
          {STAGES.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 sm:gap-3">
              {i > 0 ? (
                <span className="font-mono text-[0.65rem] text-ink-faint" aria-hidden>
                  →
                </span>
              ) : null}
              <a
                href={`#${s.id}`}
                className="sr-interactive rounded-sm border border-line bg-surface-elevated/80 px-3.5 py-1.5 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-secondary no-underline transition-colors hover:border-line-strong hover:text-ink"
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
