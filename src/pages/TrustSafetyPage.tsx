import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Fingerprint, Lock, ScaleIcon } from 'lucide-react';
import { PageHero, SectionBand, SectionIntro, StatusDot } from '../components';

/**
 * TrustSafetyPage — narrative wrapper for the platform's safety architecture.
 *
 * Phase 1 ships four anchor sections that summarize identity modes,
 * governance and moderation, data handling, and consent checkpoints, and
 * point into the existing `/security`, `/settings/safety`, and admin
 * surfaces where the underlying implementation lives. Phase 2 will fold
 * moderator-only governance metrics into the `#governance` section.
 */

const ANCHORS = [
  { href: '#identity', label: 'Identity modes', Icon: Fingerprint },
  { href: '#governance', label: 'Governance', Icon: ScaleIcon },
  { href: '#data', label: 'Data handling', Icon: Database },
  { href: '#consent', label: 'Consent checkpoints', Icon: Lock },
] as const;

const IDENTITY_MODES = [
  {
    label: 'Verified',
    body: 'Eligibility is proven once via a Semaphore-backed attestation. Inside the room, only "you are eligible" travels with you — your real identity does not.',
    tradeoff:
      'Strongest accountability for facilitators; participants still see no identity unless they choose to.',
  },
  {
    label: 'Pseudonymous',
    body: 'Eligibility plus a stable handle inside the cohort. Continuity exists across sessions but no external identity is exposed.',
    tradeoff: 'Best balance for ongoing cohorts. A leaked handle reveals only in-room continuity.',
  },
  {
    label: 'Anonymous',
    body: 'No persistent handle in-room. Useful when even a pseudonym carries cost outside the room (e.g. unit-level processing or border-crossing dialogue).',
    tradeoff: 'No continuity across sessions; some flows (DMs, follow-ups) are unavailable.',
  },
] as const;

const GOVERNANCE_RAILS = [
  {
    label: 'Pre-room norms',
    body: 'Facilitators set room boundaries, eligibility criteria, and release format before opening. Participants accept these norms before entry.',
  },
  {
    label: 'Live moderation',
    body: 'Trained moderators have pause, slow-down, and escalate actions. The status strip in authenticated views shows current moderation health.',
  },
  {
    label: 'Escalation paths',
    body: 'Severity-2 events route to a designated reviewer; severity-3 events trigger a same-day human callback in addition to platform action.',
  },
  {
    label: 'Jurisdictional notes',
    body: 'Cross-border cohorts inherit the strictest applicable jurisdiction for retention and disclosure unless the facilitator specifies otherwise.',
  },
] as const;

const DATA_NOTES = [
  {
    label: 'In-room',
    body: 'No persistent transcript. Messages are encrypted at the application layer per the threat model. Only facilitator-approved consensus leaves the room.',
  },
  {
    label: 'Released',
    body: 'Public records are anonymous, timestamped, and structurally separate from any room artifact. A leaked snippet does not produce a citable result.',
  },
  {
    label: 'Operational',
    body: 'Server-side logs retain only what is required to operate the platform (auth, rate-limiting, moderation actions). PII is minimized by design.',
  },
] as const;

