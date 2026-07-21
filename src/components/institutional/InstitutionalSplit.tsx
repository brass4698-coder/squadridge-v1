import type { ReactNode } from 'react';
import { StatusBadge } from '../StatusBadge';

const ROOM_LINES = [
  'Participant A — verified',
  'Participant B — verified',
  'Facilitator prompt — round 2',
  'Written response — [redacted label]',
] as const;

const RECORD_LINES = [
  'Outcome summary — facilitator-authored',
  'Agreed terms — approved',
  'Participant count — 4',
  'Anchor — sha256:8f3a…c21d',
] as const;

export function InstitutionalSplit() {
  return (
    <div
      className="relative grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6"
      role="figure"
      aria-label="Private mediation room separated from released public record by facilitator-controlled release"
    >
      <DocumentPanel
        title="Mediation room"
        badge={<StatusBadge variant="private">Private</StatusBadge>}
        lines={ROOM_LINES}
        footer="Room content never auto-publishes"
      />

      <div className="flex items-center justify-center px-2 py-2 lg:flex-col lg:py-0">
        <div
          className="hidden h-full w-px bg-[color:var(--color-border-subtle)] lg:block"
          aria-hidden
        />
        <p className="shrink-0 text-center font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
          Your release gate
        </p>
        <div
          className="hidden h-full w-px bg-[color:var(--color-border-subtle)] lg:block"
          aria-hidden
        />
      </div>

      <DocumentPanel
        title="Released record"
        badge={<StatusBadge variant="published">Published</StatusBadge>}
        lines={RECORD_LINES}
        footer="Independently verifiable anchor"
      />
    </div>
  );
}

function DocumentPanel({
  title,
  badge,
  lines,
  footer,
}: {
  title: string;
  badge: ReactNode;
  lines: readonly string[];
  footer: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-raised)] p-[var(--space-5)]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {badge}
      </header>
      <ul className="flex flex-1 flex-col gap-2">
        {lines.map((line) => (
          <li
            key={line}
            className="border border-[color:var(--color-border-subtle)] bg-surface-sunken px-3 py-2.5 font-mono text-xs text-ink-secondary"
          >
            {line}
          </li>
        ))}
      </ul>
      <footer className="mt-4 border-t border-[color:var(--color-border-subtle)] pt-3 text-xs text-ink-faint">
        {footer}
      </footer>
    </div>
  );
}
