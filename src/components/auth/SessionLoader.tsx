// ============================================================
// SessionLoader — lightweight dark placeholder (app routes only)
// ============================================================

/**
 * Shown while auth initializes on gated app routes.
 * Public marketing bypasses AuthGate so this is not a full-site blank frame.
 */
export function SessionLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-dvh flex-col bg-surface"
    >
      <div className="border-b border-line px-gutter py-4">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4">
          <div className="h-5 w-28 rounded-sm bg-surface-sunken" aria-hidden />
          <div className="hidden gap-3 sm:flex" aria-hidden>
            <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
            <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
            <div className="h-3 w-16 rounded-sm bg-surface-sunken" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-shell flex-1 flex-col gap-4 px-gutter py-16">
        <span className="sr-only">Loading session…</span>
        <div
          className="h-3 w-24 rounded-sm bg-surface-sunken motion-safe:animate-pulse"
          aria-hidden
        />
        <div
          className="h-8 w-2/3 max-w-md rounded-sm bg-surface-sunken motion-safe:animate-pulse"
          aria-hidden
        />
        <div
          className="mt-4 h-24 w-full max-w-xl rounded-[var(--sr-radius-md)] bg-surface-sunken/70 motion-safe:animate-pulse"
          aria-hidden
        />
        <p className="mt-6 text-sm text-ink-secondary">Loading…</p>
      </div>
    </div>
  );
}
