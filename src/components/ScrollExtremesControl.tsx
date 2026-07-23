import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function resolveScrollRoot(): HTMLElement | Window {
  const marked = document.querySelector<HTMLElement>('[data-scroll-root]');
  if (marked && marked.scrollHeight > marked.clientHeight + 8) return marked;
  return window;
}

function readScrollTop(root: HTMLElement | Window): number {
  return root instanceof Window ? root.scrollY : root.scrollTop;
}

function readMaxScroll(root: HTMLElement | Window): number {
  if (root instanceof Window) {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  return Math.max(0, root.scrollHeight - root.clientHeight);
}

function scrollToPos(root: HTMLElement | Window, top: number) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
  if (root instanceof Window) {
    root.scrollTo({ top, behavior });
  } else {
    root.scrollTo({ top, behavior });
  }
}

/**
 * Fixed page extremes control — works for window and authenticated shell scroll roots.
 */
export function ScrollExtremesControl() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const sync = useCallback(() => {
    const root = resolveScrollRoot();
    const y = readScrollTop(root);
    const max = readMaxScroll(root);
    setAtTop(y < 48);
    setAtBottom(max > 0 && y >= max - 48);
    setVisible(max > 320);
  }, []);

  useEffect(() => {
    sync();
    const root = resolveScrollRoot();
    const target: Window | HTMLElement = root;
    target.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    const t = window.setTimeout(sync, 120);
    return () => {
      target.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.clearTimeout(t);
    };
  }, [pathname, sync]);

  if (!visible) return null;

  return (
    <div
      className="sr-scroll-extremes pointer-events-none fixed bottom-6 right-4 z-[60] flex flex-col gap-2 md:bottom-8 md:right-6"
      role="navigation"
      aria-label="Page scroll"
    >
      <button
        type="button"
        className="sr-scroll-extremes__btn pointer-events-auto"
        aria-label="Scroll to top"
        disabled={atTop}
        onClick={() => scrollToPos(resolveScrollRoot(), 0)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="sr-scroll-extremes__btn pointer-events-auto"
        aria-label="Scroll to bottom"
        disabled={atBottom}
        onClick={() => {
          const root = resolveScrollRoot();
          scrollToPos(root, readMaxScroll(root));
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
