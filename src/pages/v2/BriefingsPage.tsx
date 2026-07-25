import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { GATED_DECK_CATALOG } from '../../lib/deckCatalog';
import { CTA } from '../../data/siteMessaging';
import { CTABlock, MarketingPageHero, MarketingSection, ShellWidth } from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Public teaser for pitch materials — catalog metadata only.
 * Actual decks require auth + deck_access_grants (or super_admin).
 */
export function BriefingsPage() {
  usePageTitle('Briefings');

  return (
    <div data-page="briefings">
      <MarketingPageHero
        slim
        label="Briefings"
        title="Invite-only materials for serious evaluation"
        lead={
          <>
            <p>
              Investor, partner, institutional, and corporate briefings stay behind an access gate.
              Public pages describe the product honestly; deck content is shared when there is a
              clear reason to review it.
            </p>
            <p className="mt-3 mb-0 text-sm text-ink-faint">
              Privacy claims in these materials match the published threat model — not full E2E or
              platform-wide zero-knowledge where that is not accurate today.
            </p>
          </>
        }
        actions={
          <>
            <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--primary">
              Request briefing access
            </Link>
            <Link to="/sign-in?next=/decks" className="btn-institutional btn-institutional--ghost">
              Sign in with invite
            </Link>
          </>
        }
        meta={<p className="text-xs text-ink-faint">{CTA.pilotStatusLine}</p>}
      />

      <MarketingSection density="compact">
        <ShellWidth>
          <ul
            className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2"
            aria-label="Briefing categories"
          >
            {GATED_DECK_CATALOG.map((deck) => (
              <li
                key={deck.id}
                className="rounded-[var(--sr-radius-md)] bg-surface-elevated p-5 shadow-sr-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[0.12em] text-brand">
                    {deck.audienceLabel}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                    <Lock className="size-3.5" aria-hidden />
                    Gated
                  </span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-ink">{deck.title}</h2>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {deck.summary}
                </p>
                <p className="mt-4 mb-0 text-xs text-ink-faint">{deck.updated}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.briefingHeadline}
        body={CTA.closeBriefings}
        primaryLabel="Request briefing access"
        primaryHref={CTA.primaryHref}
        secondaryLabel={CTA.secondarySecurity}
        secondaryHref={CTA.secondarySecurityHref}
        statusLine={CTA.pilotStatusLine}
      />
    </div>
  );
}
