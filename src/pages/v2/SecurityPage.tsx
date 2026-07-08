import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { CTABlock, MarketingSection, SectionLabel } from '../../components/shared';

const ROOM_LAYER = [
  'The room is the private, live surface — a facilitator-led messaging room. Written messages are visible only to verified participants and the facilitator.',
  'SquadRidge does not capture, store, or transmit video or audio. There are no calls and no spoken sessions — dialogue is text-based only.',
  'No public transcript is generated. Room contents are not retained on platform infrastructure after a session is closed and archived.',
  'Identity is verified but never disclosed. The facilitator confirms each participant privately; verification data is visible only to the facilitator, and identity never appears on the released record.',
];

const RECORD_LAYER = [
  'The record is the released, verifiable surface — the outcome text plus limited metadata (organisation, date, participant count) if included by the facilitator.',
  'A record is only released when every required approval has been recorded. Release is an explicit, signed action; the platform never publishes anything on its own.',
  'Once released, every record carries a verification anchor that anyone can check independently.',
];

const SAFEGUARDS = [
  {
    heading: 'Verified access only',
    body: 'Every participant passes a facilitator-configured verification process before entering a room. Eligibility, identity document review, and manual approval are all available.',
  },
  {
    heading: 'Controlled release',
    body: 'No outcome is published without every designated approver signing off. The platform cannot unilaterally release anything.',
  },
  {
    heading: 'Text-based room only',
    body: 'The room is a facilitator-led messaging environment by design. SquadRidge does not record, store, or transmit audio or video, and does not integrate with external call tools.',
  },
  {
    heading: 'Minimal retention',
    body: 'Only the data required to facilitate the session and produce the record is retained. Room dialogue does not persist past session archival.',
  },
  {
    heading: 'Participant identity protection',
    body: 'Personal contact information is not shared between participants. Facilitators see verification data that never surfaces to others in the room or on the record.',
  },
  {
    heading: 'Auditable release chain',
    body: 'Every approval and every release action is written to an internal audit log. The verification anchor lets outside parties confirm the record has not been altered since.',
  },
  {
    heading: 'Invite-only surface',
    body: 'The platform is not a public forum. Access to any protected area requires an active invitation tied to a session or an approved organisational role.',
  },
];

const NOT_CLAIMED = [
  'We do not claim end-to-end encryption of session content at this time. Content transits over TLS. Room-level E2EE is on the development roadmap.',
  'We do not guarantee anonymity. We guarantee identity protection within the session context and controlled release of outcomes.',
  'We do not provide legal protection. SquadRidge is a process platform, not a legal instrument. Consult legal counsel for binding agreements.',
  'We are not a whistleblower platform. If your threat model includes state-level adversaries, assess accordingly.',
];

export function SecurityPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Security overview" />
          <h1 className="mt-3 text-h1 text-ink">Verified, not exposed.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink md:text-lg">
            Security in SquadRidge comes from architecture, not policy language alone. Raw session
            content is not published. Only facilitator-approved outcomes are released, each carrying
            a verification anchor that can be checked independently.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            The room and the record are two different objects. This page describes each, how they
            are separated, and what the anchor does and does not prove.
          </p>
        </div>
      </MarketingSection>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        id="architecture"
      >
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Architecture model" />
          <h2 className="mt-3 text-h2 text-ink">Two layers, two responsibilities.</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            Inside the room: private, verified, facilitator-controlled. Released as record:
            approved, verifiable, deliberately narrow.{' '}
            <Link to="/how-it-works" className="text-brand hover:underline">
              How it works
            </Link>{' '}
            covers the workflows; this page covers the trust model.
          </p>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Private session layer" />
          <h2 className="mt-3 text-h2 text-ink">Inside the room.</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {ROOM_LAYER.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-lg border border-line bg-surface-elevated p-4 text-sm leading-relaxed text-ink-secondary"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Released record layer" />
          <h2 className="mt-3 text-h2 text-ink">Released as record.</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {RECORD_LAYER.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-lg border border-brand/20 bg-brand-soft p-4 text-sm leading-relaxed text-ink"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        id="verification-anchor"
      >
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Verification anchor" />
          <h2 className="mt-3 text-h2 text-ink">What the anchor is — and isn't.</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            A verification anchor is a cryptographic hash of the released record, generated at the
            moment of release. Anyone with the record can recompute the anchor and confirm the
            record has not been altered since.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-brand/20 bg-brand-soft p-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-brand">
                What it proves
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink">
                {[
                  'The record has not been altered since release.',
                  'The record was issued through SquadRidge (not fabricated externally).',
                  'The organisation, date, and any included metadata are the ones on file.',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-surface-elevated p-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-faint">
                What it does not prove
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-secondary">
                {[
                  'What was said inside the room — the private session is not encoded in the anchor.',
                  'Who each participant is — identity does not appear on the released record.',
                  'That any external party endorses the outcome — endorsement is out of scope.',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <X className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel text="Operational safeguards" />
          <h2 className="mt-3 text-h2 text-ink">
            Controls that live in the platform, not in the copy.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {SAFEGUARDS.map((s) => (
              <li key={s.heading} className="rounded-lg border border-line bg-surface-elevated p-5">
                <h3 className="text-sm font-semibold text-ink">{s.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="What we do not claim" />
          <h2 className="mt-3 text-h2 text-ink">Limits, stated plainly.</h2>
          <ul className="mt-8 flex flex-col gap-3">
            {NOT_CLAIMED.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary"
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-flex h-1 w-1 shrink-0 rounded-full bg-ink-faint"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Technical appendix" />
          <details className="mt-4 rounded-lg border border-line bg-surface-elevated">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-ink">
              For engineers, security reviewers, and auditors — expand for the technical model.
            </summary>
            <div className="border-t border-line px-5 py-5 text-sm leading-relaxed text-ink-secondary">
              <p>
                Transport: TLS 1.2+ between browser and platform (transport encryption only — not
                message-level end-to-end encryption against the operator). Session data at rest is
                encrypted; keys are managed by the platform&apos;s KMS.
              </p>
              <p className="mt-3">
                Verification anchor: SHA-256 of the canonicalised released record (outcome text plus
                included metadata, in a stable JSON encoding). The anchor is emitted at the moment
                the release action is signed by the facilitator.
              </p>
              <p className="mt-3">
                Approval chain: every required approval is recorded as a signed audit event.
                Releases cannot be issued without a complete chain.
              </p>
              <p className="mt-3">
                Identity: participant identity data captured during verification is not accessible
                to other participants or written to any released record.
              </p>
            </div>
          </details>
        </div>
      </section>

      <section className="border-t border-line px-6 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-ink-secondary">
            Security questions or responsible-disclosure reports?
          </p>
          <a
            href="mailto:security@squadridge.com"
            className="btn-pill btn-pill--primary mt-4 inline-flex text-sm"
          >
            security@squadridge.com
          </a>
        </div>
      </section>

      <CTABlock
        headline="See the trust model in practice."
        secondaryLabel="Browse the ledger"
        secondaryHref="/ledger"
      />
    </div>
  );
}
