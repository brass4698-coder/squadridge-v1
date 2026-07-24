import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '../SectionLabel';
import { TrustStrip } from './TrustStrip';
import { AudiencePathStrip } from './AudiencePathStrip';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { CTA } from '../../data/siteMessaging';

const TRUST_RAIL = [
  'Private session room',
  'Facilitator-governed release',
  'Approved outcomes only',
  'Verifiable public record',
] as const;

/**
 * Landing hero — institutional category claim, diligence CTAs, audience framing.
 */
export function LandingHero() {
  return (
    <section
      className="sr-section-enter scroll-mt-20 border-b border-line pt-24 pb-20 md:pt-32 md:pb-28"
      data-scroll-section
    >
      <div className={publicShellInnerClass}>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
          <div className="sr-align-content min-w-0 max-w-[36rem]">
            <SectionLabel className="!mb-2">Private deliberation infrastructure</SectionLabel>
            <p className="mb-5 m-0 max-w-[28rem] text-left font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Invite-only · Private written room · Approved outcomes only
            </p>
            <h1
              className="mt-0 max-w-[22ch] text-left font-display text-display font-medium leading-[1.05] tracking-tight text-ink"
              data-demo="landing-hero"
            >
              Facilitator-led written rooms for resolving high-stakes internal conflict
            </h1>
            <p className="mt-5 mb-0 max-w-[32rem] text-sm font-medium leading-relaxed text-ink md:text-[length:var(--sr-text-lead)]">
              Built with peacebuilders, foundations, and ombuds in mind.
            </p>
            <p className="mt-4 max-w-[32rem] text-left text-[length:var(--sr-text-lead)] leading-[1.65] text-ink-secondary">
              For foundations, NGOs, boards, executive teams, HR and ombuds offices, and
              facilitators who need a private written room — and a governed way to release only what
              was approved.
            </p>
            <p className="mt-6 text-base font-semibold leading-relaxed tracking-tight text-ink">
              No transcript. No open feed. No auto-publish.
            </p>
            <p className="mt-8 mb-0 max-w-[30rem] text-sm leading-relaxed text-ink-secondary">
              Reduce reputational risk while still creating a verifiable integrity record.
            </p>
            <div className="mt-8 flex flex-wrap justify-start gap-3">
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
              Access is reviewed manually. Next step is a fit review and briefing — not instant
              self-serve signup.
            </p>
            <p className="mt-4 mb-0">
              <a
                href="#why"
                className="text-sm font-medium text-brand no-underline underline-offset-4 hover:underline"
              >
                Why SquadRidge →
              </a>
            </p>
            <AudiencePathStrip />
            <div className="mt-10">
              <TrustStrip items={TRUST_RAIL} />
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[var(--sr-radius-lg)] border border-line bg-[var(--sr-bg-sunken)] shadow-[var(--sr-shadow-sm)]">
            <img
              src="/assets/landing-hero-release.png"
              alt="Private documents become a verified released record through a controlled release gate"
              width={1024}
              height={1024}
              className="block h-auto w-full"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
