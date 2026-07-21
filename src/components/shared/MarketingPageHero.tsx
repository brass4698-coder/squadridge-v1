import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { MarketingSection, SectionLabel, ShellWidth } from './SectionLabel';

export type MarketingPageHeroProps = {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  /** Extra proof / meta row under actions */
  meta?: ReactNode;
  className?: string;
  /** Slim secondary-page hero (less vertical padding) */
  slim?: boolean;
};

/**
 * Editorial left-aligned marketing hero. Optional aside for threshold visuals.
 */
export function MarketingPageHero({
  label,
  title,
  lead,
  actions,
  aside,
  meta,
  className,
  slim = false,
}: MarketingPageHeroProps) {
  return (
    <MarketingSection
      density={slim ? 'compact' : 'spacious'}
      className={cn(!slim && '!pt-16 md:!pt-24', className)}
    >
      <ShellWidth>
        <div
          className={cn(
            'grid items-start gap-10 lg:gap-14',
            aside ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : '',
          )}
        >
          <div className="min-w-0 max-w-measure text-left">
            <SectionLabel text={label} />
            <h1 className="font-display text-display font-medium text-ink">{title}</h1>
            {lead ? (
              <div className="mt-6 text-base leading-relaxed text-ink-secondary md:text-[length:var(--sr-text-lead,1.0625rem)]">
                {typeof lead === 'string' ? <p>{lead}</p> : lead}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
            {meta ? <div className="mt-10">{meta}</div> : null}
          </div>
          {aside ? <div className="min-w-0 lg:justify-self-end">{aside}</div> : null}
        </div>
      </ShellWidth>
    </MarketingSection>
  );
}
