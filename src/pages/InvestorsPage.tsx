import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  FileText,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  CardEyebrow,
  CTAGroup,
  PageHero,
  SectionBand,
  SectionIntro,
  SurfaceCard,
} from '../components';
import { INITIAL_MESSAGING } from '../pitch-deck-hub/initialState';

/**
 * Public investor mini-page.
 *
 * Surfaces the **same content sources** the moderator-only `PitchDeckHubPage`
 * uses (`INITIAL_MESSAGING`) — but only the fields safe for unauthenticated
 * sharing. Financial scenarios, fundraising ask, evidence ledger, and the
 * gated deck links are intentionally **not** rendered here. For diligence
 * follow-up, the page links to:
 *
 *   - Trust architecture (`/trust`)
 *   - Security disclosure (`/security`)
 *   - Sample ledger record (`/ledger`)
 *   - Pilot partner application (`/#waitlist`)
 *   - Diligence overview doc (CURRENT_STATUS.md)
 *
 * Gated decks remain behind `mint-deck-share` Edge Function tokens — partners
 * who want the financials get a short-lived link via that path, not via this
 * public surface.
 */

const POSITIONING_PILLARS = [
  {
    eyebrow: 'Pillar 01',
    title: 'Detection',
    icon: Eye,
    body: INITIAL_MESSAGING.detectionMechanism,
  },
  {
    eyebrow: 'Pillar 02',
    title: 'Intervention',
    icon: Users,
    body: INITIAL_MESSAGING.interventionProtocol,
  },
  {
    eyebrow: 'Pillar 03',
    title: 'Measurement',
    icon: ScrollText,
    body: INITIAL_MESSAGING.impactMeasurement,
  },
] as const;

const PROOF_LINKS = [
  {
    label: 'Trust architecture',
    description:
      'The current product, the pilot scope, and the boundaries our copy is allowed to claim.',
    href: '/trust',
    Icon: ShieldCheck,
  },
  {
    label: 'Security disclosure',
    description: 'What encryption holds today, what is operator-readable, and what is roadmap.',
    href: '/security',
    Icon: Lock,
  },
  {
    label: 'Sample ledger record',
    description: 'How a published outcome reads — anonymous, timestamped, citable.',
    href: '/ledger',
    Icon: FileText,
  },
  {
    label: 'Partners and deployment templates',
    description: 'How institutional partners run a first pilot with us.',
    href: '/partners',
    Icon: Layers,
  },
] as const;

