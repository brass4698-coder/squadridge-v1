import { Link } from 'react-router-dom';
import { CTABlock, EvaluatorPath, MarketingSection, SectionLabel } from '../../components/shared';
import { CTA } from '../../data/siteMessaging';
import {
  LedgerProvenancePanel,
  ProtectedThresholdVisual,
  SessionLedgerSchematic,
} from '../../components/institutional';

const FOR_MEDIATORS = [
  'You define who is in the room, when they can speak, and in what format.',
  'You control when (or if) an outcome leaves the room.',
  'You can give parties a verifiable record without exposing raw session content or identities.',
];

const PRINCIPLES = [
  'The room is private by default; outcomes become public only if you approve them.',
  'Facilitators control the full session lifecycle — not the platform.',
  'Participants in high-stakes matters must be verified and eligible for the room.',
  'Public records must be credible; we never publish unapproved content.',
  'We state plainly what the platform does and does not guarantee, so you can set accurate expectations with parties and institutions.',
];

const NEVER_DO = [
  'Publish raw session dialogue or generate a public transcript.',
  'Host video, audio, or real-time calls of any kind.',
  'Auto-release outcomes without a facilitator-initiated action.',
  'Claim end-to-end encryption or legal privilege without engineering and legal sign-off.',
  'Replace professional mediation judgment with automated “decisions.”',
  'Present itself as surveillance, predictive policing, or an early-warning monitoring system.',
];

const MEDIATOR_FIT = [
  'Work on cases where parties need a protected space, but institutions still need a credible outcome record.',
  'Handle multi-party or multi-institution matters where process control and auditability are critical.',
  'Need a way to demonstrate that an outcome was reached through a governed dialogue without exposing who said what in the room.',
];

export function AboutPage() {
  return (
    <div>
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="max-w-xl">
            <SectionLabel text="About" />
            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
              Why we built SquadRidge
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-secondary">
              Most mediation does not fail because people refuse to talk. It fails because the room
              is unsafe, the process is unclear, or the outcome cannot be trusted outside the room.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              SquadRidge is part of the peacetech movement: structured technology that supports
              mediators, community violence prevention work, and institutional coordination — with
              clear limits and without surveillance.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              SquadRidge is structured facilitation infrastructure for high-stakes matters — not a
              general collaboration app and not a monitoring product.
            </p>
          </div>
          <ProtectedThresholdVisual className="w-full lg:max-w-none" />
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-line bg-surface-sunken/30 !py-14">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Architecture for mediators" />
          <h2 className="font-display max-w-2xl text-h2 font-medium tracking-tight text-ink">
            Private session → approval gate → public record
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            We separate “the mediation room” from “the public record” by design. Dialogue stays
            inside a protected session until you, as facilitator, approve an outcome and release it
            with verifiable provenance.
          </p>
          <div className="mt-10">
            <SessionLedgerSchematic />
          </div>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] pt-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex max-w-xl flex-col gap-6 text-sm leading-relaxed text-ink-secondary md:text-base">
            <p>
              SquadRidge addresses a specific gap: there is no purpose-built platform for
              facilitator-led, high-stakes dialogue that combines participant protection, process
              control, and a credible route to a public outcome record.
            </p>
            <p>
              We made a deliberate architectural choice: SquadRidge is a facilitator-led messaging
              room only. There are no video calls, audio sessions, or side-channel chats; all
              protected dialogue happens in structured written rounds under your control. This keeps
              faces, voices, and surroundings out of scope and preserves a clear line between the
              private room and the released record.
            </p>
            <div>
              <p className="font-medium text-ink">For mediators, this means:</p>
              <ul className="mt-3 flex flex-col gap-2">
                {FOR_MEDIATORS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-px w-3 shrink-0 bg-line-strong"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p>
              We are in an early access phase, running a private pilot with municipal community
              safety teams, mediators, and peacebuilding partners. We co-design with pilot mediators
              to make sure the platform fits real casework and institutional constraints before
              broader release.
            </p>
          </div>
          <LedgerProvenancePanel />
        </div>
      </section>

      <section className="border-t border-line px-6 pb-[var(--space-section)] pt-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Platform principles for practice" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            What we optimize for
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {PRINCIPLES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                <span aria-hidden className="mt-2 inline-block h-px w-3 shrink-0 bg-line-strong" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-ink-faint">
            These principles are intended to complement, not replace, your existing codes of ethics
            and professional standards.
          </p>
        </div>
      </section>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Honest boundaries" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            What we will never ask you to rely on
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            These are architectural commitments, not marketing language. The{' '}
            <Link to="/security" className="text-ink underline-offset-4 hover:underline">
              Security overview
            </Link>{' '}
            documents the full trust model.
          </p>
          <p className="mt-4 text-sm font-medium text-ink">SquadRidge will never:</p>
          <ul className="mt-4 flex flex-col gap-3">
            {NEVER_DO.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                <span aria-hidden className="mt-0.5 shrink-0 text-ink-faint">
                  ×
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-ink-faint">
            Our aim is to give you infrastructure you can explain to parties and institutions
            without overstating protection or guarantees.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-surface-sunken/40 px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="If you are a mediator" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            When SquadRidge may fit your practice
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            You might consider SquadRidge if you:
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {MEDIATOR_FIT.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                <span aria-hidden className="mt-2 inline-block h-px w-3 shrink-0 bg-line-strong" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-ink-secondary">
            The platform is not a replacement for your craft. It is infrastructure that gives your
            process a clear, verifiable boundary between{' '}
            <span className="font-medium text-ink">protected session</span> and{' '}
            <span className="font-medium text-ink">released outcome</span>.
          </p>
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Recommended path for mediators" />
          <h2 className="mb-8 font-display max-w-2xl text-h2 font-medium tracking-tight text-ink">
            From model to pilot intake
          </h2>
          <EvaluatorPath current="understand" />
        </div>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryUseCases}
        secondaryHref={CTA.secondaryUseCasesHref}
      />
    </div>
  );
}
