import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OPERATIONAL_CONTEXTS } from '../../data/institutionalHome';
import { flagshipUseCaseId, useCases } from '../../data/useCases';
import { CTA, SITE_THESIS } from '../../data/siteMessaging';
import { CTABlock, UseCaseCard } from '../../components/shared';
import { SectionLabel } from '../../components/SectionLabel';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { contextSlug } from '../../utils/contextSlug';

/** Homepage operational-context labels → matching use-case rows. */
function matchContextAnchor(title: string, sector: string): string | undefined {
  const [mediation, restorative, city, ombuds] = OPERATIONAL_CONTEXTS.slice(0, 4);
  if (title.toLowerCase().includes('land-use')) return contextSlug(mediation.label);
  if (sector.toLowerCase().includes('restorative')) return contextSlug(restorative.label);
  if (sector.toLowerCase().includes('city community')) return contextSlug(city.label);
  if (sector.toLowerCase().includes('ombuds')) return contextSlug(ombuds.label);
  return undefined;
}

/**
 * Use cases — flagship featured as an instrument; others as an index, not a card stack.
 */
export function UseCasesPage() {
  const { hash } = useLocation();
  const flagship = useCases.find((u) => u.title.toLowerCase().includes('land-use')) ?? useCases[0];
  const others = useCases.filter((u) => u !== flagship);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div>
      <header className="border-b border-line pt-16 pb-12 md:pt-20">
        <div className={publicShellInnerClass}>
          <SectionLabel>Operational contexts</SectionLabel>
          <div className="mt-0 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
            <h1 className="max-w-[20ch] font-display text-display font-medium text-ink">
              Same architecture. Different matters.
            </h1>
            <p className="max-w-prose text-sm leading-relaxed text-ink-secondary md:text-base">
              {SITE_THESIS} Flagship practice: civil mediation with a releasable agreement. Other
              contexts reuse the room → gate → record model — not a generic conflict app.
            </p>
          </div>
        </div>
      </header>

      <section
        className="border-b border-line bg-surface-sunken/40 py-12 md:py-16"
        aria-label="Flagship"
      >
        <div className={publicShellInnerClass}>
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-brand">
            Flagship · {flagshipUseCaseId}
          </p>
          <div
            id={contextSlug(OPERATIONAL_CONTEXTS[0].label)}
            className="scroll-mt-20 border border-line"
          >
            <UseCaseCard {...flagship} />
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16" aria-labelledby="index-h">
        <div className={publicShellInnerClass}>
          <h2 id="index-h" className="font-display text-h2 font-medium text-ink">
            Additional contexts
          </h2>
          <p className="mt-2 max-w-prose text-sm text-ink-secondary">
            Compact index — open a row for room / record detail when evaluating fit.
          </p>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {others.map((uc) => {
              const anchor = matchContextAnchor(uc.title, uc.sector);
              return (
                <li key={uc.title} id={anchor} className={anchor ? 'scroll-mt-20' : undefined}>
                  <details className="group" open={Boolean(anchor && hash === `#${anchor}`)}>
                    <summary className="flex cursor-pointer list-none flex-col gap-2 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8 [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                          {uc.sector}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-ink group-open:text-ink">
                          {uc.title}
                        </h3>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-ink-faint group-open:hidden">
                        Expand
                      </span>
                      <span className="hidden shrink-0 font-mono text-xs text-ink-faint group-open:inline">
                        Collapse
                      </span>
                    </summary>
                    <div className="border-t border-line bg-surface-elevated">
                      <UseCaseCard {...uc} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-sm text-ink-faint">
            <Link to="/how-it-works" className="underline-offset-4 hover:underline">
              How the process works
            </Link>
          </p>
        </div>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
