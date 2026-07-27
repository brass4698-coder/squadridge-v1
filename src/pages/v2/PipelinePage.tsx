import { Link } from 'react-router-dom';
import { CTA, formatPipelineMetric, PIPELINE_METRICS } from '../../data/siteMessaging';
import {
  CTABlock,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
  SpecimenNotice,
} from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

const PIPELINE_ROWS = [
  {
    key: 'livePilots' as const,
    label: 'Live pilots',
    description: 'Facilitator-led private pilots running in production today.',
  },
  {
    key: 'activeConversations' as const,
    label: 'Active conversations',
    /** Placeholder token: {{ACTIVE_CONVERSATIONS}} */
    description: 'Diligence or partnership conversations in flight.',
  },
  {
    key: 'loiCount' as const,
    label: 'Letters of intent',
    /** Placeholder token: {{LOI_COUNT}} */
    description: 'Signed or draft LOIs. Publish only with a source.',
  },
  {
    key: 'waitlistSize' as const,
    label: 'Interest / waitlist',
    /** Placeholder token: {{WAITLIST_SIZE}} */
    description: 'Waitlist or interest-list size when an accurate figure exists.',
  },
] as const;

/**
 * Pipeline / readiness — honest pre-launch state for investors.
 * Never invent customers, LOIs, waitlist counts, logos, or testimonials.
 */
export function PipelinePage() {
  usePageTitle('Pipeline & readiness');

  return (
    <div data-page="pipeline">
      <MarketingPageHero
        slim
        label="Pipeline"
        title="Pipeline & readiness"
        lead={
          <>
            <p>
              Current state: no live pilots yet. This page is readiness and pipeline framing — not a
              customers or traction board. Numbers appear only when sourced; placeholders stay
              unpublished until then.
            </p>
            <p className="mt-3 mb-0 text-sm text-ink-faint">
              Matches About&apos;s{' '}
              <Link
                to="/about#stage"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                no traction claims
              </Link>{' '}
              rule. Product plan lives on{' '}
              <Link to="/roadmap" className="text-ink-secondary underline-offset-4 hover:underline">
                Roadmap
              </Link>
              .
            </p>
          </>
        }
      />

      <MarketingSection id="current-state" tone="sunken" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Current state</SectionLabel>
            <h2 id="current-state-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Pre-launch — no live pilots
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Invite-only access and manual fit review are open. The public ledger carries labelled
              specimens only. We would rather show empty pipeline cells than fabricate adoption.
            </p>
          </ProseMeasure>
          <SpecimenNotice
            heading="Illustrative framing — not published traction"
            className="max-w-measure"
          >
            Categories below may show &quot;—&quot; or &quot;Not published yet&quot; until a real
            figure replaces the placeholder token in site messaging. Do not treat dashes as zero
            except where live pilots is explicitly stated as 0.
          </SpecimenNotice>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="metrics" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>Pipeline metrics</SectionLabel>
            <h2 id="metrics-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              What we will publish when sourced
            </h2>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0">
            {PIPELINE_ROWS.map((row) => {
              const metric = formatPipelineMetric(PIPELINE_METRICS[row.key]);
              return (
                <li
                  key={row.key}
                  className="grid gap-4 bg-surface-elevated px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-6"
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-ink">{row.label}</p>
                    <p className="mt-1.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                      {row.description}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p
                      className="m-0 font-mono text-xl font-semibold tabular-nums tracking-tight text-ink"
                      aria-label={
                        metric.unpublished
                          ? `${row.label}: not published yet`
                          : `${row.label}: ${metric.display}`
                      }
                    >
                      {metric.display}
                    </p>
                    {metric.unpublished ? (
                      <p className="mt-1 mb-0 text-xs text-ink-faint">Not published yet</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 mb-0 max-w-measure text-sm text-ink-faint">
            When figures exist with a citation, replace the{' '}
            <code className="font-mono text-xs text-ink">{'{{…}}'}</code> tokens in{' '}
            <code className="font-mono text-xs text-ink">PIPELINE_METRICS</code> (
            <code className="font-mono text-xs text-ink">src/data/siteMessaging.ts</code>). Until
            then, the site shows dashes — never invented counts, logos, or testimonials.
          </p>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="honesty" tone="bordered" density="compact">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ProseMeasure>
              <SectionLabel>Honesty rule</SectionLabel>
              <h2 id="honesty-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                No traction claims without a source
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                You will not find organisation counts, partner logos, testimonials, or outcome
                statistics fabricated for diligence theatre. When there are, they will arrive with a
                citation — same rule as{' '}
                <Link
                  to="/about#stage"
                  className="text-ink-secondary underline-offset-4 hover:underline"
                >
                  About → Stage
                </Link>
                .
              </p>
            </ProseMeasure>
            <aside className="h-fit border border-line bg-surface-sunken/50 p-6 md:p-8">
              <p className="m-0 text-sm font-semibold text-ink">Related diligence pages</p>
              <ul className="mt-4 mb-0 space-y-3 p-0 list-none">
                <li>
                  <Link
                    to="/roadmap"
                    className="text-sm text-brand underline-offset-4 hover:underline"
                  >
                    Go-to-market & readiness
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-brand underline-offset-4 hover:underline"
                  >
                    Pricing posture
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className="text-sm text-brand underline-offset-4 hover:underline"
                  >
                    Security boundaries
                  </Link>
                </li>
              </ul>
            </aside>
          </div>
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closePipeline}
        secondaryLabel={CTA.secondaryBriefingLabel}
        secondaryHref={CTA.secondaryBriefingHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
