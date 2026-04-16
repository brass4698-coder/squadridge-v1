import { useReducedMotion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

/** Shared motion presets; respects `prefers-reduced-motion`. */
export function useOnboardingMotion() {
  const reduced = useReducedMotion();

  return {
    reduced: Boolean(reduced),
    /** Step root enter (opacity + optional y). */
    stepTransition: { duration: reduced ? 0.01 : 0.35, ease },
    /** Subtle vault-style slide + lift (no numbers on chrome; motion carries the cue). */
    stepInitial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12, x: reduced ? 0 : 14 },
    stepAnimate: { opacity: 1, y: 0, x: 0 },
    stepExit: { opacity: reduced ? 1 : 0, y: reduced ? 0 : -10, x: reduced ? 0 : -12 },
    /** Inner blocks (badges, subtitles). */
    fadeTransition: (delay = 0) => ({
      delay: reduced ? 0 : delay,
      duration: reduced ? 0.01 : 0.35,
    }),
    /** Title line. */
    titleTransition: (delay = 0) => ({
      delay: reduced ? 0 : delay,
      duration: reduced ? 0.01 : 0.4,
    }),
    /** Timeline row stagger multiplier. */
    staggerDelay: (base: number, index: number, step = 0.08) =>
      reduced ? 0 : base + index * step,
    /** Timeline item y nudge. */
    itemY: reduced ? 0 : 6,
    itemDuration: reduced ? 0.01 : 0.4,
    footerY: reduced ? 0 : 6,
  };
}
