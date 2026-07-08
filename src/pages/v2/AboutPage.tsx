import { Link } from 'react-router-dom';
import { CTABlock, MarketingSection, SectionLabel } from '../../components/shared';

const PRINCIPLES = [
  'The room is private. Always. The outcome is public only if approved.',
  'Facilitators control the session lifecycle — not the platform.',
  'Participants must be eligible. Verification is required for high-stakes sessions.',
  'Public records must be credible. We do not publish unapproved content.',
  'We state plainly what the platform does and does not guarantee.',
];

const NEVER_DO = [
  'Publish raw session dialogue or generate a public transcript',
  'Host video, audio, or real-time calls of any kind',
  'Auto-release outcomes — release is always facilitator-initiated',
  'Claim end-to-end encryption or legal protection without engineering sign-off',
  'Replace professional mediation judgment with automated decisions',
];

const FOUNDER_MISSION =
  'Some of us learned early that blame travels faster than truth, and that the wrong room can end a conversation before it starts. SquadRidge is the infrastructure we wished existed: a protected space to speak, a structured path forward, and a record people can verify without exposing who was in the room.';

export function AboutPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="About" />
          <h1 className="mb-4 text-h1 text-ink">Why we built SquadRidge</h1>
          <p className="text-base leading-relaxed text-ink-secondary">
            Most dialogue fails not because people are unwilling to talk, but because the conditions
            are wrong — the room is unsafe, the process has no structure, and the outcome is
            unverifiable.
          </p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl flex flex-col gap-6 text-sm leading-relaxed text-ink-secondary md:text-base">
          <p>
            SquadRidge addresses a specific gap: no purpose-built platform for facilitator-led,
            high-stakes dialogue that combines participant protection, process control, and a
            credible path to a public outcome record.
          </p>
          <p>
            We made a deliberate architectural choice: SquadRidge is a facilitator-led messaging
            room only. There are no video calls, audio sessions, or parallel chat surfaces — the
            entire protected dialogue happens in structured written rounds under facilitator
            control. That keeps faces, voices, and surroundings out of the process and preserves a
            clear line between the private room and the released record.
          </p>
          <p>
            SquadRidge is not a collaboration tool. It is structured facilitation infrastructure.
            The session room is private. The approved outcome can be public. Every step between
            those two states is controlled by the facilitator.
          </p>
          <p>
            We are in an early access phase — a private pilot, now inviting mediators and
            peacebuilding teams. We work closely with pilot partners to make sure the platform is
            fit for purpose before broader release.
          </p>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <blockquote className="rounded-lg border border-line bg-surface-elevated p-8">
            <p className="text-base leading-relaxed text-ink md:text-lg">
              &ldquo;{FOUNDER_MISSION}&rdquo;
            </p>
            <footer className="mt-4 text-xs font-medium text-ink-faint">
              — The SquadRidge team
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Platform principles" />
          <h2 className="mt-3 text-h2 text-ink">What we optimise for</h2>
          <ul className="mt-8 flex flex-col gap-3">
            {PRINCIPLES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                <span className="mt-0.5 shrink-0 text-brand">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Honest boundaries" />
          <h2 className="mt-3 text-h2 text-ink">What we will never do</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            These are architectural commitments, not marketing disclaimers.{' '}
            <Link to="/security" className="text-brand hover:underline">
              Security
            </Link>{' '}
            documents the full trust model.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {NEVER_DO.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                <span className="mt-0.5 shrink-0 text-ink-faint" aria-hidden>
                  ×
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABlock
        headline="Join the private pilot."
        secondaryLabel="See use cases"
        secondaryHref="/use-cases"
      />
    </div>
  );
}
