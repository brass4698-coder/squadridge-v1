/**
 * Product evidence — what a pilot partner can diligence today.
 */
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { PARTNER_EVALUATION } from '../../data/siteMessaging';

export function ProductEvidenceCluster() {
  return (
    <section
      className="border-b border-line bg-[color:var(--sr-bg-sunken)]/40 py-14 md:py-16"
      data-scroll-section
      aria-labelledby="evidence-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[40rem]">
          <SectionLabel className="!mb-2">Partner diligence</SectionLabel>
          <h2
            id="evidence-h"
            className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
          >
            What partners can evaluate
          </h2>
          <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
            A scoped pilot exposes operational controls — entry, release, audit export, integrity
            anchor — not a speculative roadmap.
          </p>
        </div>
        <ul className="mt-8 m-0 grid list-none gap-x-8 gap-y-0 border-y border-line p-0 sm:grid-cols-2">
          {PARTNER_EVALUATION.map((item, index) => (
            <li
              key={item}
              className={`py-4 text-sm leading-relaxed text-ink ${
                index > 0 ? 'border-t border-line' : ''
              } ${index === 1 ? 'sm:border-t-0' : ''} ${
                index % 2 === 1 ? 'sm:border-l sm:pl-8' : ''
              } ${index >= 2 ? 'sm:border-t' : ''}`}
            >
              <span className="mr-3 font-mono text-[length:var(--text-label)] text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
