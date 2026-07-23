import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface SlowDownOverlayProps {
  open: boolean;
  onComplete?: () => void;
}

/**
 * Calm full-viewport breath overlay for Power of Pause.
 * Respects prefers-reduced-motion — shows a static panel instead of pulsing.
 */
export function SlowDownOverlay({ open, onComplete }: SlowDownOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {open ? (
        <motion.div
          key="slow-down"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="slow-down-title"
          aria-describedby="slow-down-desc"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color-mix(in_oklab,var(--sr-bg)_88%,transparent)] px-6 backdrop-blur-sm"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="max-w-md text-center">
            <motion.div
              className="mx-auto mb-6 h-16 w-16 rounded-full border border-brand/40 bg-brand/10"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={
                reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
              aria-hidden
            />
            <h2 id="slow-down-title" className="font-display text-fluid-2xl font-semibold text-ink">
              Slow down
            </h2>
            <p id="slow-down-desc" className="mt-3 text-fluid-base leading-relaxed text-ink-muted">
              Take a breath. Sending will pause briefly so the room can stay measured.
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
