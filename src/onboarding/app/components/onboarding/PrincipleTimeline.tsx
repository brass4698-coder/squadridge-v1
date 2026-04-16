import { motion } from 'motion/react';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { IconFrame, type PrincipleIconProps } from './IconFrame';
import { PRINCIPLE_ICON_SIZE } from './tokens';
import { useOnboardingMotion } from './onboardingMotion';

interface PrincipleTimelineProps {
  items: string[];
  /** Optional leading per row (e.g. icon). If omitted for an index, shows 01, 02, … */
  leadings?: (ReactNode | null | undefined)[];
  baseDelay?: number;
}

export function PrincipleTimeline({ items, leadings, baseDelay = 0.5 }: PrincipleTimelineProps) {
  const m = useOnboardingMotion();

  return (
    <div className="relative mb-12 mt-2">
      <div
        className="pointer-events-none absolute top-2 bottom-2 left-5 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-onboarding-accent/45 via-onboarding-accent/20 to-white/10"
        aria-hidden
      />
      <ul className="relative space-y-0">
        {items.map((text, i) => {
          const custom = leadings?.[i];
          const stagger = m.staggerDelay(baseDelay, i, 0.08);
          return (
            <motion.li
              key={i}
              initial={{ opacity: m.reduced ? 1 : 0, y: m.itemY }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: stagger,
                duration: m.itemDuration,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex gap-4 pb-10 last:pb-0"
            >
              <div
                className="relative z-[1] flex shrink-0 items-center justify-center"
                style={{ width: PRINCIPLE_ICON_SIZE, height: PRINCIPLE_ICON_SIZE }}
              >
                {custom && isValidElement(custom) ? (
                  <IconFrame size={PRINCIPLE_ICON_SIZE}>
                    {custom as ReactElement<PrincipleIconProps>}
                  </IconFrame>
                ) : (
                  <div className="relative flex items-center justify-center font-sans text-[11px] font-semibold tabular-nums text-onboarding-accent">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                )}
              </div>
              <p className="min-w-0 flex-1 pt-1.5 font-sans text-[15px] leading-relaxed text-white/70 max-w-prose">
                {text}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
