import { cn } from '../../lib';

export interface TestimonialProps {
  quote: string;
  attribution: string;
  className?: string;
  id?: string;
  /** `caps` matches legacy investor-style labels; `sentence` for readable attributions. */
  attributionVariant?: 'caps' | 'sentence';
}

export function Testimonial({
  quote,
  attribution,
  className,
  id = 'testimonial-quote',
  attributionVariant = 'caps',
}: TestimonialProps) {
  return (
    <figure
      className={cn(
        'mx-auto max-w-copy border-l-[3px] border-teal bg-transparent pl-6 shadow-none',
        className,
      )}
      aria-labelledby={id}
    >
      <blockquote className="m-0">
        <p
          id={id}
          className="font-heading text-[clamp(1.35rem,2.3vw,1.7rem)] font-medium leading-[1.45] text-landing-quote"
        >
          {quote}
        </p>
      </blockquote>
      <figcaption
        className={cn(
          'mt-6 font-heading text-[0.75rem] font-medium text-landing-attribution',
          attributionVariant === 'sentence'
            ? 'normal-case leading-relaxed tracking-normal'
            : 'uppercase tracking-[0.12em]',
        )}
      >
        — {attribution}
      </figcaption>
    </figure>
  );
}
