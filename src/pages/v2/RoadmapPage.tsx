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
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
} from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

const primaryProfiles = TARGET_PILOT_PROFILES.filter((p) => p.tier === 'primary');
const adjacentProfiles = TARGET_PILOT_PROFILES.filter((p) => p.tier === 'adjacent');

/**
 * Go-to-market & readiness — honest pre-launch plan for diligence readers.
 * No fabricated customers, LOIs, waitlist counts, or founder biography.
 */
export function RoadmapPage() {
  usePageTitle('Go-to-market & readiness');
  const founderPlaceholder = isFounderNotePlaceholder(FOUNDER_NOTE);

  return (
    <div data-page="roadmap">
      <MarketingPageHero
        slim
        label="Readiness"
        title="Go-to-market & readiness"
        lead={
          <>
            <p>
              Pre-launch product posture: what ships today, who we are targeting for first pilots,
              and a cautious launch plan. No live pilots yet — see{' '}
              <Link
                to="/pipeline"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Pipeline
              </Link>{' '}
              for current-state honesty.
            </p>
            <p className="mt-3 mb-0 text-sm text-ink-faint">
              Capabilities below match{' '}
              <Link
                to="/how-it-works"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                How it works
              </Link>{' '}
              and{' '}
              <Link
                to="/security"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Security
              </Link>
              . Plan language is aspirational; we do not claim completed cohorts.
            </p>
          </>
        }
      />

      <MarketingSection id="live-today" tone="sunken" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>What&apos;s live today</SectionLabel>
            <h2 id="live-today-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Real capabilities, documented limits
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Shipped mechanism only — not a customer count. Planned work (RFC 3161 timestamps,
              operator-blind room encryption) stays on Security as planned, not live.
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
              Ideal first pilots
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Org shape and pain by segment — aligned with{' '}
              <Link
                to="/use-cases"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Use cases
              </Link>
              . No named organisations or logos.
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
              Three stages — targeting, not claiming
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Cautious timeline language only. Dates and cohort sizes will move with partner fit.
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
              {/* TODO: Replace FOUNDER_NOTE in siteMessaging.ts — do not invent bio or traction. */}
              <p className="m-0 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Placeholder
              </p>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                Founder note not published yet. Replace{' '}
                <code className="font-mono text-xs text-ink">{'{{FOUNDER_NOTE}}'}</code> in{' '}
                <code className="font-mono text-xs text-ink">src/data/siteMessaging.ts</code> with a
                short first-person statement. Do not invent biography, customers, or metrics.
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
