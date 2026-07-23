import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';
import { LANDING_SLOGAN } from './LandingHero';

export function FinalCta() {
  return (
    <section
      id="request-access-cta"
      aria-labelledby="final-cta-heading"
      className="border-t py-20 lg:py-24"
      style={{
        borderColor: 'var(--color-border)',
        background:
          'linear-gradient(180deg, var(--color-bg) 0%, color-mix(in oklab, var(--color-accent-light) 28%, var(--color-bg)) 100%)',
      }}
    >
      <Reveal className="mx-auto max-w-2xl px-6 text-center">
        <p
          className="mb-4 text-sm font-medium leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {LANDING_SLOGAN}
        </p>
        <h2
          id="final-cta-heading"
          className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
          style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
        >
          Ready for a disciplined pilot conversation.
        </h2>
        <p
          className="mb-8 text-base leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Tell us about your organizational context. We review every request manually and respond
          within 5–7 business days with an honest fit assessment.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/request-access"
            className="inline-flex rounded px-6 py-3 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Request pilot access
          </Link>
          <Link
            to="/security"
            className="inline-flex rounded border px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            Read security model
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
