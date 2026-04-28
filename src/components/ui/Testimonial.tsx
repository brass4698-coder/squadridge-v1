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
        'mx-auto max-w-[40rem] rounded-2xl border border-white/[0.07] bg-[linear-gradient(145deg,rgba(14,20,32,0.65),rgba(8,12,19,0.45))] px-8 py-10 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] sm:px-10 sm:py-12',
        className,
      )}
      aria-labelledby={id}
    >
      <blockquote className="m-0 border-l-[3px] border-teal pl-6">
        <p
          id={id}
          className="font-heading text-[clamp(1.5rem,2.85vw,2.05rem)] font-medium leading-[1.38] tracking-[-0.02em] text-landing-quote"
        >
          {quote}
        </p>
      </blockquote>
      <figcaption
        className={cn(
          'mt-8 font-sans text-[0.78rem] font-normal leading-relaxed text-slate-500',
          attributionVariant === 'sentence'
            ? 'tracking-normal'
            : 'font-heading text-[0.72rem] font-medium uppercase tracking-[0.1em] text-slate-600',
        )}
      >
        — {attribution}
      </figcaption>
    </figure>
  );
}
