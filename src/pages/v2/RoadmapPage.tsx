import { Link } from 'react-router-dom';
import {
  CTA,
  FOUNDER_NOTE,
  isFounderNotePlaceholder,
  LAUNCH_PLAN_STAGES,
  READINESS_LIVE_TODAY,
  TARGET_PILOT_PROFILES,
} from '../../data/siteMessaging';
import {
  CTABlock,
  FigureFrame,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
} from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

const primaryProfiles = TARGET_PILOT_PROFILES.filter((p) => p.tier === 'primary');
const adjacentProfiles = TARGET_PILOT_PROFILES.filter((p) => p.tier === 'adjacent');

/** Confirmed App.v2 routes — only link what resolves. */
const DILIGENCE_LINKS = [
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Security', href: '/security' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Briefings', href: '/briefings' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About', href: '/about' },
] as const;

/**
 * Go-to-market & readiness — pre-launch plan for diligence readers.
 * Honesty lives in one banner; body copy describes product and hopeful direction.
 */
export function RoadmapPage() {
  usePageTitle('Go-to-market & readiness');
  const founderPlaceholder = isFounderNotePlaceholder(FOUNDER_NOTE);

  return (
    <div data-page="roadmap">
      <MarketingPageHero
        label="Readiness"
        title="Go-to-market & readiness"
        lead={
          <p>
            What ships today, who we hope to serve first, and where we want to take the platform.
            Built for facilitators navigating hard issues with care — see{' '}
            <Link to="/pipeline" className="text-ink-secondary underline-offset-4 hover:underline">
              Pipeline
            </Link>{' '}
            for live-vs-planned posture at a glance.
          </p>
        }
        aside={
          <FigureFrame
            shadowed
            aria-label="Verified vault — integrity before release"
            caption="Integrity before release"
          >
            <img
              src="/assets/gtm-hero-vault.png"
              alt="Faceted vault with a verified checkmark — private deliberation protected until release is deliberate"
              width={1024}
              height={1024}
              className="block h-auto w-full bg-black"
              decoding="async"
              fetchPriority="high"
            />
          </FigureFrame>
        }
        meta={
          <aside
            className="max-w-measure rounded-[var(--sr-radius-lg)] border border-line bg-surface-sunken/50 px-4 py-4 md:px-5"
            role="note"
            aria-label="Pre-pilot status"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-brand/80">
              Pre-pilot status
            </p>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
              We have not run live partner pilots yet. Launch stages below are hopes and direction —
              not completed cohorts. Security limits (including what is still scaffolded) live once
              on{' '}
              <Link to="/security" className="text-brand underline-offset-2 hover:underline">
                Security
              </Link>
              ; this page focuses on who we serve and what already works.
            </p>
          </aside>
        }
      />

      <MarketingSection id="live-today" tone="sunken" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>What&apos;s live today</SectionLabel>
            <h2 id="live-today-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Capabilities you can evaluate now
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              The facilitator spine is built end-to-end in product — rooms, verification, release
              gates, and integrity anchors. Walk the process on{' '}
              <Link
                to="/how-it-works"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                How it works
              </Link>
              .
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {READINESS_LIVE_TODAY.map((item) => (
              <li key={item.title} className="bg-surface-elevated p-5 md:p-6">
                <h3 className="m-0 text-sm font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="pilot-profile" density="default">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>Target pilot profile</SectionLabel>
            <h2 id="pilot-profile-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Who we hope to serve first
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Org shape and pain by segment — aligned with{' '}
              <Link
                to="/use-cases"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Use cases
              </Link>
              . We are looking for facilitators and institutions ready for a scoped, invite-only
              evaluation.
            </p>
          </ProseMeasure>

          <p className="mb-4 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Primary tracks
          </p>
          <ul className="m-0 mb-12 grid list-none gap-px overflow-hidden border border-line bg-line p-0 lg:grid-cols-3">
            {primaryProfiles.map((profile) => (
              <li key={profile.sector} className="bg-surface-elevated p-5 md:p-6">
                <h3 className="m-0 text-sm font-semibold text-ink">{profile.sector}</h3>
                <p className="mt-3 mb-0 text-xs leading-relaxed text-ink-faint">
                  {profile.orgSize}
                </p>
                <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {profile.pain}
                </p>
              </li>
            ))}
          </ul>

          <p className="mb-4 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Adjacent contexts
          </p>
          <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2">
            {adjacentProfiles.map((profile) => (
              <li key={profile.sector} className="border-t border-line pt-4">
                <h3 className="m-0 text-sm font-semibold text-ink">{profile.sector}</h3>
                <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-faint">
                  {profile.orgSize}
                </p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {profile.pain}
                </p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="launch-plan" tone="bordered" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>Launch plan</SectionLabel>
            <h2 id="launch-plan-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Where we want to go
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              A cautious sequence we are working toward. Dates will move with partner fit — we would
              rather earn trust than rush a cohort.
            </p>
          </ProseMeasure>
          <ol className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 md:grid-cols-3">
            {LAUNCH_PLAN_STAGES.map((stage, index) => (
              <li key={stage.id} className="bg-surface-elevated p-5 md:p-6">
                <p className="m-0 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-brand">
                  {String(index + 1).padStart(2, '0')} · {stage.label}
                </p>
                <h3 className="mt-3 mb-0 text-sm font-semibold text-ink">{stage.title}</h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{stage.body}</p>
              </li>
            ))}
          </ol>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="founder-note" density="compact">
        <ShellWidth>
          <ProseMeasure>
            <SectionLabel>Founder note</SectionLabel>
            <h2 id="founder-note-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              From the founder
            </h2>
          </ProseMeasure>
          {founderPlaceholder ? (
            <aside
              className="mt-8 max-w-measure border border-dashed border-line-strong bg-surface-sunken/50 p-6 md:p-8"
              aria-label="Founder note placeholder"
            >
              <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                Founder note not published yet.
              </p>
            </aside>
          ) : (
            <blockquote className="mt-8 mb-0 max-w-measure border-l-2 border-brand pl-5">
              <p className="m-0 text-sm leading-relaxed text-ink-secondary whitespace-pre-wrap">
                {FOUNDER_NOTE}
              </p>
            </blockquote>
          )}
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="related" density="compact" tone="sunken">
        <ShellWidth>
          <ProseMeasure className="mb-6">
            <SectionLabel>Continue diligence</SectionLabel>
            <h2 id="related-h" className="mt-0 font-heading text-h3 font-semibold text-ink">
              Related pages
            </h2>
            <p className="mt-2 mb-0 text-sm text-ink-secondary">
              All links below resolve in the current app. Privacy and Terms are in the site footer.
            </p>
          </ProseMeasure>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {DILIGENCE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="inline-block rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-3 py-1.5 text-sm text-ink-secondary no-underline hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeRoadmap}
        secondaryLabel={CTA.secondaryBriefingLabel}
        secondaryHref={CTA.secondaryBriefingHref}
        statusLine={CTA.pilotStatusLine}
      />
    </div>
  );
}
