import { Link } from 'react-router-dom';
import { CONFIDENTIALITY_POINTS, VERIFICATION_POINTS } from '../../data/institutionalHome';
import {
  EvidencePanel,
  LedgerProvenancePanel,
  TrustBoundarySchematic,
} from '../../components/institutional';
import { CTABlock, EvaluatorPath, MarketingSection, SectionLabel } from '../../components/shared';
import { CTA } from '../../data/siteMessaging';

const SAFEGUARDS = [
  {
    heading: 'Verified access only',
    body: 'Every participant passes a facilitator-configured verification process before entering a room. Eligibility, identity document review, and manual approval are all available — you set the bar for the matter.',
  },
  {
    heading: 'Controlled release',
    body: 'No outcome is published without every designated approver signing off. The platform cannot unilaterally release anything on your behalf.',
  },
  {
    heading: 'Text-based room only',
    body: 'The room is a facilitator-led messaging environment by design. SquadRidge does not record, store, or transmit audio or video.',
  },
  {
    heading: 'Minimal retention',
    body: 'Only the data required to facilitate the session and produce the record is retained. Released ledger records are permanent by design.',
  },
  {
    heading: 'Participant identity protection',
    body: 'Personal contact information is not shared between participants. You see verification data that never surfaces to others in the room or on the record.',
  },
  {
    heading: 'Auditable release chain',
    body: 'Session lifecycle events are written to a metadata audit log — no message bodies. Required approvals are recorded before any release action.',
  },
  {
    heading: 'Invite-only surface',
    body: 'The platform is not a public forum. Access to any protected area requires an active invitation tied to a session or an approved organisational role.',
  },
];

const NOT_CLAIMED = [
  'We do not claim end-to-end encryption of session content at this time. Content transits over TLS. Room-level E2EE is on the development roadmap.',
  'We do not guarantee anonymity. We guarantee identity protection within the session context and controlled release of outcomes.',
  'We do not provide legal privilege or legal protection. SquadRidge is a process platform, not a legal instrument. Consult legal counsel for binding agreements.',
  'We are not a whistleblower platform. If your threat model includes state-level adversaries, assess accordingly.',
  'We are not surveillance, predictive policing, or early-warning monitoring — structured facilitation infrastructure only.',
];

export function SecurityPage() {
  return (
    <div>
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="max-w-xl">
            <SectionLabel text="Security overview" />
            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
              Verified, not exposed.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-secondary md:text-[1.05rem]">
              Security in SquadRidge comes from architecture, not policy language alone. Raw session
              content stays inside the room; only approved outcomes are released, with a
              verification anchor that can be independently checked.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              The mediation room and the public record are two different objects. Trust is expressed
              through access boundaries and release gates rather than continuous monitoring.
            </p>
          </div>
          <TrustBoundarySchematic className="w-full" />
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-line bg-surface-sunken/40 !py-16">
        <div className="mx-auto max-w-6xl">
          <EvidencePanel
            id="confidentiality"
            eyebrow="Private session layer"
            heading="Inside the room."
            items={CONFIDENTIALITY_POINTS}
          />
        </div>
      </MarketingSection>

      <MarketingSection>
        <div className="mx-auto max-w-6xl">
          <EvidencePanel
            id="verification"
            eyebrow="Released record layer"
            heading="What is published — and what is not."
            items={VERIFICATION_POINTS}
          />
          <p className="mt-8 text-sm text-ink-faint">
            <Link
              to="/how-it-works"
              className="text-ink-secondary underline-offset-4 hover:underline"
            >
              Process overview
            </Link>
          </p>
        </div>
      </MarketingSection>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        id="verification-anchor"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="max-w-xl">
            <SectionLabel text="Verification anchor" />
            <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
              What the anchor is — and isn&apos;t.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              A verification anchor is a cryptographic hash of the released record, generated at the
              moment of release. Anyone with the record can recompute the anchor and confirm the
              record has not been altered since.
            </p>
            <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-1">
              <div className="bg-surface-elevated p-6">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                  What it proves
                </p>
                <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-secondary">
                  {[
                    'The record has not been altered since release.',
                    'The record was issued through SquadRidge rather than fabricated externally.',
                    'The organisation, date, and any included metadata are the ones on file.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-px w-3 shrink-0 bg-line-strong"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-sunken p-6">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
                  What it does not prove
                </p>
                <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-secondary">
                  {[
                    'What was said inside the room — the private session is not encoded in the anchor.',
                    'Who each participant is — identity does not appear on the released record.',
                    'That any external party endorses the outcome — endorsement is out of scope.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-2 inline-block h-px w-3 shrink-0 bg-ink-faint"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <LedgerProvenancePanel />
        </div>
      </section>

      <section className="border-t border-line bg-surface-sunken/40 px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Operational safeguards" />
          <h2 className="font-display max-w-2xl text-h2 font-medium tracking-tight text-ink">
            Controls implemented in the platform.
          </h2>
          <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2">
            {SAFEGUARDS.map((s) => (
              <li key={s.heading} className="bg-surface-elevated p-5">
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
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            Limits, stated plainly.
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {NOT_CLAIMED.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary"
              >
                <span aria-hidden className="mt-2 inline-block h-px w-3 shrink-0 bg-ink-faint" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Technical appendix" />
          <details className="mt-4 border border-line bg-surface-elevated">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-ink">
              For engineers, security reviewers, and auditors — expand for the technical model.
            </summary>
            <div className="border-t border-line px-5 py-5 text-sm leading-relaxed text-ink-secondary">
              <p>
                Transport: TLS 1.2+ between browser and platform (transport encryption only — not
                message-level end-to-end encryption against the operator).
              </p>
              <p className="mt-3">
                v2 session room storage: facilitator-led messages are stored in Postgres as
                access-controlled plaintext (`session_messages.body`). Legacy squad chat uses
                application-layer AES-GCM with operator-readable keys. Room-level E2E is on the
                roadmap.
              </p>
              <p className="mt-3">
                Verification anchor: SHA-256 of the canonicalised released record (outcome text plus
                included metadata, in a stable JSON encoding). The anchor is emitted at the moment
                the release action is signed by the facilitator.
              </p>
              <p className="mt-3">
                Approval chain: required approvals must be recorded before release. Session audit
                events log metadata-only lifecycle actions (`session_audit_events` table).
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
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-ink-secondary">
            Security questions or responsible-disclosure reports?
          </p>
          <a
            href="mailto:security@squadridge.com"
            className="btn-institutional btn-institutional--ghost mt-4 inline-flex"
          >
            security@squadridge.com
          </a>
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="trust" />
        </div>
      </MarketingSection>

      <CTABlock
        headline="Review the trust model you can explain to parties."
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryLedger}
        secondaryHref={CTA.secondaryLedgerHref}
      />
    </div>
  );
}
