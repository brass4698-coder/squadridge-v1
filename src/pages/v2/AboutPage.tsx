import { Link } from 'react-router-dom';
import {
  CTABlock,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
} from '../../components/shared';
import { ProtectedThresholdVisual } from '../../components/institutional';
import { CTA, SITE_THESIS_SHORT } from '../../data/siteMessaging';

const THESIS_POINTS = [
  {
    label: 'Private room',
    body: 'Dialogue stays inside a facilitator-governed written session — not a public forum, not a side channel.',
  },
  {
    label: 'Governed release',
    body: 'Nothing leaves the room unless designated approvals and an explicit release action allow it.',
  },
  {
    label: 'Credible record',
    body: 'Only approved outcome text can become a verifiable public record — never a transcript of who said what.',
  },
] as const;

const DIFFERENT = [
  {
    title: 'You set the room',
    body: 'Who enters, when they can speak, and in what format — under your facilitation, not an open feed.',
  },
  {
    title: 'You control release',
    body: 'You decide when — or whether — an outcome leaves the room. The platform cannot publish unilaterally.',
  },
  {
    title: 'Parties get a record without exposure',
    body: 'Institutions can trust an approved outcome while raw session content and identities stay off the ledger.',
  },
  {
    title: 'Written room only',
    body: 'No video, audio, or live calls. Faces and voices stay out of scope by design.',
  },
] as const;

const NEVER_DO = [
  {
    title: 'Publish raw dialogue',
    body: 'No public transcript of the room — aligned with established ombuds practice standards on non-identifying records.',
  },
  {
    title: 'Host calls',
    body: 'No video, audio, or real-time voice.',
  },
  {
    title: 'Auto-release outcomes',
    body: 'Release requires facilitator action.',
  },
  {
    title: 'Overclaim protection',
    body: 'No E2E, legal-privilege, or IOA-certification claims without sign-off.',
  },
  {
    title: 'Replace judgment',
    body: 'Automation does not decide outcomes. Tone signals stay advisory.',
  },
  {
    title: 'Sell surveillance',
    body: 'Not monitoring, scoring, or early-warning product.',
  },
] as const;

/** Stage honesty: what a reader can check, and the numbers we refuse to imply. */
const STAGE = [
  {
    title: 'No traction claims on this site',
    body: 'You will not find organisation counts, partner logos, testimonials, or outcome statistics here, because there are none we can source. When there are, they will arrive with a citation.',
  },
  {
    title: 'The public register is empty on purpose',
    body: 'Every ledger entry today is a labelled specimen. A live entry requires a real session, real approvals, and an organisation choosing publication over a private anchored record.',
  },
  {
    title: 'What is real is the mechanism',
    body: 'Verification before entry, staged facilitation, approvals bound to the exact released wording, and a documented account of what the architecture does not protect against.',
  },
] as const;

const FIT = [
  'Parties need a protected space; institutions still need a credible outcome record.',
  'Multi-party matters where process control and an auditable release path matter.',
  'You need to show a governed dialogue produced an outcome — without exposing who said what.',
] as const;

/**
 * About — human product story: why it exists, thesis, difference, commitments, fit.
 */
export function AboutPage() {
  return (
    <div>
      <MarketingPageHero
        label="About"
        title="Why this exists"
        lead={
          <>
            <p>
              Most mediation does not fail because people refuse to talk. It fails because the room
              is unsafe, the process is unclear, or the outcome cannot be trusted outside the room.
            </p>
            <p className="mt-4 text-sm text-ink-faint">
              People need a private room to resolve hard issues. The public needs a clear outcome,
              not the conversation.
            </p>
          </>
        }
        aside={<ProtectedThresholdVisual className="w-full" />}
        meta={
          <p className="text-sm text-ink-faint">
            Early pilots are invite-only — manual fit review, not open signup.
          </p>
        }
      />
      <MarketingSection id="thesis" tone="sunken" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>Product thesis</SectionLabel>
            <h2 id="thesis-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              {SITE_THESIS_SHORT}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              There was no purpose-built path that combined participant protection, facilitator
              process control, and a credible route to a public outcome record. SquadRidge exists to
              close that gap — carefully, and without overclaiming what the stack can promise today.
              Confidentiality architecture is aligned with established ombuds practice standards
              (independence, impartiality, informality, confidentiality) as a professional benchmark
              — we are not an IOA-certified ombuds office, and we do not invent legal privilege.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-3">
            {THESIS_POINTS.map((point) => (
              <li key={point.label} className="bg-surface-elevated p-5 md:p-6">
                <h3 className="m-0 text-sm font-semibold text-ink">{point.label}</h3>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{point.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="difference" density="default">
        <ShellWidth>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
            <ProseMeasure>
              <SectionLabel>Difference</SectionLabel>
              <h2 id="different-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                Built for facilitators who need both privacy and a record
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Collaboration tools optimise for speed and openness. Monitoring products optimise
                for visibility. Mediators need something else: a protected written room, clear
                process authority, and a way to release only what should leave.
              </p>
            </ProseMeasure>
            <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2">
              {DIFFERENT.map((item) => (
                <li key={item.title} className="border-t border-line pt-4">
                  <h3 className="m-0 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="commitments" tone="bordered" density="compact">
        <ShellWidth>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <SectionLabel>Commitments</SectionLabel>
              <h2 id="commitments-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                What we will never do
              </h2>
            </div>
            <p className="max-w-sm text-sm text-ink-faint md:text-right">
              Architectural limits, not marketing posture. Detail lives on{' '}
              <Link
                to="/security"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Security
              </Link>
              .
            </p>
          </div>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {NEVER_DO.map((item) => (
              <li key={item.title} className="bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="stage" tone="sunken" density="compact">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <ProseMeasure>
              <SectionLabel>Stage</SectionLabel>
              <h2 id="stage-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                Where this actually is
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Early, invite-only, and reviewed by hand. We would rather be told the fit is wrong
                than run a session that should not have happened, so the intake asks about the
                matter before it asks about the organisation.
              </p>
            </ProseMeasure>
            <ul className="m-0 grid list-none gap-px self-start overflow-hidden border border-line bg-line p-0">
              {STAGE.map((item) => (
                <li key={item.title} className="bg-surface-elevated px-5 py-5">
                  <p className="m-0 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="fit" density="compact">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
            <ProseMeasure>
              <SectionLabel>Fit</SectionLabel>
              <h2 id="fit-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                When it may fit
              </h2>
              <ul className="mt-6 space-y-4">
                {FIT.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-ink-faint">
                Infrastructure for your craft — not a replacement for it.
              </p>
            </ProseMeasure>
            <aside className="h-fit border border-line bg-surface-sunken/50 p-6 md:p-8">
              <p className="m-0 text-sm font-semibold text-ink">Early access</p>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
                Private pilots with facilitators, peacebuilding partners, and institutional teams —
                reviewed manually, with an honest fit assessment before broader release.
              </p>
              <p className="mt-5 mb-0">
                <Link
                  to={CTA.secondaryProcessHref}
                  className="text-sm text-brand underline-offset-4 hover:underline"
                >
                  {CTA.secondaryProcess}
                </Link>
              </p>
            </aside>
          </div>
        </ShellWidth>
      </MarketingSection>
      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeAbout}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
        statusLine={CTA.pilotStatusLine}
      />
    </div>
  );
}
