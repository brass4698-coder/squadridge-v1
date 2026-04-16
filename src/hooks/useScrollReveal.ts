import { useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  /** Intersection ratio threshold 0–1. Default 0.12 */
  threshold?: number;
  /** Root margin passed to IntersectionObserver. Default `0px` */
  rootMargin?: string;
  /** Only fire once when visible. Default true */
  once?: boolean;
}

/**
 * Attach `ref` to an element; `isVisible` becomes true when it enters the viewport.
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.12, rootMargin = '0px', once = true } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
