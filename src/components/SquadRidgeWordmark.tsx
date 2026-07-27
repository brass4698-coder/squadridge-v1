import type { HTMLAttributes } from 'react';
import { SquadLogo } from './SquadLogo';

export type SquadRidgeWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  /** Accessible name when the wordmark is the sole brand signal. Omit when decorative. */
  alt?: string;
  /** Show the “Private Deliberation Infrastructure” line under the name. */
  showTagline?: boolean;
  /** Visual weight for dense nav vs. hero/sign-in. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: {
    name: 'font-heading text-sm font-semibold tracking-[0.04em]',
    tagline: 'text-[0.55rem] font-medium tracking-[0.18em]',
  },
  md: {
    name: 'font-heading text-base font-semibold tracking-[0.04em]',
    tagline: 'text-[0.65rem] font-medium tracking-[0.2em]',
  },
  lg: {
    name: 'font-heading text-lg font-semibold tracking-[0.04em] sm:text-xl',
    tagline: 'text-xs font-medium tracking-[0.2em] sm:text-sm',
  },
} as const;

/**
 * SquadRidge wordmark — CSS typography so it tracks theme ink and product fonts.
 * Two-tone lockup: SQUAD in brand teal, RIDGE in ridge stone.
 * Export SVGs live at `/assets/squadridge-wordmark.svg` and `/assets/squadridge-lockup.svg`.
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
      <span className={`${classes.name} uppercase`}>
        <span className="text-[color:var(--sr-brand-mark)]">Squad</span>
        <span className="text-[color:var(--sr-brand-ridge)]">Ridge</span>
      </span>
      {showTagline ? (
        <span className={`mt-1 uppercase text-ink-secondary ${classes.tagline}`}>
          Private Deliberation Infrastructure
        </span>
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

/**
 * Icon + wordmark lockup for nav, sign-in, and hero brand anchors.
 * Pass `showTagline` only for hero/sign-in moments — omit in nav so the header stays one row.
 */
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
      <span
        className={['inline-flex shrink-0 items-center', className].filter(Boolean).join(' ')}
        {...a11y}
        {...rest}
      >
        <SquadLogo size={markSize[size]} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={['inline-flex shrink-0 items-center gap-2.5 leading-none', className]
        .filter(Boolean)
        .join(' ')}
      {...a11y}
      {...rest}
    >
      <SquadLogo size={markSize[size]} aria-hidden />
      <SquadRidgeWordmark showTagline={showTagline} size={size} />
    </span>
  );
}
