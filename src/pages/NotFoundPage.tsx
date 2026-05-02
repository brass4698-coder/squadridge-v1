import { Link } from 'react-router-dom';
import { InstitutionalPanel, SectionKicker } from '../components';

export function NotFoundPage() {
  return (
    <section
      className="mx-auto w-full max-w-3xl px-gutter py-16 md:py-24"
      aria-labelledby="not-found-heading"
    >
      <InstitutionalPanel tone="sealed" className="p-8 md:p-10">
        <SectionKicker>Route not found</SectionKicker>
        <h1
          id="not-found-heading"
          className="mb-0 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink"
        >
          This public path is not part of the record.
        </h1>
        <p className="mt-5 max-w-[42rem] font-sans text-[1rem] leading-relaxed text-ink-secondary">
          SquadRidge does not silently translate unknown links into a live page. Return to the
          platform overview, browse the ledger, or review the Security Disclosure.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link to="/" className="btn-primary no-underline">
            Return home
          </Link>
          <Link to="/ledger" className="btn-secondary no-underline">
            Browse ledger
          </Link>
          <Link to="/security" className="btn-secondary no-underline">
            Security Disclosure
          </Link>
        </div>
      </InstitutionalPanel>
    </section>
  );
}
