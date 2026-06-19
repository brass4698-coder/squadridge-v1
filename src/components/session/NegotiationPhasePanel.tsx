import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, User, Lightbulb, Clock } from 'lucide-react';
import { formatCountdown } from '../../lib/sessionPhases';

interface NegotiationInput {
  label: string;
  body: string;
}

interface NegotiationPhasePanelProps {
  inputs: NegotiationInput[];
  timeRemainingMs: number | null;
  isExpired: boolean;
  sessionQuestion: string | null;
  children: React.ReactNode; // The existing chat composer + message list
}

/**
 * NegotiationPhasePanel — wraps the existing chat infrastructure with:
 * - Pinned reference panel showing all revealed inputs (collapsible)
 * - AI-suggested synthesis prompts
 * - Countdown timer
 * - Context-aware guidance
 *
 * The `children` prop receives the existing message list + composer from SessionPage.
 */
export function NegotiationPhasePanel({
  inputs,
  timeRemainingMs,
  isExpired,
  sessionQuestion,
  children,
}: NegotiationPhasePanelProps) {
  const [referencePanelOpen, setReferencePanelOpen] = useState(false);

  const synthesisSuggestions = generateSynthesisSuggestions(inputs, sessionQuestion);

  return (
    <div className="sr-page-enter space-y-4">
      {/* Negotiation header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg border border-brand/25 bg-brand/[0.08] text-brand">
            <MessageSquare className="size-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-sans text-[0.9rem] font-semibold text-ink">Negotiation</p>
            <p className="font-sans text-[0.72rem] text-ink-faint">
              {inputs.length} positions on the table • discuss and synthesize
            </p>
          </div>
        </div>
        {timeRemainingMs !== null ? (
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[0.85rem] font-bold tabular-nums ${
              isExpired
                ? 'border-sem-danger/40 text-sem-danger'
                : timeRemainingMs < 300_000
                  ? 'border-amber/30 text-amber-light'
                  : 'border-white/[0.06] text-ink'
            }`}
          >
            <Clock className="size-3.5 opacity-50" />
            {isExpired ? 'Time' : formatCountdown(timeRemainingMs)}
          </div>
        ) : null}
      </div>

      {/* Collapsible reference panel — all revealed inputs */}
      <details
        className="group rounded-xl border border-line bg-surface-elevated"
        open={referencePanelOpen}
        onToggle={(e) => setReferencePanelOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-sans text-[0.82rem] font-medium text-ink-secondary hover:text-ink">
          <span className="flex items-center gap-2">
            <User className="size-3.5 text-ink-faint" />
            Reference: All submitted positions ({inputs.length})
          </span>
          {referencePanelOpen ? (
            <ChevronUp className="size-4 text-ink-faint" />
          ) : (
            <ChevronDown className="size-4 text-ink-faint" />
          )}
        </summary>
        <div className="max-h-[320px] space-y-3 overflow-y-auto border-t border-white/[0.04] px-4 py-3">
          {inputs.map((input, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2.5"
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                {input.label}
              </p>
              <p className="mt-1 line-clamp-4 font-sans text-[0.8rem] leading-relaxed text-ink-secondary">
                {input.body}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* AI synthesis suggestions */}
      {synthesisSuggestions.length > 0 ? (
        <div className="rounded-xl border border-dashed border-brand/15 bg-brand/[0.02] px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-brand/60" />
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand/70">
              Synthesis prompts
            </p>
          </div>
          <ul className="space-y-1.5">
            {synthesisSuggestions.map((s, idx) => (
              <li key={idx} className="font-sans text-[0.78rem] leading-relaxed text-ink-faint">
                → {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* The actual chat — children from SessionPage */}
      {children}
    </div>
  );
}

/**
 * Generate simple synthesis prompts based on the number of inputs.
 * In production this would use an LLM to identify common themes and tensions.
 */
function generateSynthesisSuggestions(
  inputs: NegotiationInput[],
  question: string | null,
): string[] {
  if (inputs.length < 2) return [];

  const suggestions: string[] = [];

  if (inputs.length >= 2) {
    suggestions.push(
      `Consider how ${inputs[0]?.label}'s approach and ${inputs[1]?.label}'s approach could complement each other.`,
    );
  }
  if (inputs.length >= 3) {
    suggestions.push(
      'Identify the common ground across all positions — what do all participants agree on?',
    );
  }
  if (inputs.length >= 4) {
    suggestions.push(
      'What is the most actionable proposal that addresses the core concerns raised by each participant?',
    );
  }
  if (question) {
    suggestions.push(
      'Focus on proposals that can be implemented within existing institutional frameworks.',
    );
  }

  return suggestions;
}

export default NegotiationPhasePanel;
