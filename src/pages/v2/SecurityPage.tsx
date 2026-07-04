// ============================================================
// SecurityPage — Phase 9 rewrite
//
// Structure per the design critique:
//   1. Plain-English top summary
//   2. Architecture model (room vs record diagram + one sentence)
//   3. Private session layer
//   4. Released record layer
//   5. Verification anchor — with a compact "What it proves / What it does not
//      prove" side-by-side
//   6. Operational safeguards
//   7. What we do NOT claim (retained from the old page — critical honesty)
//   8. Technical appendix (collapsed <details> so main page reads for non-eng)
//   9. Contact
//
// Tone: policy briefing / architecture note, not marketing. Reads for
// technical + non-technical audiences.
// ============================================================
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { SectionEyebrow, SplitPanelVisual } from '../../components/marketing/primitives';

// ------------------------------------------------------------
// Data
// ------------------------------------------------------------

const ROOM_LAYER = [
  'The room is the private, live surface — dialogue, participant messages, and any real-time signals only visible to verified participants and the facilitator.',
  'No transcript is generated for the public. Room contents are not retained on platform infrastructure after a session is closed and archived.',
  'Participant identities and verification data are visible only inside the room, to the facilitator. Other participants see the display name and role assigned during onboarding.',
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

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export function SecurityPage() {
  return (
    <div style={{ backgroundColor: 'var(--sr-bg)' }}>
      {/* 1. Top summary */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <SectionEyebrow>Security overview</SectionEyebrow>
        <h1 className="mt-3 text-h1" style={{ color: 'var(--sr-ink)' }}>
          Verified, not exposed.
        </h1>
        <p className="mt-5 text-base leading-relaxed md:text-lg" style={{ color: 'var(--sr-ink)' }}>
          Security in SquadRidge comes from architecture, not policy language alone. Raw session
          content is not published. Only facilitator-approved outcomes are released, each carrying a
          verification anchor that can be checked independently.
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
          The room and the record are two different objects. This page describes each, how they are
          separated, and what the anchor does and does not prove.
        </p>
      </section>

      {/* 2. Architecture model */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
        id="architecture"
      >
        <div className="mx-auto max-w-[1100px]">
          <SectionEyebrow>Architecture model</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            Two layers, two responsibilities.
          </h2>
          <p
            className="mt-4 max-w-2xl text-sm leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            Inside the room: private, verified, facilitator-controlled. Released as record:
            approved, verifiable, deliberately narrow.
          </p>
          <div className="mt-10">
            <SplitPanelVisual size="hero" />
          </div>
        </div>
      </section>

      {/* 3. Private session layer */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Private session layer</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            Inside the room.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {ROOM_LAYER.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed"
                style={{
                  borderColor: 'var(--sr-line)',
                  background: 'var(--sr-bg-elevated)',
                  color: 'var(--sr-ink-secondary)',
                }}
              >
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: 'var(--sr-ink-faint)' }}
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Released record layer */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Released record layer</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            Released as record.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {RECORD_LAYER.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg p-4 text-sm leading-relaxed"
                style={{
                  border: '1px solid color-mix(in oklch, var(--sr-primary) 22%, var(--sr-line))',
                  background: 'var(--sr-primary-soft)',
                  color: 'var(--sr-ink)',
                }}
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: 'var(--sr-primary)' }}
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Verification anchor + What proves / What does not prove */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
        id="verification-anchor"
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Verification anchor</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            What the anchor is — and isn't.
          </h2>
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            A verification anchor is a cryptographic hash of the released record, generated at the
            moment of release. Anyone with the record can recompute the anchor and confirm the
            record has not been altered since.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-[16px] border p-6"
              style={{
                border: '1px solid color-mix(in oklch, var(--sr-primary) 22%, var(--sr-line))',
                background: 'var(--sr-primary-soft)',
              }}
            >
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--sr-primary)' }}
              >
                What it proves
              </p>
              <ul
                className="mt-3 flex flex-col gap-2 text-sm leading-relaxed"
                style={{ color: 'var(--sr-ink)' }}
              >
                {[
                  'The record has not been altered since release.',
                  'The record was issued through SquadRidge (not fabricated externally).',
                  'The organisation, date, and any included metadata are the ones on file.',
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-3.5 shrink-0"
                      style={{ color: 'var(--sr-primary)' }}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-[16px] border p-6"
              style={{ borderColor: 'var(--sr-line)', background: 'var(--sr-bg-elevated)' }}
            >
              <p
                className="text-[0.7rem] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--sr-ink-faint)' }}
              >
                What it does not prove
              </p>
              <ul
                className="mt-3 flex flex-col gap-2 text-sm leading-relaxed"
                style={{ color: 'var(--sr-ink-secondary)' }}
              >
                {[
                  'What was said inside the room — the private session is not encoded in the anchor.',
                  'Who each participant is — identity does not appear on the released record.',
                  'That any external party endorses the outcome — endorsement is out of scope.',
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X
                      className="mt-0.5 size-3.5 shrink-0"
                      style={{ color: 'var(--sr-ink-faint)' }}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Operational safeguards */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-[1100px]">
          <SectionEyebrow>Operational safeguards</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            Controls that live in the platform, not in the copy.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {SAFEGUARDS.map((s) => (
              <li
                key={s.heading}
                className="rounded-lg border p-5"
                style={{
                  borderColor: 'var(--sr-line)',
                  background: 'var(--sr-bg-elevated)',
                }}
              >
                <h3 className="text-sm font-semibold" style={{ color: 'var(--sr-ink)' }}>
                  {s.heading}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--sr-ink-secondary)' }}
                >
                  {s.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. What we do NOT claim (retained honesty from old page) */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>What we do not claim</SectionEyebrow>
          <h2 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
            Limits, stated plainly.
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {NOT_CLAIMED.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm leading-relaxed"
                style={{ color: 'var(--sr-ink-secondary)' }}
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-flex h-1 w-1 shrink-0 rounded-full"
                  style={{ background: 'var(--sr-ink-faint)' }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Technical appendix (collapsed by default) */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionEyebrow>Technical appendix</SectionEyebrow>
          <details
            className="mt-4 rounded-lg border"
            style={{ borderColor: 'var(--sr-line)', background: 'var(--sr-bg-elevated)' }}
          >
            <summary
              className="cursor-pointer list-none px-5 py-4 text-sm font-medium"
              style={{ color: 'var(--sr-ink)' }}
            >
              For engineers, security reviewers, and auditors — expand for the technical model.
            </summary>
            <div
              className="border-t px-5 py-5 text-sm leading-relaxed"
              style={{ borderColor: 'var(--sr-divider)', color: 'var(--sr-ink-secondary)' }}
            >
              <p>
                Transport: TLS 1.2+ enforced end-to-end between browser and platform. Session data
                at rest is encrypted; keys are managed by the platform's KMS.
              </p>
              <p className="mt-3">
                Verification anchor: SHA-256 of the canonicalised released record (outcome text plus
                included metadata, in a stable JSON encoding). The anchor is emitted at the moment
                the release action is signed by the facilitator; the pre-image is the released
                record itself, so any recipient can recompute and verify.
              </p>
              <p className="mt-3">
                Approval chain: every required approval is recorded as a signed audit event with the
                approver's user ID, role, timestamp, and target record ID. The chain is append-only
                within the platform's audit log; releases cannot be issued without a complete chain.
              </p>
              <p className="mt-3">
                Identity: participant identity data captured during verification is not accessible
                to other participants or written to any released record. Facilitators see the
                minimum needed to run the session and can be scoped further per session
                configuration.
              </p>
              <p className="mt-3">
                Deeper technical review is available for pilot partners — contact us to arrange a
                briefing with the engineering team.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* 9. Contact */}
      <section
        className="border-t px-6 py-16 md:py-20"
        style={{ borderColor: 'var(--sr-divider)' }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm" style={{ color: 'var(--sr-ink-secondary)' }}>
            Security questions or responsible-disclosure reports?
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:security@squadridge.com" className="btn-pill btn-pill--primary text-sm">
              security@squadridge.com
            </a>
            <Link
              to="/request-access"
              className="text-xs font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-70"
              style={{ color: 'var(--sr-ink-faint)' }}
            >
              Or request pilot access
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
