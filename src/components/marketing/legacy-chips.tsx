import { CheckCircle2, Lock } from 'lucide-react';
import { type ReactNode } from 'react';

// ------------------------------------------------------------
// PrivacyChip — used to label anything the platform does NOT expose
// publicly (rooms, transcripts, identities). Lock icon + muted surface.
// ------------------------------------------------------------
export function PrivacyChip({ label = 'Private' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-secondary px-2.5 py-1 text-[0.7rem] font-medium text-ink-secondary">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-[0.7rem] font-medium text-brand">
      <CheckCircle2 className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// MetadataRow — ledger-style label/value pair. Value can be regular or
// monospace (for IDs, hashes). Used inside record detail views.
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
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[0.7rem] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd className={`min-w-0 text-right text-sm text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
