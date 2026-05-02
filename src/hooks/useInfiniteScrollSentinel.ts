import { useEffect, type RefObject } from 'react';

/**
 * Wires an `IntersectionObserver` between a scroll-root element and a sentinel
 * placed near the top of the list to drive infinite "load older" pagination.
 *
 * The observer attaches only when there is more data to fetch and re-runs when
 * `watch` changes — pass the rendered list length so the sentinel is
 * re-observed after the DOM settles around new pages.
 */
export function useInfiniteScrollSentinel(opts: {
  rootRef: RefObject<HTMLElement | null>;
  sentinelRef: RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void | Promise<unknown>;
  /** Re-observe trigger (e.g. messages.length). */
  watch: number;
}): void {
  const { rootRef, sentinelRef, hasNextPage, isFetchingNextPage, fetchNextPage, watch } = opts;
  useEffect(() => {
    const root = rootRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: '80px 0px 0px 0px', threshold: 0 },
    );
    io.observe(target);
    return () => io.disconnect();
    // `watch` intentionally listed: when the list grows, re-attach so the
    // sentinel keeps working after React rebinds the ref.
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, watch, rootRef, sentinelRef]);
}
