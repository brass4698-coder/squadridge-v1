export function IncidentRoomSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,18rem)]">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[24rem] animate-pulse rounded-lg border border-line bg-surface p-4 motion-reduce:animate-none"
        >
          <div className="h-3 w-20 rounded bg-surface-secondary" />
          <div className="mt-4 h-6 w-2/3 rounded bg-surface-secondary" />
          <div className="mt-6 space-y-3">
            <div className="h-24 rounded bg-surface-secondary/80" />
            <div className="h-24 rounded bg-surface-secondary/70" />
            <div className="h-24 rounded bg-surface-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
