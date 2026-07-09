// ============================================================
// DecksPage — /decks (Phase 5)
//
// /* DEFERRED: pilot-first — pitch materials gallery for investors.
//    Gated to super_admin only. Not part of MVP community-partner demo. */
//
// Showcase of SquadRidge pitch and presentation materials.
//
// Each card either links to `/decks/:id` for a viewer (not yet built —
// renders "Coming Soon") or opens a Request Access mailto until a real
// deck file is uploaded.
// ============================================================
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Lock, Mail } from 'lucide-react';

export interface DeckCard {
  id: string;
  title: string;
  summary: string;
  category: string;
  updated: string;
  /** When true, renders a "Coming soon" overlay and swaps View for Request Access. */
  comingSoon?: boolean;
}

export const DECKS: DeckCard[] = [
  {
    id: 'investor-pitch',
    title: 'Investor Pitch Deck',
    summary: 'Core fundraising deck for Series Pre-Seed. Problem, wedge, traction, and ask.',
    category: 'Fundraising',
    updated: 'Series Pre-Seed · 2026',
    comingSoon: true,
  },
  {
    id: 'product-demo',
    title: 'Product Demo Deck',
    summary: 'Walkthrough of platform features and the resolution UX from invite to outcome.',
    category: 'Product',
    updated: 'Sales enablement · rolling',
    comingSoon: true,
  },
  {
    id: 'security-trust',
    title: 'Security & Trust Overview',
    summary: 'Technical architecture, privacy guarantees, and the encryption / audit model.',
    category: 'Trust',
    updated: 'Aligned with threat model',
    comingSoon: true,
  },
  {
    id: 'use-cases',
    title: 'Use Cases Deck',
    summary: 'Vertical-specific case studies: landlord-tenant, workplace, and family disputes.',
    category: 'Product',
    updated: 'Case-study rolling refresh',
    comingSoon: true,
  },
  {
    id: 'accelerator',
    title: 'Accelerator Application Deck',
    summary: 'YC / Techstars tailored version emphasising founder-market fit and velocity.',
    category: 'Fundraising',
    updated: 'Batch-specific · maintained per cycle',
    comingSoon: true,
  },
  {
    id: 'go-to-market',
    title: 'Go-to-Market Strategy',
    summary: 'TAM/SAM/SOM breakdown, channel strategy, pricing tiers, and pilot playbook.',
    category: 'Strategy',
    updated: 'Rev-model aligned · 2026',
    comingSoon: true,
  },
  {
    id: 'team-vision',
    title: 'Team & Vision',
    summary: 'Founder story, mission, values, and 24-month roadmap through Series A milestones.',
    category: 'Company',
    updated: 'Founder-narrative · 2026',
    comingSoon: true,
  },
];

const REQUEST_MAILTO =
  'mailto:decks@squadridge.com?subject=SquadRidge%20deck%20access%20request&body=I%27d%20like%20to%20access%20a%20SquadRidge%20pitch%20deck.%20Please%20share%20the%20link%20when%20ready.';

