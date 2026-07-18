import type { HTMLAttributes } from 'react';
import { SquadLogo } from './SquadLogo';

export type SquadRidgeWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  /** Accessible name when the wordmark is the sole brand signal. Omit when decorative. */
  alt?: string;
  /** Show the “Facilitator Led Rooms” line under the name. */
  showTagline?: boolean;
  /** Visual weight for dense nav vs. hero/sign-in. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: {
    name: 'font-heading text-sm font-semibold tracking-tight',
    tagline: 'text-[0.65rem] font-medium tracking-wide',
  },
  md: {
    name: 'font-heading text-base font-semibold tracking-tight',
    tagline: 'text-xs font-medium tracking-wide',
  },
  lg: {
    name: 'font-heading text-lg font-semibold tracking-tight sm:text-xl',
    tagline: 'text-sm font-medium tracking-wide',
  },
} as const;

/**
 * SquadRidge wordmark — CSS typography so it tracks theme ink and product fonts.
 * Brand SVG exports with the same copy live at `/assets/squadridge-wordmark.svg`.
 */
export function SquadRidgeWordmark({
  alt,
  className,
  showTagline = false,
  size = 'md',
  ...rest
}: SquadRidgeWordmarkProps) {
  const classes = sizeClasses[size];
  const labelled = Boolean(alt);
  return (
    <span
      className={['inline-flex flex-col leading-none', className].filter(Boolean).join(' ')}
      {...(labelled
        ? { role: 'img' as const, 'aria-label': alt }
        : { 'aria-hidden': true as const })}
      {...rest}
    >
      <span className={classes.name}>SquadRidge</span>
      {showTagline ? (
        <span className={`mt-1 ${classes.tagline}`}>Facilitator Led Rooms</span>
      ) : null}
    </span>
  );
}

export type SquadRidgeLockupProps = HTMLAttributes<HTMLSpanElement> & {
  alt?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Icon only — collapsed chrome still uses SquadLogo alone. */
  markOnly?: boolean;
};

const markSize = { sm: 28, md: 34, lg: 44 } as const;

/** Icon + wordmark lockup for nav, sign-in, and hero brand anchors. */
export function SquadRidgeLockup({
  alt,
  className,
  showTagline = false,
  size = 'md',
  markOnly = false,
  ...rest
}: SquadRidgeLockupProps) {
  const labelled = Boolean(alt);
  const a11y = labelled
    ? ({ role: 'img' as const, 'aria-label': alt } as const)
    : ({ 'aria-hidden': true as const } as const);

  if (markOnly) {
    return (
      <span className={className} {...a11y} {...rest}>
        <SquadLogo size={markSize[size]} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={['inline-flex items-center gap-2.5', className].filter(Boolean).join(' ')}
      {...a11y}
      {...rest}
    >
      <SquadLogo size={markSize[size]} aria-hidden />
      <SquadRidgeWordmark showTagline={showTagline} size={size} />
    </span>
  );
}
