import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { audiences } from '../../data/audiences';
import { builtForDialogueItems } from '../../data/builtForDialogue';
import { comparisonRows } from '../../data/comparisonRows';
import { faqHome } from '../../data/faqHome';
import { privatePublicItems } from '../../data/privatePublicItems';
import { homepageSampleRecord } from '../../data/sampleRecords';
import { stages } from '../../data/stages';
import {
  ComparisonTable,
  CTABlock,
  FAQAccordion,
  MarketingSection,
  PilotAccessTeaser,
  PrivatePublicSplit,
  RecordCard,
  SectionLabel,
  StageCard,
} from '../../components/shared';

const FOUNDER_BELIEF_QUOTE =
  'We kept seeing sensitive conversations stall the moment someone feared a leak — and fall apart when there was no credible way to show what had been agreed. We built SquadRidge to hold one clear line between the dialogue and the record, so parties can speak freely and still stand behind what they release.';

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <BuiltForDialogueSection />
      <WhySection />
      <FounderBeliefSection />
      <LifecycleTeaserSection />
      <BuiltForSection />
      <SecurityTeaserSection />
      <LedgerPreviewSection />
      <FaqSection />
      <PilotAccessTeaser />
      <CTABlock
        headline="Ready to run a protected session?"
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />
    </div>
  );
}

function HeroSection() {
  return (
    <MarketingSection>
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <SectionLabel text="When the conversation is sensitive, the wrong tool can end it." />
          <h1 className="font-display text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
            <span className="whitespace-nowrap">Protected dialogue.</span>{' '}
            <span className="whitespace-nowrap text-brand">Verifiable outcomes.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Run mediation sessions and peacebuilding deliberations in a protected room, then release
            a public record anyone can verify — without exposing who said what.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to="/request-access" className="btn-pill btn-pill--primary text-sm">
              Request pilot access
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              See how it works
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface-elevated px-3 py-1.5 text-[0.7rem] font-medium text-ink-faint">
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand motion-reduce:animate-none"
              />
              Private pilot — now inviting mediators and peacebuilding teams
            </div>
            <p className="text-xs font-medium tracking-wide text-ink-faint">
              Privacy by design. Built for peace, built to last.
            </p>
          </div>
        </div>
        <PrivatePublicSplit
          size="hero"
          privateItems={privatePublicItems.private}
          publicItems={privatePublicItems.public}
        />
      </div>
    </MarketingSection>
  );
}

function BuiltForDialogueSection() {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <SectionLabel text="Built for sensitive dialogue" />
          <h2 className="text-h2 text-ink">
            Architecture for high-stakes rooms — not general chat.
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {builtForDialogueItems.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-line bg-surface-elevated p-5 text-sm leading-relaxed text-ink-secondary"
            >
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-brand"
                strokeWidth={1.75}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </MarketingSection>
  );
}

function WhySection() {
  return (
    <MarketingSection id="why">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <SectionLabel text="Why ordinary tools fail" />
          <h2 className="text-h2 text-ink">
            Video calls have no record. Docs expose everything. Surveys don't verify.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            None were built for high-stakes dialogue that still needs a credible public outcome.
          </p>
        </div>
        <ComparisonTable rows={comparisonRows} />
      </div>
    </MarketingSection>
  );
}

function FounderBeliefSection() {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-3xl">
        <blockquote className="rounded-lg border border-line bg-surface-elevated p-8 md:p-10">
          <p className="text-base leading-relaxed text-ink md:text-lg">
            &ldquo;{FOUNDER_BELIEF_QUOTE}&rdquo;
          </p>
          <footer className="mt-4 text-xs font-medium text-ink-faint">— The SquadRidge team</footer>
        </blockquote>
        <p className="mt-4 text-center text-xs text-ink-faint">
          <Link to="/about" className="text-brand underline-offset-4 hover:underline">
            Our founding story
          </Link>
        </p>
      </div>
    </MarketingSection>
  );
}

function LifecycleTeaserSection() {
  return (
    <MarketingSection id="lifecycle">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <SectionLabel text="Session lifecycle" />
          <h2 className="text-h2 text-ink">Four stages. One protected process.</h2>
          <p className="mt-4 text-sm text-ink-secondary">
            <Link to="/how-it-works" className="text-brand underline-offset-4 hover:underline">
              How it works
            </Link>{' '}
            explains each stage and the three workflows behind them.
          </p>
        </div>
        <ol className="relative grid gap-8 md:grid-cols-4">
          <div aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-line md:block" />
          {stages.map((stage) => (
            <StageCard
              key={stage.number}
              number={stage.number}
              title={stage.title}
              description={stage.shortDescription}
              variant="teaser"
            />
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link
            to="/ledger"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            Browse the ledger
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </MarketingSection>
  );
}

function BuiltForSection() {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <SectionLabel text="Built for" />
          <h2 className="text-h2 text-ink">The work that needs precision, not audience.</h2>
          <p className="mt-4 text-sm text-ink-secondary">
            <Link to="/use-cases" className="text-brand underline-offset-4 hover:underline">
              Use cases
            </Link>{' '}
            shows six concrete scenarios across these audiences.
          </p>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {audiences.map((audience) => (
            <li
              key={audience.label}
              className="flex flex-col gap-3 rounded-lg border border-line bg-surface-elevated p-6"
            >
              <p className="text-xs font-semibold tracking-wide text-ink-faint">{audience.tag}</p>
              <h3 className="text-lg font-semibold text-ink">{audience.label}</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">{audience.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </MarketingSection>
  );
}

function SecurityTeaserSection() {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-3xl">
        <SectionLabel text="Verified, not exposed" />
        <h2 className="text-h2 text-ink">Security by architecture, not by promise.</h2>
        <p className="mt-4 text-base leading-relaxed text-ink-secondary">
          No raw session data is ever published — only facilitator-approved outcomes, each carrying
          a verification anchor. The room and the record stay separate by design.{' '}
          <Link to="/security" className="text-brand underline-offset-4 hover:underline">
            Full security model
          </Link>
        </p>
        <div className="mt-6 flex items-start gap-2.5">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-ink-faint"
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-ink-faint">
            The anchor confirms record integrity — see Security for what it proves and what it does
            not expose.
          </p>
        </div>
      </div>
    </MarketingSection>
  );
}

function LedgerPreviewSection() {
  return (
    <MarketingSection>
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 max-w-2xl">
          <SectionLabel text="Public ledger" />
          <h2 className="text-h2 text-ink">This is what a released record looks like.</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-secondary">
            Approved outcome text, a verification anchor, and limited metadata — nothing from the
            session room.{' '}
            <Link to="/ledger" className="text-brand underline-offset-4 hover:underline">
              Browse the ledger
            </Link>
          </p>
        </div>
        <RecordCard {...homepageSampleRecord} />
      </div>
    </MarketingSection>
  );
}

function FaqSection() {
  return (
    <MarketingSection id="faq">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <SectionLabel text="Common questions" />
          <h2 className="text-h2 text-ink">Answers before you ask.</h2>
          <p className="mt-3 text-sm text-ink-secondary">
            <Link to="/faq" className="text-brand underline-offset-4 hover:underline">
              Full FAQ
            </Link>{' '}
            covers everything else.
          </p>
        </div>
        <FAQAccordion items={faqHome} />
      </div>
    </MarketingSection>
  );
}
