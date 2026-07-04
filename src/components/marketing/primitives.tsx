// ============================================================
// Marketing primitives (Phase 7)
//
// Small, opinionated visual pieces used across the landing page rewrite
// and any future marketing surface. Together they form a distinctive
// visual language around the "protected room / public outcome" motif
// that the copy has been leaning on but the design hadn't yet cashed in.
//
// All primitives read `var(--sr-*)` design tokens so they inherit the
// active theme (light marketing shell today, dark auth shell elsewhere).
// ============================================================
import { type ReactNode } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';

// ------------------------------------------------------------
// SectionEyebrow — small uppercase label above section headings. Replaces
// the ad-hoc `<p className="uppercase tracking-widest">` we had scattered
// through 4 sections at slightly different sizes.
// ------------------------------------------------------------
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
      style={{ color: 'var(--sr-primary)' }}
    >
      {children}
    </p>
  );
}

// ------------------------------------------------------------
// PrivacyChip — used to label anything the platform does NOT expose
// publicly (rooms, transcripts, identities). Lock icon + muted surface.
// ------------------------------------------------------------
export function PrivacyChip({ label = 'Private' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium"
      style={{
        borderColor: 'var(--sr-line)',
        background: 'var(--sr-bg-secondary)',
        color: 'var(--sr-ink-secondary)',
      }}
    >
      <Lock className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// VerifiedChip — used to label anything with a cryptographic verification
// anchor (outcomes, participant counts, releases). Teal accent surface.
// ------------------------------------------------------------
export function VerifiedChip({ label = 'Verified' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
      style={{
        border: '1px solid color-mix(in oklch, var(--sr-primary) 30%, transparent)',
        background: 'var(--sr-primary-soft)',
        color: 'var(--sr-primary)',
      }}
    >
      <CheckCircle2 className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// MetadataRow — ledger-style label/value pair. Value can be regular or
// monospace (for IDs, hashes). Used inside the LedgerPreviewArtifact.
// ------------------------------------------------------------
export function MetadataRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-6 border-b py-2.5 last:border-b-0"
      style={{ borderColor: 'var(--sr-divider)' }}
    >
      <dt
        className="shrink-0 text-[0.7rem] font-medium uppercase tracking-wider"
        style={{ color: 'var(--sr-ink-faint)' }}
      >
        {label}
      </dt>
      <dd
        className={`min-w-0 text-right text-sm ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--sr-ink)' }}
      >
        {value}
      </dd>
    </div>
  );
}

// ------------------------------------------------------------
// SplitPanelVisual — the central design motif. Two panels side-by-side:
//   Left  = "Protected room" (private, muted, contains PrivacyChip)
//   Right = "Public outcome"  (verified, accent, contains VerifiedChip)
// A bridge between them represents the controlled release step.
//
// Used prominently in the hero and again (smaller variant) in the
// security section, so the motif reinforces itself as the reader scrolls.
//
// Size variants:
//   'hero'    — dominant hero moment
//   'compact' — inline within a section
// ------------------------------------------------------------
export interface SplitPanelVisualProps {
  size?: 'hero' | 'compact';
  privateHeading?: string;
  privateItems?: string[];
  publicHeading?: string;
  publicItems?: string[];
  bridgeLabel?: string;
}

const DEFAULT_PRIVATE_ITEMS = [
  'Session transcript',
  'Participant identities',
  'Live dialogue signals',
];

const DEFAULT_PUBLIC_ITEMS = ['Approved outcome text', 'Verification anchor', 'Participant count'];

export function SplitPanelVisual({
  size = 'hero',
  privateHeading = 'Protected room',
  privateItems = DEFAULT_PRIVATE_ITEMS,
  publicHeading = 'Public outcome',
  publicItems = DEFAULT_PUBLIC_ITEMS,
  bridgeLabel = 'Controlled release',
}: SplitPanelVisualProps) {
  const isHero = size === 'hero';
  const panelPad = isHero ? 'p-6 md:p-8' : 'p-4 md:p-5';
  const rowGap = isHero ? 'gap-3' : 'gap-2';
  const headingSize = isHero ? 'text-base' : 'text-sm';

  return (
    <div
      className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
      role="figure"
      aria-label="A protected room on the left produces a verified public outcome on the right, connected by a controlled release step."
    >
      {/* Left — Protected room */}
      <div
        className={`rounded-[16px] border ${panelPad} transition-shadow`}
        style={{
          borderColor: 'var(--sr-line)',
          background: 'var(--sr-bg-elevated)',
          boxShadow: 'var(--sr-shadow-sm)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`${headingSize} font-semibold`} style={{ color: 'var(--sr-ink)' }}>
            {privateHeading}
          </h3>
          <PrivacyChip />
        </div>
        <ul className={`flex flex-col ${rowGap}`}>
          {privateItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              style={{
                background: 'var(--sr-bg-secondary)',
                color: 'var(--sr-ink-secondary)',
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: 'var(--sr-ink-faint)' }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Bridge — connector between private + public */}
      <div className="flex flex-col items-center gap-2 md:flex-col">
        <div
          className="hidden h-px w-6 md:block"
          aria-hidden
          style={{
            background: 'linear-gradient(90deg, var(--sr-line), var(--sr-primary))',
          }}
        />
        <span
          className="rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider"
          style={{
            borderColor: 'color-mix(in oklch, var(--sr-primary) 30%, transparent)',
            background: 'var(--sr-primary-soft)',
            color: 'var(--sr-primary)',
          }}
        >
          {bridgeLabel}
        </span>
        <div
          className="hidden h-px w-6 md:block"
          aria-hidden
          style={{
            background: 'linear-gradient(90deg, var(--sr-primary), var(--sr-line))',
          }}
        />
      </div>

      {/* Right — Public outcome */}
      <div
        className={`rounded-[16px] ${panelPad} transition-shadow`}
        style={{
          border: '1px solid color-mix(in oklch, var(--sr-primary) 22%, var(--sr-line))',
          background: 'var(--sr-bg-elevated)',
          boxShadow:
            '0 0 0 1px color-mix(in oklch, var(--sr-primary) 12%, transparent), var(--sr-shadow-sm)',
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`${headingSize} font-semibold`} style={{ color: 'var(--sr-ink)' }}>
            {publicHeading}
          </h3>
          <VerifiedChip />
        </div>
        <ul className={`flex flex-col ${rowGap}`}>
          {publicItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              style={{
                background: 'var(--sr-primary-soft)',
                color: 'var(--sr-ink)',
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: 'var(--sr-primary)' }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
