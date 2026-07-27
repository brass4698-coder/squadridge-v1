/**
 * Loading placeholders for {@link SessionPage} — auth gate and realtime message fetch.
 */
export function SessionPageAuthSkeleton() {
  return (
    <section
      className="session-chat-page mx-auto flex w-full min-w-0 max-w-[680px] flex-1 flex-col gap-6 px-4 pb-16 pt-[72px] sm:px-6 sm:pt-[80px]"
      aria-busy="true"
      aria-label="Loading session"
    >
      <span className="sr-only">Loading session…</span>
      <header className="flex flex-col gap-2">
        <div className="h-[clamp(1.6rem,3vw,2.2rem)] w-[min(12rem,55%)] animate-pulse rounded-md bg-surface-hover/90" />
        <div className="h-3 w-24 animate-pulse rounded bg-surface-hover/70" />
      </header>
      <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-elevated/80 ring-1 ring-line" />
      <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[10px] border border-line bg-surface-elevated">
        <div className="flex shrink-0 justify-end border-b border-line px-4 py-2">
          <div className="h-3 w-14 animate-pulse rounded bg-surface-hover/70" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-6 pt-4">
          <ul className="flex min-h-0 flex-1 flex-col gap-3" aria-hidden>
            <SessionPageMessagesSkeleton count={4} />
          </ul>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-[100px] w-full animate-pulse rounded-[8px] bg-surface-elevated/90 ring-1 ring-line" />
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-[8px] bg-surface-hover/80" />
          <div className="h-10 w-28 animate-pulse rounded-[8px] bg-surface-hover/60" />
        </div>
      </div>
    </section>
  );
}

type SessionPageMessagesSkeletonProps = {
  count?: number;
};

export function SessionPageMessagesSkeleton({ count = 4 }: SessionPageMessagesSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse rounded-lg border border-line bg-surface/50 px-4 py-3">
          <div className="h-3 w-[7rem] rounded bg-surface-hover/90" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full max-w-[22rem] rounded bg-surface-hover/75" />
            <div className="h-3 w-[min(18rem,92%)] rounded bg-surface-hover/55" />
          </div>
        </li>
      ))}
    </>
  );
}
