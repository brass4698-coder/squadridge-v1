/**
 * useReducedMotion — reads prefers-reduced-motion media query.
 *
 * Returns true when the user has requested reduced motion.
 * Use this to conditionally disable or simplify animations.
 *
 * @example
 * const reduced = useReducedMotion();
 * const variants = reduced ? staticVariants : animatedVariants;
 */
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
