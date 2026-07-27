import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LedgerProvenancePanel } from '../../components/institutional';
import {
  CTABlock,
  GlossTerm,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
  StickySpineNav,
} from '../../components/shared';
import {
  ANCHOR_DOES_NOT,
  ANCHOR_PROVES,
  DILIGENCE_FAQ,
  OMBUDS_ALIGNED,
  TECHNICAL_APPENDIX,
} from '../../data/securityPage';
import { CTA } from '../../data/siteMessaging';
import { usePageTitle } from '../../hooks/usePageTitle';

const TECHNICAL_SECTIONS = [
  { id: 'verification-anchor', label: 'Anchor' },
  { id: 'diligence-faq', label: 'FAQ' },
  { id: 'confidentiality-precedent', label: 'Precedent' },
  { id: 'reviewer-appendix', label: 'Appendix' },
] as const;

const LIMITS_HREF = '/security#reviewers';

/** Link every “Documented limits” mention back to the single disclosure. */
function withDocumentedLimitsLinks(text: string): ReactNode {
  const parts = text.split('Documented limits');
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? (
        <Link to={LIMITS_HREF} className="text-brand underline-offset-2 hover:underline">
          Documented limits
        </Link>
      ) : null}
    </Fragment>
  ));
}

/**
 * Security technical appendix — diligence FAQ, verification-anchor depth, reviewer notes.
 * Skimable overview stays on `/security`.
 */
