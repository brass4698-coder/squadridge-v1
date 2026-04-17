import { cn } from '../../lib';

export interface TestimonialProps {
  quote: string;
  attribution: string;
  className?: string;
  id?: string;
}

export function Testimonial({
  quote,
  attribution,
  className,
  id = 'testimonial-quote',
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
          className="font-heading text-[clamp(1.3rem,2.2vw,1.5rem)] font-medium leading-[1.5] text-landing-quote"
        >
          {quote}
        </p>
      </blockquote>
      <figcaption className="mt-6 font-heading text-[0.75rem] font-medium uppercase tracking-[0.1em] text-landing-attribution">
        — {attribution}
      </figcaption>
    </figure>
  );
}
