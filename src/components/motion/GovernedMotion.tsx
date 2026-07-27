import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/cn';

const SPRING_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type GovernedPanelProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds — keep small (≤0.08) for calm stagger */
  delay?: number;
};

/**
 * Panel entrance: short fade + slight rise. Apple continuity, SquadRidge calm.
 * Skips motion when prefers-reduced-motion is set.
 */
export function GovernedPanel({ children, className, delay = 0 }: GovernedPanelProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      // Never start at opacity 0 — review tools that pause JS motion would leave content blank.
      initial={reduce ? false : { opacity: 1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay,
        ease: SPRING_SETTLE,
      }}
    >
      {children}
    </motion.div>
  );
}

type GovernedPageProps = {
  children: ReactNode;
  className?: string;
  /** Remount key (usually pathname) so enter motion runs on navigation */
  motionKey?: string;
};

/**
 * Route-level enter: transform-only rise. Never gates paint on opacity.
 */
export function GovernedPage({ children, className, motionKey }: GovernedPageProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={motionKey}
      className={className}
      initial={reduce ? false : { y: 6 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.18,
        ease: SPRING_SETTLE,
      }}
    >
      {children}
    </motion.div>
  );
}

type ApprovalCountProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Tabular approval / count transition — keyed remount for value changes.
 */
export function ApprovalCount({ children, className }: ApprovalCountProps) {
  const reduce = useReducedMotion();
  const key =
    typeof children === 'string' || typeof children === 'number' ? String(children) : undefined;

  return (
    <motion.span
      key={key}
      className={cn('sr-approval-count inline-block tabular-nums', className)}
      initial={reduce ? false : { opacity: 0.35, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </motion.span>
  );
}
