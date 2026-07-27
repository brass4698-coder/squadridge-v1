export function IncidentRoomSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading incident room"
      className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,18rem)]"
    >
      <span className="sr-only">Loading incident room…</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[24rem] rounded-lg border border-line bg-surface p-4 motion-safe:animate-pulse motion-reduce:animate-none"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-verify/80" aria-hidden />
            <div className="h-3 w-20 rounded bg-surface-secondary" />
          </div>
          <div className="mt-4 h-6 w-2/3 rounded bg-surface-secondary" />
          <div className="mt-6 space-y-3">
            <div className="h-24 rounded bg-surface-secondary/80" />
            <div className="h-24 rounded bg-surface-secondary/70" />
            <div className="h-24 rounded bg-surface-secondary/60" />
          </div>
          <div
            className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-surface-secondary"
            aria-hidden
          >
            <div className="sr-loader__rail-fill relative h-full w-[42%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
