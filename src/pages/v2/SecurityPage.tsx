import { Fragment, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { TrustBoundarySchematic } from '../../components/institutional';
import {
  CTABlock,
  ImplementationStatusBadge,
  ImplementationStatusLegend,
  MarketingPageHero,
  MarketingSection,
  PrivatePublicSplit,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
  StickySpineNav,
} from '../../components/shared';
import {
  claimsByIds,
  IMPLEMENTATION_REGISTRY_VERSION,
  TRUST_FEATURE_CLAIM_IDS,
} from '../../data/implementationStatus';
import {
  DOCUMENTED_LIMITS_LEAD,
  isSecurityTechnicalHash,
  NOT_CLAIMED,
  OPERATOR_ACCESS,
  RECORD_ITEMS,
  ROOM_ITEMS,
  SAFEGUARDS,
  SECURITY_AT_A_GLANCE,
} from '../../data/securityPage';
import { CTA } from '../../data/siteMessaging';
import { usePageTitle } from '../../hooks/usePageTitle';

function withDocumentedLimitsAnchor(text: string): ReactNode {
  const parts = text.split('Documented limits');
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? (
        <a href="#reviewers" className="text-brand underline-offset-2 hover:underline">
          Documented limits
        </a>
      ) : null}
    </Fragment>
  ));
}

const GLANCE_SECTIONS = [
  { id: 'reviewers', label: 'Limits' },
  { id: 'at-a-glance', label: 'Glance' },
  { id: 'live-vs-planned', label: 'Status' },
  { id: 'operator-access', label: 'Operator' },
  { id: 'room-and-record', label: 'Architecture' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'diligence-packet', label: 'Packet' },
] as const;

/** From Implementation Status Registry — never hardcode LIVE/PLANNED here. */
const TRUST_STATUS = claimsByIds(TRUST_FEATURE_CLAIM_IDS);

/**
 * Security at a glance — skimable first view.
 * Technical appendix, diligence FAQ, and anchor deep detail: `/security/technical`.
 */
