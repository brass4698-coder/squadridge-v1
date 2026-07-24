/**
 * Prefer an overflow-scrolling `[data-scroll-root]` (authenticated shell);
 * otherwise the window / document viewport.
 */
export function resolveScrollRoot(): HTMLElement | Window {
  const marked = document.querySelector<HTMLElement>('[data-scroll-root]');
  if (marked && marked.scrollHeight > marked.clientHeight + 8) return marked;
  return window;
}

/** IntersectionObserver root: element when shell scrolls, null for viewport. */
export function resolveObserverRoot(): Element | null {
  const root = resolveScrollRoot();
  return root instanceof Window ? null : root;
}

/** Reset window + every marked scroll root to the top (instant). */
export function scrollAllRootsToTop(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelectorAll<HTMLElement>('[data-scroll-root]').forEach((el) => {
    el.scrollTop = 0;
  });
}
