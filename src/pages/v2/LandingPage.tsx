import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { OPERATIONAL_CONTEXTS } from '../../data/institutionalHome';
import { homepageSampleRecord } from '../../data/sampleRecords';
import { CTA } from '../../data/siteMessaging';
import { InterfaceEvidence, SystemModelSequence, TrustBar } from '../../components/institutional';
import {
  EvaluatorPath,
  FAQAccordion,
  MarketingSection,
  RecordCard,
  SectionLabel,
} from '../../components/shared';
import { faqHome } from '../../data/faqHome';

const HERO_PROOF = [
  'Limited-entry rooms, verified access',
  'No public transcript, no open feed',
  'Approval-gated release with a verifiable anchor',
] as const;

const TRUST_PILLARS = [
  {
    title: 'Privacy boundary',
    body: 'The room and the record are separate systems — separation by architecture, not a policy you must trust.',
  },
  {
    title: 'Facilitator authority',
    body: 'You control access, pace, approvals, and whether an outcome is ever released. The platform does not decide.',
  },
  {
    title: 'Verification anchor',
    body: 'Every released record carries a tamper-evident hash anyone can recompute to confirm it was not altered.',
  },
  {
    title: 'Documented limits',
    body: 'We state exactly what is protected and what is not — no overclaimed end-to-end encryption or zero-knowledge.',
  },
] as const;

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <TrustBar />
      <SystemModelSection />
      <TrustPillarsSection />
      <ContextsSection />
      <InterfaceSection />
      <LedgerSection />
      <FaqSection />
      <PilotIntakeSection />
    </div>
  );
}

function HeroSection() {
  return (
    <MarketingSection className="!pb-16 !pt-20 md:!pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel text="For mediators, facilitators, and institutional conveners" />
        <h1 className="font-display text-[clamp(2rem,4.2vw,3.5rem)] font-medium leading-[1.08] tracking-tight text-ink">
          Verified deliberation
          <br className="hidden sm:block" /> for sensitive decisions.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-secondary">
          SquadRidge gives facilitators and institutions a protected room where a limited number of
          verified participants work through high-stakes issues — contributing without public
          attribution — and release only outcome records that can be trusted outside the room.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/request-access" className="btn-institutional btn-institutional--primary">
            Request pilot access
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <a href="#system-model" className="btn-institutional btn-institutional--ghost">
            See the release flow
          </a>
        </div>

        <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {HERO_PROOF.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm text-ink-secondary">
              <Check className="size-3.5 shrink-0 text-brand" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </MarketingSection>
  );
}

function SystemModelSection() {
  return (
    <MarketingSection id="system-model" className="border-t border-line">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionLabel text="The model" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            One document, three governed states.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            The room and the record are separate by design. Follow a single matter through each
            state — and see, at every step, who is in control and what never becomes public.
          </p>
        </div>
        <div className="mt-12">
          <SystemModelSequence />
        </div>
      </div>
    </MarketingSection>
  );
}

function TrustPillarsSection() {
  return (
    <MarketingSection className="border-t border-line bg-surface-sunken/50">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionLabel text="Trust model" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            Why institutions trust the outcome.
          </h2>
        </div>
        <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar) => (
            <li key={pillar.title} className="bg-surface-elevated p-6">
              <h3 className="text-sm font-semibold tracking-tight text-ink">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{pillar.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-faint">
          <Link to="/security" className="text-ink-secondary underline-offset-4 hover:underline">
            Read the full security model
          </Link>
        </p>
      </div>
    </MarketingSection>
  );
}

function ContextsSection() {
  return (
    <MarketingSection className="border-t border-line">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionLabel text="One room model" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            Different matters. The same governed room.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            Every context below runs on the same mechanism: verified entry, protected written
            deliberation under a facilitator, and a deliberate release of only what the group
            approved.
          </p>
        </div>
        <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2">
          {OPERATIONAL_CONTEXTS.map((ctx) => (
            <li key={ctx.label} className="bg-surface-elevated p-6 md:p-8">
              <h3 className="text-sm font-semibold text-ink">{ctx.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{ctx.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-faint">
          <Link to="/use-cases" className="text-ink-secondary underline-offset-4 hover:underline">
            Operational use cases
          </Link>
        </p>
      </div>
    </MarketingSection>
  );
}

function InterfaceSection() {
  return (
    <MarketingSection className="border-t border-line bg-surface-sunken/50">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionLabel text="Product evidence" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            Facilitator oversight and release, in one view.
          </h2>
        </div>
        <div className="mt-10">
          <InterfaceEvidence />
        </div>
      </div>
    </MarketingSection>
  );
}

function LedgerSection() {
  return (
    <MarketingSection className="border-t border-line">
      <div className="mx-auto max-w-3xl">
        <SectionLabel text="Released record" />
        <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
          What a published outcome looks like.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          Approved outcome text, limited metadata, and a verification anchor — no session room
          content.{' '}
          <Link to="/ledger" className="text-ink-secondary underline-offset-4 hover:underline">
            Browse the ledger
          </Link>
        </p>
        <div className="mt-10">
          <RecordCard {...homepageSampleRecord} />
        </div>
      </div>
    </MarketingSection>
  );
}

function FaqSection() {
  return (
    <MarketingSection className="border-t border-line bg-surface-sunken/50">
      <div className="mx-auto max-w-3xl">
        <SectionLabel text="For mediators" />
        <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
          Questions before a pilot.
        </h2>
        <div className="mt-10">
          <FAQAccordion items={faqHome} />
        </div>
        <p className="mt-6 text-sm text-ink-faint">
          <Link to="/faq" className="text-ink-secondary underline-offset-4 hover:underline">
            Full FAQ
          </Link>
        </p>
      </div>
    </MarketingSection>
  );
}

function PilotIntakeSection() {
  return (
    <MarketingSection className="border-t border-line" id="pilot">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionLabel text="Pilot access" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            {CTA.pilotHeadline}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">{CTA.pilotBody}</p>
        </div>

        <div className="mt-10">
          <EvaluatorPath />
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--primary">
            {CTA.primaryLabel}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link to="/contact" className="btn-institutional btn-institutional--ghost">
            {CTA.briefingHeadline}
          </Link>
        </div>
      </div>
    </MarketingSection>
  );
}
