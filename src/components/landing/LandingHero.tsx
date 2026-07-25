import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '../SectionLabel';
import { AudiencePathStrip } from './AudiencePathStrip';
import { FigureFrame } from '../shared/FigureFrame';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { CTA, SITE_NICHE } from '../../data/siteMessaging';

/**
 * Landing hero — one composition: brand category, promise, CTAs, product figure.
 * Trust rails and doctrine live further down the page — not restated here.
 */
export function LandingHero() {
  return (
    <section
      className="sr-section-enter scroll-mt-20 border-b border-line pt-24 pb-16 md:pt-32 md:pb-20"
      data-scroll-section
    >
      <div className={publicShellInnerClass}>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
          <div className="sr-align-content min-w-0 max-w-[36rem]">
            <SectionLabel className="!mb-3">Private deliberation infrastructure</SectionLabel>
            <h1
              className="mt-0 max-w-[22ch] text-left font-display text-display font-medium leading-[1.05] tracking-tight text-ink"
              data-demo="landing-hero"
            >
              Facilitator-led written rooms for resolving high-stakes internal conflict
            </h1>
            <p className="mt-5 max-w-[32rem] text-left text-[length:var(--sr-text-lead)] leading-[1.6] text-ink-secondary">
              Produce a releasable outcome from a sensitive process — without turning the room into
              the record.
            </p>
            <p className="mt-4 mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-faint">
              {SITE_NICHE}
            </p>
            <div className="sr-cta-row mt-8 justify-start">
              <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--primary">
                {CTA.primaryLabel}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <a
                href={CTA.secondaryExploreHref}
                className="btn-institutional btn-institutional--ghost"
              >
                {CTA.secondaryExploreLabel}
              </a>
            </div>
            <p className="mt-3 mb-0 max-w-[28rem] text-xs leading-relaxed text-ink-faint">
              Manual fit review — not instant self-serve signup.
            </p>
            <AudiencePathStrip />
          </div>

          <FigureFrame shadowed>
            <img
              src="/assets/landing-hero-release.png"
              alt="Private documents become a verified released record through a controlled release gate"
              width={1024}
              height={1024}
              className="block h-auto w-full"
              decoding="async"
              fetchPriority="high"
            />
          </FigureFrame>
        </div>
      </div>
    </section>
  );
}
