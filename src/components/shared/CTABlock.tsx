import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface CTABlockProps {
  headline: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTABlock({
  headline,
  primaryLabel = 'Request pilot access',
  primaryHref = '/request-access',
  secondaryLabel,
  secondaryHref,
}: CTABlockProps) {
  return (
    <section
      className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
      aria-label="Call to action"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="text-h2 text-ink">{headline}</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to={primaryHref} className="btn-pill btn-pill--primary text-sm">
            {primaryLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          {secondaryLabel && secondaryHref ? (
            <Link
              to={secondaryHref}
              className="text-xs font-medium text-ink-faint underline-offset-4 transition-opacity hover:underline hover:opacity-70"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
