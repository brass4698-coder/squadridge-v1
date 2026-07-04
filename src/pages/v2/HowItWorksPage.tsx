// ============================================================
// HowItWorksPage — Phase 9 rewrite
//
// Structure per the design critique:
//   1. Short intro that anchors the model (room vs record)
//   2. Compact 4-step visual rail — each step:
//        · one short heading
//        · one plain-language sentence
//        · one reassurance sentence
//   3. Central room-vs-record diagram reused from SplitPanelVisual so the
//      motif from the homepage carries through the site
//   4. FAQ strip with the three highest-leverage questions
//   5. CTA footer
// ============================================================
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, MessageSquare, Settings, ShieldCheck } from 'lucide-react';
import { SectionEyebrow, SplitPanelVisual } from '../../components/marketing/primitives';

// One-line + one reassurance sentence per step. The reassurance sentence
// always answers the implicit question a cautious mediator will ask.
const STEPS = [
  {
    number: '01',
    icon: Settings,
    heading: 'Configure',
    line: 'Set the session rules, participant criteria, and release conditions before dialogue begins.',
    reassure:
      'Nothing about the session is improvised — every rule is captured before invitations go out.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    heading: 'Verify',
    line: 'Confirm each participant privately using your chosen eligibility criteria.',
    reassure: 'Nothing about identity ever appears on the released record.',
  },
  {
    number: '03',
    icon: MessageSquare,
    heading: 'Facilitate',
    line: 'Run the session in a protected environment designed for sensitive, high-stakes exchange.',
    reassure: 'No public transcript is generated at any point during or after the session.',
  },
  {
    number: '04',
    icon: FileCheck,
    heading: 'Release',
    line: 'Release only the approved outcome — with a verification anchor and selected metadata.',
    reassure:
      'The facilitator signs the release; the platform never publishes anything on its own.',
  },
];

const FAQS = [
  {
    q: 'Who can release a record?',
    a: 'Only a session facilitator can trigger release, and only after every required approval has been recorded. The platform will not publish anything on its own — release is always an explicit, signed action.',
  },
  {
    q: 'What stays private, always?',
    a: 'The dialogue itself, participant identities, verification data, facilitator notes, and session signals never leave the room. Only the approved outcome text and a verification anchor are released.',
  },
  {
    q: 'What does the verification anchor prove?',
    a: 'The anchor confirms the integrity of the released record — anyone can verify that the record has not been altered since release, and that it was issued through SquadRidge. It does not expose the private session content.',
  },
  {
    q: 'Can a released record be withdrawn?',
    a: 'Yes. A facilitator or organisation administrator can withdraw a record. The public ledger will show a notice at that record\u2019s ID explaining the withdrawal.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="bg-surface">
      {/* Intro */}
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-20">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h1 className="mt-3 text-h1 md:text-display" style={{ color: 'var(--sr-ink)' }}>
          Four stages. One protected process.
        </h1>
        <p
          className="mt-5 text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--sr-ink) ' }}
        >
          SquadRidge separates the protected session from the verifiable public record.
        </p>
        <p
          className="mt-3 max-w-2xl text-base leading-relaxed"
          style={{ color: 'var(--sr-ink-secondary)' }}
        >
          Every session follows the same lifecycle. Below: the four stages, and what each one
          protects.
        </p>
      </section>

      {/* Room vs record diagram — reinforces the motif from the homepage. */}
      <section
        className="border-t px-6 py-14 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-[1100px]">
          <SplitPanelVisual size="compact" />
        </div>
      </section>

      {/* Step rail */}
      <section
        className="border-t px-6 py-16 md:py-24"
        aria-label="Session lifecycle stages"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="relative">
            {/* Connector line under the numbered nodes on desktop */}
            <div
              aria-hidden
              className="absolute left-6 right-6 top-6 hidden h-px md:block"
              style={{
                background:
                  'linear-gradient(90deg, var(--sr-divider), var(--sr-primary), var(--sr-divider))',
              }}
            />
            <ol className="grid gap-8 md:grid-cols-4">
              {STEPS.map((step) => (
                <li key={step.number} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border font-mono text-xs font-semibold tabular-nums"
                      style={{
                        borderColor: 'color-mix(in oklch, var(--sr-primary) 30%, var(--sr-line))',
                        background: 'var(--sr-bg-elevated)',
                        color: 'var(--sr-primary)',
                      }}
                    >
                      {step.number}
                    </span>
                    <step.icon
                      className="size-4 shrink-0"
                      style={{ color: 'var(--sr-ink-faint)' }}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <h2 className="text-h3" style={{ color: 'var(--sr-ink)' }}>
                    {step.heading}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--sr-ink-secondary)' }}
                  >
                    {step.line}
                  </p>
                  <p
                    className="rounded-md border-l-2 py-1 pl-3 text-xs italic leading-relaxed"
                    style={{
                      borderColor: 'var(--sr-primary)',
                      color: 'var(--sr-ink-secondary)',
                    }}
                  >
                    {step.reassure}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="border-t px-6 py-16 md:py-24"
        style={{ borderColor: 'var(--sr-divider)' }}
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Common questions</SectionEyebrow>
          <h2 id="faq-heading" className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            The three questions we hear most.
          </h2>
          <dl className="mt-10 flex flex-col divide-y" style={{ borderColor: 'var(--sr-divider)' }}>
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="py-6 first:pt-0 last:pb-0"
                style={{ borderColor: 'var(--sr-divider)' }}
              >
                <dt className="text-base font-semibold" style={{ color: 'var(--sr-ink)' }}>
                  {faq.q}
                </dt>
                <dd
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--sr-ink-secondary)' }}
                >
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA footer */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
            Ready to run a protected session?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/request-access" className="btn-pill btn-pill--primary text-sm">
              Request pilot access
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/ledger"
              className="text-xs font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-70"
              style={{ color: 'var(--sr-ink-faint)' }}
            >
              See a sample released record
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
