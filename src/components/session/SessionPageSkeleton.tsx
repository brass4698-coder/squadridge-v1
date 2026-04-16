/**
 * Loading placeholders for {@link SessionPage} — auth gate and realtime message fetch.
 */
export function SessionPageAuthSkeleton() {
  return (
    <section
      className="session-chat-page mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-6 px-6 pb-16 pt-[80px]"
      aria-busy="true"
      aria-label="Loading session"
    >
      <span className="sr-only">Loading session…</span>
      <header className="flex flex-col gap-2">
        <div className="h-[clamp(1.6rem,3vw,2.2rem)] w-[min(12rem,55%)] animate-pulse rounded-md bg-[#1a2236]/90" />
        <div className="h-3 w-24 animate-pulse rounded bg-[#1a2236]/70" />
      </header>
      <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-[#0f1623]/80 ring-1 ring-[#1a2236]/80" />
      <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[10px] border border-[#1a2236] bg-[#0f1623]">
        <div className="flex shrink-0 justify-end border-b border-[#1a2236] px-4 py-2">
          <div className="h-3 w-14 animate-pulse rounded bg-[#1a2236]/70" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-6 pt-4">
          <ul className="flex min-h-0 flex-1 flex-col gap-3" aria-hidden>
            <SessionPageMessagesSkeleton count={4} />
          </ul>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-[100px] w-full animate-pulse rounded-[8px] bg-[#0f1623]/90 ring-1 ring-[#1a2236]/80" />
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-[8px] bg-[#1a2236]/80" />
          <div className="h-10 w-28 animate-pulse rounded-[8px] bg-[#1a2236]/60" />
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
        <li
          key={i}
          className="animate-pulse rounded-lg border border-[#1a2236] bg-[#0b0f14]/50 px-4 py-3"
        >
          <div className="h-3 w-[7rem] rounded bg-[#1a2236]/90" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full max-w-[22rem] rounded bg-[#1a2236]/75" />
            <div className="h-3 w-[min(18rem,92%)] rounded bg-[#1a2236]/55" />
          </div>
        </li>
      ))}
    </>
  );
}