export function SecurityPage() {
  usePageTitle('Security');
  const { hash } = useLocation();
  const hashId = hash.replace(/^#/, '');

  if (hashId && isSecurityTechnicalHash(hashId)) {
    return <Navigate to={`/security/technical${hash}`} replace />;
  }

  return (
    <div className="sr-security-page" data-page="security">
      <div data-demo="security-hero">
        <MarketingPageHero
          label="Security"
          title="Privacy boundaries you can explain"
          lead={
            <p>
              Verification before entry, facilitator authority over release, and a record integrity
              check — with documented limits, not overclaimed cryptography.
            </p>
          }
          aside={<TrustBoundarySchematic className="w-full" />}
          meta={
            <p className="text-sm text-ink-faint">
              Skimable overview.{' '}
              <Link
                to="/security/technical"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Technical appendix
              </Link>
              {' · '}
              <a
                href="#reviewers"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Documented limits
              </a>
            </p>
          }
        />
      </div>

      <StickySpineNav stages={GLANCE_SECTIONS} aria-label="Security sections" />

      <section
        id="reviewers"
        data-demo="security-limits"
        className="sr-security-limits scroll-mt-28 border-b border-line bg-surface-sunken/60 py-12 text-left md:py-16"
        aria-labelledby="limits-h"
      >
        <ShellWidth>
          <div className="mb-8 max-w-measure">
            <SectionLabel>Documented limits</SectionLabel>
            <h2 id="limits-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              What we do not do
            </h2>
            <p className="mt-4 rounded-sm bg-surface-elevated px-5 py-4 text-sm leading-relaxed text-ink">
              {DOCUMENTED_LIMITS_LEAD}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Read this before the safeguards. Accurate expectations are part of the product.
            </p>
          </div>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {NOT_CLAIMED.map((item) => (
              <li key={item.label} className="sr-security-limit-row bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </section>

      <MarketingSection id="at-a-glance" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Security at a glance</SectionLabel>
            <h2 id="glance-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Six boundaries in one screen
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              The short map. Depth lives in{' '}
              <Link
                to="/security/technical"
                className="text-brand underline-offset-2 hover:underline"
              >
                Technical appendix
              </Link>
              .
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY_AT_A_GLANCE.map((card) => (
              <li key={card.title} className="bg-surface-elevated px-5 py-5 shadow-sr-sm">
                <p className="m-0 text-sm font-semibold text-ink">
                  {card.href.startsWith('/') ? (
                    <Link to={card.href} className="text-ink underline-offset-4 hover:underline">
                      {card.title}
                    </Link>
                  ) : (
                    <a href={card.href} className="text-ink underline-offset-4 hover:underline">
                      {card.title}
                    </a>
                  )}
                </p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{card.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection
        id="live-vs-planned"
        tone="sunken"
        density="compact"
        className="scroll-mt-28 border-b border-line"
      >
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Implementation status</SectionLabel>
            <h2 id="status-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Live today, and what is not
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              From the Implementation Status Registry (v{IMPLEMENTATION_REGISTRY_VERSION}) — the
              same source Home, How it works, and Ledger badges use.
            </p>
            <ImplementationStatusLegend className="mt-4" />
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {TRUST_STATUS.map((item) => (
              <li key={item.id} className="bg-surface-elevated px-5 py-5">
                <ImplementationStatusBadge status={item.status} />
                <p className="mt-2 mb-0 text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="operator-access" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Operator access</SectionLabel>
            <h2 id="operator-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Who can read the room
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Layer summary. Full operator-readable disclosure:{' '}
              <a href="#reviewers" className="text-brand underline-offset-2 hover:underline">
                Documented limits
              </a>
              .
            </p>
          </ProseMeasure>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <caption className="sr-only">Operator access by layer</caption>
              <thead>
                <tr className="border-b border-line bg-surface-secondary">
                  <th scope="col" className="px-5 py-3 font-semibold text-ink">
                    Layer
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold text-ink">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody>
                {OPERATOR_ACCESS.map((row) => (
                  <tr key={row.layer} className="border-b border-line last:border-b-0">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-5 py-4 align-top font-semibold text-ink"
                    >
                      {row.layer}
                    </th>
                    <td className="px-5 py-4 align-top text-ink-secondary">
                      {withDocumentedLimitsAnchor(row.access)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="room-and-record" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <div className="mb-8 max-w-measure">
            <SectionLabel>Architecture</SectionLabel>
            <h2 id="layers-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Private session vs released record
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Separation is structural, not a policy toggle.{' '}
              <Link
                to={CTA.secondaryProcessHref}
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                How it works
              </Link>
              .
            </p>
          </div>
          <PrivatePublicSplit
            size="compact"
            privateHeading="Private session"
            publicHeading="Released record"
            bridgeLabel="Facilitator release gate"
            privateFooter="Stays inside the room — never auto-published"
            publicFooter="Leaves only after designated approvals"
            privateItems={[...ROOM_ITEMS]}
            publicItems={[...RECORD_ITEMS]}
          />
        </ShellWidth>
      </MarketingSection>

      <MarketingSection
        id="safeguards"
        tone="sunken"
        density="compact"
        className="scroll-mt-28 border-b border-line"
      >
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Operations</SectionLabel>
            <h2 id="safeguards-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Operational safeguards
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Process controls that keep the room closed and release deliberate.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-x-8 gap-y-4 p-0 sm:grid-cols-2">
            {SAFEGUARDS.map((s) => (
              <li key={s.heading} className="border-t border-line pt-4">
                <h3 className="m-0 text-sm font-semibold text-ink">{s.heading}</h3>
                <p className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="diligence-packet" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Trust &amp; diligence packet</SectionLabel>
            <h2 id="packet-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Downloadable packet for board and funder sign-off
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Version-controlled summary from the Implementation Status Registry: posture,
              threat-model bounds, residency, subprocessors, incident targets, and deletion on pilot
              termination.
            </p>
          </ProseMeasure>
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            <li>
              <a
                href="/diligence/trust-diligence-packet.md"
                className="btn-institutional btn-institutional--primary"
                download
              >
                Download diligence packet (.md)
              </a>
            </li>
            <li>
              <a
                href="/diligence/sample-approved-record.md"
                className="btn-institutional btn-institutional--ghost"
                download
              >
                Sample approved record
              </a>
            </li>
            <li>
              <a
                href="/diligence/sample-audit-trail-export.md"
                className="btn-institutional btn-institutional--ghost"
                download
              >
                Sample audit-trail export
              </a>
            </li>
          </ul>
          <p className="mt-6 mb-0 text-sm text-ink-secondary">
            Need FAQ, verification-anchor bounds, or engineer notes?{' '}
            <Link
              to="/security/technical"
              className="text-brand underline-offset-2 hover:underline"
            >
              Open technical appendix
            </Link>
            .
          </p>
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