const CONSENT_CHECKPOINTS = [
  'Pre-room: norms acceptance and identity-mode selection.',
  'In-room: explicit consent prompts before any release-eligible artifact is created.',
  'Post-session: facilitator and participant review of what is proposed for release.',
  'Pre-publish: final approval gate before a record is published to the ledger.',
] as const;

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <SectionIntro
        id={`${id}-heading`}
        eyebrow={eyebrow}
        title={title}
        className="[&_h2]:mt-2 [&_h2]:text-[clamp(1.3rem,1.8vw,1.6rem)] [&_h2]:tracking-[-0.015em]"
      />
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function TrustSafetyPage() {
  return (
    <>
      <SectionBand tone="navy">
        <PageHero eyebrow="Trust & Safety" title="The safety architecture, in plain terms.">
          <p>
            For revolutionary cross-border dialogue, design must communicate safety, neutrality, and
            procedural fairness before anything else. Here is how identity, governance, data, and
            consent work on this platform — and where in the product the controls live.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <StatusDot state="live">Moderation live</StatusDot>
            <StatusDot state="live">Verification healthy</StatusDot>
          </div>
        </PageHero>

        <nav aria-label="Trust & Safety sections" className="mt-8 flex flex-wrap gap-2">
          {ANCHORS.map((a) => {
            const Icon = a.Icon;
            return (
              <a
                key={a.href}
                href={a.href}
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-surface-elevated px-3 py-1.5 font-sans text-[0.82rem] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
              >
                <Icon aria-hidden className="size-3.5" strokeWidth={1.75} />
                {a.label}
              </a>
            );
          })}
        </nav>
      </SectionBand>

      <SectionBand tone="black">
        <Section id="identity" eyebrow="Identity" title="Three modes, one design principle.">
          <p className="max-w-copy font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
            Identity is checked once at the door, then separated from the room. Participants choose
            how visible they are inside the room based on their risk; facilitators see only what is
            required to run the cohort.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {IDENTITY_MODES.map((m) => (
              <li
                key={m.label}
                className="list-none rounded-md border border-line bg-surface-elevated p-5"
              >
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                  {m.label}
                </p>
                <p className="mt-3 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                  {m.body}
                </p>
                <p className="mt-3 border-t border-line pt-3 font-sans text-[0.82rem] leading-relaxed text-ink-faint">
                  <span className="font-mono uppercase tracking-[0.08em] text-ink-faint">
                    Tradeoff
                  </span>
                  <span className="ml-1.5">{m.tradeoff}</span>
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </SectionBand>

      <SectionBand tone="navy">
        <Section
          id="governance"
          eyebrow="Governance"
          title="Moderation principles and escalation paths."
        >
          <p className="max-w-copy font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
            Governance is procedural, not theatrical. The same four rails apply to every cohort,
            regardless of sector or jurisdiction.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {GOVERNANCE_RAILS.map((r, i) => (
              <li
                key={r.label}
                className="list-none rounded-md border border-line bg-surface-elevated p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="inline-flex size-6 items-center justify-center rounded-full border border-line font-mono text-[0.7rem] font-semibold text-ink-secondary"
                  >
                    {i + 1}
                  </span>
                  <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    {r.label}
                  </p>
                </div>
                <p className="mt-3 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                  {r.body}
                </p>
              </li>
            ))}
          </ol>
          <Link
            to="/admin/reports"
            className="focus-ring mt-6 inline-flex min-h-[44px] items-center gap-1.5 py-1 font-sans text-[0.85rem] font-medium text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Moderator dashboard (staff only)
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Section>
      </SectionBand>

      <SectionBand tone="black">
        <Section id="data" eyebrow="Data" title="What we keep, and what we deliberately do not.">
          <ul className="grid gap-4 md:grid-cols-3">
            {DATA_NOTES.map((d) => (
              <li
                key={d.label}
                className="list-none rounded-md border border-line bg-surface-elevated p-5"
              >
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {d.label}
                </p>
                <p className="mt-3 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                  {d.body}
                </p>
              </li>
            ))}
          </ul>
          <Link
            to="/security"
            className="focus-ring mt-6 inline-flex min-h-[44px] items-center gap-1.5 py-1 font-sans text-[0.85rem] font-medium text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Read the full security disclosure
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Section>
      </SectionBand>

      <SectionBand tone="navy">
        <Section id="consent" eyebrow="Consent" title="Four checkpoints, one promise.">
          <p className="max-w-copy font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
            What can leave the room is decided before the room opens, then reaffirmed at each stage.
            Tired participants are never asked to negotiate boundaries in the moment.
          </p>
          <ul className="mt-6 grid gap-2.5">
            {CONSENT_CHECKPOINTS.map((line) => (
              <li
                key={line}
                className="list-none flex gap-3 rounded-md border border-line bg-surface-elevated p-4"
              >
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <p className="font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">{line}</p>
              </li>
            ))}
          </ul>
          <Link
            to="/settings/safety"
            className="focus-ring mt-6 inline-flex min-h-[44px] items-center gap-1.5 py-1 font-sans text-[0.85rem] font-medium text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Review your safety center
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Section>
      </SectionBand>
    </>
  );
}
