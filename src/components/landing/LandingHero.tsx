import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '../SectionLabel';
import { FigureFrame } from '../shared/FigureFrame';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { CTA, SITE_CATEGORY, SITE_MISSION, SITE_NICHE } from '../../data/siteMessaging';

/**
 * Landing hero — one composition: category, mission, CTAs, product figure.
 * Audience tracks and doctrine live further down — not restated here.
 */
export function LandingHero() {
  return (
    <section
      className="sr-section-enter scroll-mt-20 pt-24 pb-16 md:pt-32 md:pb-20"
      data-scroll-section
    >
      <div className={publicShellInnerClass}>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
          <div className="sr-align-content min-w-0 max-w-[36rem]">
            <SectionLabel className="!mb-3">{SITE_CATEGORY}</SectionLabel>
            <h1
              className="mt-0 max-w-[20ch] text-left font-heading text-display font-semibold leading-[1.05] tracking-tight text-ink"
              data-demo="landing-hero"
            >
              A private room for hard issues — and a clear public outcome when resolution is reached
            </h1>
            <p className="mt-5 max-w-[32rem] text-left text-[length:var(--sr-text-lead)] leading-[1.6] text-ink-secondary">
              {SITE_MISSION}
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
