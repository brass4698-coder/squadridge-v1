import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShellWidth } from './SectionLabel';
import { cn } from '../../lib/cn';

export interface CTABlockProps {
  headline: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /**
   * Alignment. Default left.
   * `center` is only valid for short headline-only bands (no long body) —
   * see docs/design/alignment-system.md.
   */
  align?: 'left' | 'center';
}

export function CTABlock({
  headline,
  body,
  primaryLabel = 'Request pilot access',
  primaryHref = '/request-access',
  secondaryLabel,
  secondaryHref,
  align = 'left',
}: CTABlockProps) {
  // Force left when explanatory body is present — centering long copy is forbidden.
  const isCenter = align === 'center' && !body;

  return (
    <section className="border-t border-line py-[var(--space-section)]" aria-label="Call to action">
      <ShellWidth>
        <div
          className={cn(
            'flex max-w-measure flex-col gap-6',
            isCenter ? 'sr-align-cta-center mx-auto' : 'sr-align-cta',
          )}
        >
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">{headline}</h2>
          {body ? (
            <p className="text-sm leading-relaxed text-ink-secondary md:text-base">{body}</p>
          ) : null}
          <div className={cn('sr-cta-row', isCenter && 'justify-center')}>
            <Link to={primaryHref} className="btn-institutional btn-institutional--primary">
              {primaryLabel}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            {secondaryLabel && secondaryHref ? (
              <Link to={secondaryHref} className="btn-institutional btn-institutional--ghost">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </ShellWidth>
    </section>
  );
}
