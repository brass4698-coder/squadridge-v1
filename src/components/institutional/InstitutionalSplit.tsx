import type { ReactNode } from 'react';
import { StatusChip } from './StatusChip';

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
      className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch"
      role="figure"
      aria-label="Private mediation room separated from released public record by facilitator-controlled release"
    >
      <DocumentPanel
        title="Mediation room"
        chip={<StatusChip label="Private" variant="private" />}
        lines={ROOM_LINES}
        footer="Room content never auto-publishes"
      />

      <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 lg:py-0">
        <div className="hidden h-full w-px bg-line-strong lg:block" aria-hidden />
        <p className="max-w-[8rem] text-center font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
          Your release gate
        </p>
        <div className="hidden h-full w-px bg-line-strong lg:block" aria-hidden />
      </div>

      <DocumentPanel
        title="Released record"
        chip={<StatusChip label="Published" variant="released" />}
        lines={RECORD_LINES}
        footer="Independently verifiable anchor"
      />
    </div>
  );
}

function DocumentPanel({
  title,
  chip,
  lines,
  footer,
}: {
  title: string;
  chip: ReactNode;
  lines: readonly string[];
  footer: string;
}) {
  return (
    <div className="flex flex-col border border-line bg-surface-elevated">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {chip}
      </header>
      <ul className="flex flex-1 flex-col gap-2 px-5 py-5">
        {lines.map((line) => (
          <li
            key={line}
            className="border border-line bg-surface-sunken px-3 py-2.5 font-mono text-xs text-ink-secondary"
          >
            {line}
          </li>
        ))}
      </ul>
      <footer className="border-t border-line px-5 py-3 text-xs text-ink-faint">{footer}</footer>
    </div>
  );
}