export function InvestorsPage() {
  return (
    <>
      <SectionBand tone="navy">
        <PageHero
          eyebrow="Investors"
          title="Verified-anonymous infrastructure for facilitator-led dialogue."
          actions={
            <CTAGroup>
              <Link to="/#waitlist" className="btn-primary no-underline">
                Request a diligence walkthrough
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
              <Link to="/trust" className="btn-secondary no-underline">
                Read the trust architecture
              </Link>
              <Link to="/security" className="btn-secondary no-underline">
                Security disclosure
              </Link>
            </CTAGroup>
          }
        >
          <p>
            SquadRidge is a pilot-stage product for institutions that need stronger verification,
            structure, and accountability than generic chat or meeting tools. Below is the public
            framing for the next 90 days; financials, raise size, and pilot evidence flow through a
            gated diligence link, not this page.
          </p>
        </PageHero>
      </SectionBand>

      <SectionBand tone="black">
        <div className="flex flex-col gap-10">
          <SurfaceCard as="section" className="space-y-3">
            <CardEyebrow tone="brand">Master positioning</CardEyebrow>
            <p className="font-sans text-[1rem] leading-[1.6] text-ink">
              {INITIAL_MESSAGING.oneLine}
            </p>
            <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
              {INITIAL_MESSAGING.threeLine}
            </p>
          </SurfaceCard>

          <section aria-labelledby="problem-solution-heading" className="grid gap-5 md:grid-cols-2">
            <SurfaceCard className="space-y-3">
              <CardEyebrow>Problem</CardEyebrow>
              <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
                {INITIAL_MESSAGING.problemStatement}
              </p>
            </SurfaceCard>
            <SurfaceCard className="space-y-3">
              <CardEyebrow tone="brand">Solution</CardEyebrow>
              <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
                {INITIAL_MESSAGING.solutionStatement}
              </p>
            </SurfaceCard>
            <h2 id="problem-solution-heading" className="sr-only">
              Problem and solution
            </h2>
          </section>

          <section aria-labelledby="pillars-heading" className="space-y-5">
            <SectionIntro id="pillars-heading" title="Three product pillars">
              <p>
                The shipped product, the pilot scope, and what is explicitly roadmap. Each pillar
                describes shipped behaviour and the explicit caveats the messaging layer requires
                for external use.
              </p>
            </SectionIntro>
            <div className="grid gap-4 md:grid-cols-3">
              {POSITIONING_PILLARS.map(({ eyebrow, title, body, icon: Icon }) => (
                <SurfaceCard key={title} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand/35 bg-brand-soft text-brand">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <CardEyebrow>{eyebrow}</CardEyebrow>
                  </div>
                  <h3 className="font-heading text-[1.05rem] font-semibold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="font-sans text-[0.86rem] leading-relaxed text-ink-secondary">
                    {body}
                  </p>
                </SurfaceCard>
              ))}
            </div>
          </section>

          <section aria-labelledby="why-now-heading" className="grid gap-5 md:grid-cols-2">
            <SurfaceCard className="space-y-3">
              <CardEyebrow>Why now</CardEyebrow>
              <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
                {INITIAL_MESSAGING.whyNow}
              </p>
            </SurfaceCard>
            <SurfaceCard className="space-y-3">
              <CardEyebrow>Trust model (current release)</CardEyebrow>
              <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
                {INITIAL_MESSAGING.trustModel}
              </p>
            </SurfaceCard>
            <h2 id="why-now-heading" className="sr-only">
              Why now and the trust model
            </h2>
          </section>

          <SurfaceCard className="space-y-3">
            <CardEyebrow tone="brand">Differentiators</CardEyebrow>
            <p className="font-sans text-[0.92rem] leading-[1.65] text-ink-secondary">
              {INITIAL_MESSAGING.coreDifferentiators}
            </p>
          </SurfaceCard>

          <section aria-labelledby="proof-heading" className="space-y-5">
            <SectionIntro id="proof-heading" title="Honest proof points">
              <p>
                Direct links to the surfaces this page makes claims about. No invented metrics; no
                undisclosed pilot logos. Pilot evidence and the financial model travel through a
                gated diligence link, not the public site.
              </p>
            </SectionIntro>
            <div className="grid gap-4 md:grid-cols-2">
              {PROOF_LINKS.map(({ label, description, href, Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className="group flex items-start gap-4 rounded-md border border-line bg-surface-elevated p-4 transition-colors hover:border-line-strong hover:bg-surface-sunken"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-sunken text-ink-secondary group-hover:border-brand/40 group-hover:text-brand">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-heading text-[0.95rem] font-semibold text-ink">
                      {label}
                    </span>
                    <span className="mt-1 block font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
                      {description}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 font-sans text-[0.78rem] text-brand">
                      Open
                      <ArrowRight aria-hidden className="size-3.5" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <SurfaceCard as="aside" className="space-y-3 border-amber/30 bg-amber/[0.05]" role="note">
            <CardEyebrow tone="brand">Diligence and financials</CardEyebrow>
            <p className="font-sans text-[0.9rem] leading-[1.65] text-ink-secondary">
              The full investor deck, financial scenarios, and pilot evidence are gated behind
              short-lived share tokens. Send a request to the founder via the pilot waitlist and we
              will mint a direct link for your team — typical turn-around is one business day.
            </p>
            <Link
              to="/#waitlist"
              className="inline-flex items-center gap-1 font-sans text-[0.88rem] font-semibold text-brand"
            >
              Request a gated diligence link
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <CardEyebrow>Tone &amp; what we never claim</CardEyebrow>
            <p className="font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
              {INITIAL_MESSAGING.toneRules}
            </p>
            <p className="font-sans text-[0.78rem] leading-relaxed text-ink-faint">
              We don&apos;t use these words about the current release: &ldquo;full anonymity&rdquo;,
              &ldquo;operator-proof encryption&rdquo;, &ldquo;proven peace impact at scale&rdquo;,
              or &ldquo;global early-warning&rdquo; as a shipped product. Anything stronger than
              what the security disclosure says is still roadmap.
            </p>
          </SurfaceCard>
        </div>
      </SectionBand>
    </>
  );
}