export function DecksPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-12 md:py-16">
      {/* Hero */}
      <header className="animate-fade-in-up">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--sr-primary)' }}
        >
          Pitch materials
        </p>
        <h1 className="mt-3 text-h1" style={{ color: 'var(--sr-ink)' }}>
          SquadRidge pitch materials
        </h1>
        <p
          className="mt-4 max-w-2xl text-base leading-relaxed"
          style={{ color: 'var(--sr-ink-secondary)' }}
        >
          The curated set of decks we share with investors, partners, and accelerator programs. Each
          deck is versioned and updated as our thesis and traction evolve.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            title="Available to authorized investors — request access below."
            className="btn-pill btn-pill--ghost"
            aria-disabled="true"
          >
            <Download className="size-4" aria-hidden />
            Download all
          </button>
          <a href={REQUEST_MAILTO} className="btn-pill btn-pill--primary">
            <Mail className="size-4" aria-hidden />
            Request access
          </a>
        </div>
      </header>

      {/* Grid */}
      <section aria-label="Available decks">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DECKS.map((deck, i) => (
            <li key={deck.id}>
              <DeckCardView deck={deck} indexForStagger={i} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeckCardView({ deck, indexForStagger }: { deck: DeckCard; indexForStagger: number }) {
  return (
    <article
      className="animate-fade-in-up group relative flex h-full flex-col rounded-[16px] border p-5 transition-colors"
      style={{
        borderColor: 'var(--sr-line)',
        backgroundColor: 'var(--sr-bg-elevated)',
        animationDelay: `${Math.min(indexForStagger * 40, 280)}ms`,
      }}
    >
      {/* Thumbnail placeholder — subtle gradient preview panel */}
      <div
        className="mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-[10px] text-2xl font-semibold"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--sr-primary) 18%, var(--sr-bg-sunken)), var(--sr-bg-sunken))',
          border: '1px solid var(--sr-divider)',
          color: 'var(--sr-ink-secondary)',
        }}
        aria-hidden
      >
        <span style={{ color: 'var(--sr-primary)' }}>SR</span>
      </div>

      <p
        className="text-[0.7rem] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--sr-primary)' }}
      >
        {deck.category}
      </p>
      <h2 className="mt-1.5 text-h3" style={{ color: 'var(--sr-ink)' }}>
        {deck.title}
      </h2>
      <p
        className="mt-2 flex-1 text-sm leading-relaxed"
        style={{ color: 'var(--sr-ink-secondary)' }}
      >
        {deck.summary}
      </p>
      <p className="mt-4 text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
        {deck.updated}
      </p>

      <div className="mt-5 flex items-center gap-2">
        {deck.comingSoon ? (
          <>
            <a href={REQUEST_MAILTO} className="btn-pill btn-pill--primary flex-1 text-xs">
              <Mail className="size-3.5" aria-hidden />
              Request access
            </a>
            <span
              aria-label="Coming soon"
              title="This deck is not yet published in the viewer"
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[0.7rem] font-medium"
              style={{
                borderColor: 'var(--sr-line)',
                color: 'var(--sr-ink-secondary)',
              }}
            >
              <Lock className="size-3" aria-hidden />
              Coming soon
            </span>
          </>
        ) : (
          <Link to={`/decks/${deck.id}`} className="btn-pill btn-pill--primary flex-1 text-xs">
            View deck
          </Link>
        )}
      </div>
    </article>
  );
}

// ------------------------------------------------------------
// Placeholder viewer for /decks/:id — reserves the URL slot so future PDF
// / slide-embed work has a natural home. Currently shows a "not yet
// available" message and links back to the gallery + a mailto for access.
// ------------------------------------------------------------
export function DeckViewerPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const deck = useMemo(() => DECKS.find((d) => d.id === deckId), [deckId]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[900px] flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="animate-fade-in-up w-full rounded-[16px] border p-8 md:p-12"
        style={{
          borderColor: 'var(--sr-line)',
          backgroundColor: 'var(--sr-bg-elevated)',
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--sr-primary)' }}
        >
          {deck?.category ?? 'Pitch materials'}
        </p>
        <h1 className="mt-3 text-h2" style={{ color: 'var(--sr-ink)' }}>
          {deck?.title ?? 'Deck not found'}
        </h1>
        <p
          className="mt-4 max-w-lg text-sm leading-relaxed"
          style={{ color: 'var(--sr-ink-secondary)' }}
        >
          {deck
            ? 'The viewer for this deck is not yet published. Request access below and we\u2019ll send you the current version directly.'
            : 'That deck ID isn\u2019t in the gallery. Return to the deck list to pick another.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/decks" className="btn-pill btn-pill--ghost">
            Back to decks
          </Link>
          {deck ? (
            <a href={REQUEST_MAILTO} className="btn-pill btn-pill--primary">
              <Mail className="size-4" aria-hidden />
              Request access
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
