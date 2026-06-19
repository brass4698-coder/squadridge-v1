import { useEffect, useState } from 'react';
import { Eye, User, Globe, Clock } from 'lucide-react';
import { formatCountdown } from '../../lib/sessionPhases';

interface RevealInput {
  id: string;
  user_id: string;
  encrypted_content: string;
}

interface RevealPhasePanelProps {
  inputs: RevealInput[];
  timeRemainingMs: number | null;
  decryptContent: (encrypted: string) => Promise<string>;
}

const PARTICIPANT_LABELS = [
  'Participant A',
  'Participant B',
  'Participant C',
  'Participant D',
  'Participant E',
  'Participant F',
  'Participant G',
  'Participant H',
];

const STAGGER_DELAY_MS = 400;

/**
 * RevealPhasePanel — all inputs appear simultaneously with staggered animation.
 *
 * Inputs are decrypted client-side and displayed in anonymous cards.
 * A 45-second reading hold lets participants absorb before negotiation.
 */
export function RevealPhasePanel({
  inputs,
  timeRemainingMs,
  decryptContent,
}: RevealPhasePanelProps) {
  const [decryptedInputs, setDecryptedInputs] = useState<
    { label: string; body: string; visible: boolean }[]
  >([]);
  const [allRevealed, setAllRevealed] = useState(false);

  // Decrypt all inputs on mount
  useEffect(() => {
    let cancelled = false;

    async function decryptAll() {
      const results = await Promise.all(
        inputs.map(async (input, idx) => {
          try {
            const body = await decryptContent(input.encrypted_content);
            return {
              label: PARTICIPANT_LABELS[idx] ?? `Participant ${idx + 1}`,
              body,
              visible: false,
            };
          } catch {
            return {
              label: PARTICIPANT_LABELS[idx] ?? `Participant ${idx + 1}`,
              body: '[Unable to decrypt]',
              visible: false,
            };
          }
        }),
      );
      if (!cancelled) setDecryptedInputs(results);
    }

    void decryptAll();
    return () => {
      cancelled = true;
    };
  }, [inputs, decryptContent]);

  // Staggered reveal animation
  useEffect(() => {
    if (decryptedInputs.length === 0) return;

    const timers: number[] = [];
    decryptedInputs.forEach((_, idx) => {
      const timer = window.setTimeout(() => {
        setDecryptedInputs((prev) =>
          prev.map((item, i) => (i === idx ? { ...item, visible: true } : item)),
        );
      }, idx * STAGGER_DELAY_MS);
      timers.push(timer);
    });

    const doneTimer = window.setTimeout(
      () => {
        setAllRevealed(true);
      },
      decryptedInputs.length * STAGGER_DELAY_MS + 200,
    );
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [decryptedInputs]);

  return (
    <div className="sr-page-enter space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg border border-brand/25 bg-brand/[0.08] text-brand">
            <Eye className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-sans text-[0.95rem] font-semibold text-ink">
              All responses revealed
            </p>
            <p className="font-sans text-[0.78rem] text-ink-secondary">
              {inputs.length} anonymous responses • read before discussing
            </p>
          </div>
        </div>
        {timeRemainingMs !== null ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 font-mono text-[0.85rem] font-bold tabular-nums text-ink">
            <Clock className="size-3.5 opacity-50" />
            {formatCountdown(timeRemainingMs)}
          </div>
        ) : null}
      </div>

      {/* Anonymity notice */}
      <div className="flex items-center gap-2 rounded-lg border border-brand/10 bg-brand/[0.02] px-4 py-2.5">
        <Globe className="size-4 text-brand/50" />
        <p className="font-sans text-[0.75rem] text-ink-faint">
          All inputs have been translated to your native language client-side. No origin, IP, or
          identity metadata is attached.
        </p>
      </div>

      {/* Input cards */}
      <div className="space-y-4">
        {decryptedInputs.map((item, idx) => (
          <div
            key={idx}
            className={`transition-all duration-700 ease-out ${
              item.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            <RevealCard label={item.label} body={item.body} index={idx} />
          </div>
        ))}
      </div>

      {/* Post-reveal CTA */}
      {allRevealed ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-3 text-center">
          <p className="mx-auto font-sans text-[0.85rem] text-ink-secondary italic">
            Negotiation begins shortly. Consider how these perspectives could be synthesized.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ── Reveal Card ─────────────────────────────────────────────────────

const ACCENT_COLORS = [
  'border-l-teal',
  'border-l-amber',
  'border-l-trust-blue',
  'border-l-sem-success',
  'border-l-[#a855f7]',
  'border-l-[#ec4899]',
  'border-l-[#f97316]',
  'border-l-[#06b6d4]',
];

function RevealCard({ label, body, index }: { label: string; body: string; index: number }) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <article
      className={`card-lift rounded-xl border border-line bg-surface-elevated ${accent} border-l-[3px] overflow-hidden`}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 bg-white/[0.01]">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/[0.05] text-ink-faint">
          <User className="size-3.5" />
        </span>
        <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {label}
        </span>
      </div>
      <div className="px-5 py-4">
        <p className="whitespace-pre-wrap font-sans text-[0.88rem] leading-[1.75] text-ink-secondary">
          {body}
        </p>
      </div>
    </article>
  );
}

export default RevealPhasePanel;
