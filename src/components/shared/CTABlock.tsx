import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface CTABlockProps {
  headline: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
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
  const isCenter = align === 'center';

  return (
    <section
      className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
      aria-label="Call to action"
    >
      <div
        className={`mx-auto flex max-w-2xl flex-col gap-6 ${isCenter ? 'items-center text-center' : 'items-start'}`}
      >
        <h2 className="font-display text-h2 font-medium tracking-tight text-ink">{headline}</h2>
        {body ? <p className="text-sm leading-relaxed text-ink-secondary">{body}</p> : null}
        <div className={`flex flex-wrap gap-4 ${isCenter ? 'justify-center' : ''}`}>
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
    </section>
  );
}