export function SecurityTechnicalPage() {
  usePageTitle('Security — Technical');

  return (
    <div className="sr-security-page" data-page="security-technical">
      <MarketingPageHero
        label="Security · Technical"
        title="Technical appendix"
        lead={
          <p>
            Diligence FAQ, verification-anchor bounds, confidentiality precedent, and engineer
            notes. For the skimable overview, start at{' '}
            <Link to="/security" className="text-brand underline-offset-2 hover:underline">
              Security at a glance
            </Link>
            .
          </p>
        }
        meta={
          <p className="text-sm text-ink-faint">
            Operator-readable rooms are disclosed once on{' '}
            <Link
              to={LIMITS_HREF}
              className="text-ink-secondary underline-offset-4 hover:underline"
            >
              Documented limits
            </Link>
            — this page links back rather than restating.
          </p>
        }
      />

      <StickySpineNav stages={TECHNICAL_SECTIONS} aria-label="Technical security sections" />

      <MarketingSection
        id="verification-anchor"
        tone="sunken"
        density="compact"
        className="scroll-mt-28 border-b border-line"
      >
        <ShellWidth>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
            <div>
              <SectionLabel>Verification anchor</SectionLabel>
              <h2 id="anchor-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                What the anchor proves — and does not
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                Today the <GlossTerm term="verification-anchor" /> is a SHA-256 hash of the released
                record at publication. Anyone with the record can recompute it. That proves{' '}
                <em className="not-italic text-ink">integrity</em> — not an independently attested{' '}
                <em className="not-italic text-ink">when</em>. <GlossTerm term="rfc-3161" /> trusted
                timestamping is the planned next layer beside the hash; it is not requested during
                release today.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="sr-security-proves border p-5">
                  <p className="sr-security-proves-label sr-verify m-0 text-sm font-semibold">
                    <span className="sr-verify-dot" aria-hidden />
                    Proves
                  </p>
                  <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                    {ANCHOR_PROVES.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sr-security-nonprove border border-line p-5">
                  <p className="m-0 text-sm font-semibold text-ink-faint">Does not prove</p>
                  <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                    {ANCHOR_DOES_NOT.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <LedgerProvenancePanel />
          </div>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="diligence-faq" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Diligence FAQ</SectionLabel>
            <h2 id="diligence-faq-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Objections answered inline
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Short answers for evaluators. Limits stay on{' '}
              <Link to={LIMITS_HREF} className="text-brand underline-offset-2 hover:underline">
                Documented limits
              </Link>
              .
            </p>
          </ProseMeasure>
          <dl className="m-0 space-y-0 border border-line">
            {DILIGENCE_FAQ.map((item) => (
              <div
                key={item.q}
                className="border-b border-line bg-surface-elevated px-5 py-5 last:border-b-0"
              >
                <dt className="text-sm font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {withDocumentedLimitsLinks(item.a)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-sm text-ink-secondary">
            Broader product FAQ:{' '}
            <Link to="/faq" className="text-brand underline-offset-2 hover:underline">
              /faq
            </Link>
            .
          </p>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection
        id="confidentiality-precedent"
        tone="sunken"
        density="compact"
        className="scroll-mt-28 border-b border-line"
      >
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Confidentiality precedent</SectionLabel>
            <h2 id="ombuds-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Aligned with established ombuds practice standards
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              SquadRidge mirrors the International Ombuds Association confidentiality architecture
              as a professional benchmark for how the room relates to the record. We are not an
              IOA-certified ombuds office, and we do not invent legal privilege.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {OMBUDS_ALIGNED.map((item) => (
              <li key={item.heading} className="bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.heading}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-measure text-xs leading-relaxed text-ink-faint">
            Sources:{' '}
            <a
              href="https://www.ombudsassociation.org/assets/docs/IOA_Standards_of_Practice_Oct09.pdf"
              className="underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              IOA Standards of Practice
            </a>
            {' · '}
            <a
              href="https://www.nasa.gov/wp-content/uploads/2019/05/ioa_standards_of_practice_tagged.pdf"
              className="underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              NASA-hosted IOA SoP
            </a>
            . Full synthesis in internal research brief.
          </p>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="reviewer-appendix" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:gap-16">
            <div className="max-w-measure">
              <SectionLabel>For reviewers</SectionLabel>
              <h2 id="appendix-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                Technical notes
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Concise notes for engineers and auditors. Full threat model is available on request
                during diligence. Operator access:{' '}
                <Link to={LIMITS_HREF} className="text-brand underline-offset-2 hover:underline">
                  Documented limits
                </Link>
                .
              </p>
              <dl className="mt-8 m-0 space-y-4 border-t border-line pt-6">
                {TECHNICAL_APPENDIX.map((row) => (
                  <div key={row.term}>
                    <dt className="text-sm font-semibold text-ink">{row.term}</dt>
                    <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                      {row.term === 'Verification anchor' ? (
                        <>
                          SHA-256 (
                          <GlossTerm term="ledger-sha">
                            <span className="font-mono">ledger_sha</span>
                          </GlossTerm>
                          ) of the <GlossTerm term="canonicalised" /> approved instrument at
                          facilitator sign-off — integrity of the released text. Not a Merkle tree
                          of room messages, not a live RFC 3161 Time Stamp Authority token, and not
                          on-chain notarisation in the current pilot. Optional{' '}
                          <span className="font-mono">timestamp_token</span> columns exist as a
                          scaffold for a future TSA path; release does not request a token today.
                          Semaphore Merkle groups, where used, apply to identity verification
                          cohorts — not to ledger anchoring.
                        </>
                      ) : row.term === 'Release preconditions' ? (
                        <>
                          Release is refused unless the session has ended, every approval is
                          recorded against the current <GlossTerm term="instrument-hash" />, a
                          facilitator <GlossTerm term="authorship-attestation" /> covers that same
                          hash, and no approved text repeats a room message verbatim. Revising the
                          instrument resets approvals and clears the attestation, and each refused
                          attempt is written to the session audit trail.
                        </>
                      ) : (
                        withDocumentedLimitsLinks(row.detail)
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <aside className="h-fit border border-line bg-surface-elevated p-6">
              <p className="m-0 text-sm font-semibold text-ink">Security contact</p>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                Responsible disclosure and diligence questions.
              </p>
              <a
                href="mailto:security@squadridge.com"
                className="btn-institutional btn-institutional--ghost mt-6 inline-flex"
              >
                security@squadridge.com
              </a>
              <p className="mt-6 mb-0 text-sm text-ink-secondary">
                <Link to="/security" className="text-brand underline-offset-2 hover:underline">
                  ← Security at a glance
                </Link>
              </p>
            </aside>
          </div>
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeSecurity}
        secondaryLabel={CTA.secondaryBriefingLabel}
        secondaryHref={CTA.secondaryBriefingHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
