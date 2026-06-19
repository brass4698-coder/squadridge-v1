import { useCallback, useEffect, useRef, useState } from 'react';
import { PenLine, Lock, Send, Check, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { formatCountdown } from '../../lib/sessionPhases';

interface InputPhasePanelProps {
  sessionQuestion: string | null;
  timeRemainingMs: number | null;
  isExpired: boolean;
  myInput: { encrypted_content: string; is_final: boolean } | null;
  finalCount: number;
  memberCount: number;
  onSaveInput: (content: string, isFinal: boolean) => Promise<void>;
  /** Encrypt plaintext before saving. Returns encrypted string. */
  encryptContent: (plaintext: string) => Promise<string>;
  /** Decrypt encrypted content for editing. Returns plaintext. */
  decryptContent: (encrypted: string) => Promise<string>;
}

const MIN_CHARS = 100;
const MAX_CHARS = 3000;
const AUTOSAVE_INTERVAL_MS = 10_000;

/**
 * InputPhasePanel — 20-minute isolated writing phase.
 *
 * Each participant writes their response to the session question.
 * Inputs are encrypted and stored; other participants cannot see them
 * until the reveal phase (enforced by RLS on session_inputs).
 *
 * Features:
 * - Large focused textarea with character guidance
 * - Countdown timer integration
 * - Auto-save every 10 seconds (non-final)
 * - Manual "Lock & Submit" for final submission
 * - Auto-submit on timer expiry
 */
export function InputPhasePanel({
  sessionQuestion,
  timeRemainingMs,
  isExpired,
  myInput,
  finalCount,
  memberCount,
  onSaveInput,
  encryptContent,
  decryptContent,
}: InputPhasePanelProps) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const lastSavedRef = useRef('');

  // Restore existing draft on mount
  useEffect(() => {
    if (initialized) return;
    if (myInput) {
      setLocked(myInput.is_final);
      void decryptContent(myInput.encrypted_content)
        .then((plain) => {
          setText(plain);
          lastSavedRef.current = plain;
          setInitialized(true);
        })
        .catch(() => {
          setInitialized(true);
        });
    } else {
      setInitialized(true);
    }
  }, [myInput, decryptContent, initialized]);

  // Define handleFinalSubmit first so it can be used in useEffect
  const handleFinalSubmit = useCallback(
    async (autoTriggered = false) => {
      const trimmed = text.trim();
      if (!trimmed) {
        toast.error('Write your response before submitting.');
        return;
      }
      if (trimmed.length < MIN_CHARS) {
        toast.error(`Minimum ${MIN_CHARS} characters. You have ${trimmed.length}.`);
        return;
      }

      setSaving(true);
      try {
        const encrypted = await encryptContent(trimmed);
        await onSaveInput(encrypted, true);
        setLocked(true);
        lastSavedRef.current = trimmed;
        toast.success(
          autoTriggered
            ? 'Time expired — your response has been submitted.'
            : 'Response locked and submitted.',
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not submit your response.');
      } finally {
        setSaving(false);
      }
    },
    [text, encryptContent, onSaveInput],
  );

  // Auto-save draft periodically
  useEffect(() => {
    if (locked || !initialized) return;

    autosaveTimerRef.current = window.setInterval(async () => {
      const trimmed = text.trim();
      if (trimmed && trimmed !== lastSavedRef.current) {
        try {
          const encrypted = await encryptContent(trimmed);
          await onSaveInput(encrypted, false);
          lastSavedRef.current = trimmed;
        } catch {
          // Silent autosave failure — don't disturb the writer
        }
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [text, locked, initialized, encryptContent, onSaveInput]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (isExpired && !locked && text.trim()) {
      void handleFinalSubmit(true);
    }
  }, [isExpired, locked, text, handleFinalSubmit]);

  const charCount = text.trim().length;
  const charOk = charCount >= MIN_CHARS;
  const charWarning = charCount > MAX_CHARS;

  return (
    <div className="sr-page-enter space-y-4">
      {/* Status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {locked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.06] px-3 py-1 font-mono text-[0.72rem] font-semibold text-brand">
              <Lock className="size-3" />
              Submitted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/[0.04] px-3 py-1 font-mono text-[0.72rem] font-semibold text-amber-light">
              <PenLine className="size-3" />
              Writing
            </span>
          )}
        </div>
        <span className="font-mono text-[0.72rem] tabular-nums text-ink-faint">
          {finalCount} of {memberCount} submitted
        </span>
      </div>

      {/* Writing area */}
      <div
        className={`relative overflow-hidden rounded-xl border transition-all ${
          locked ? 'border-brand/20 bg-brand/[0.02]' : 'border-line bg-surface-elevated'
        }`}
      >
        {/* Privacy notice */}
        <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 bg-white/[0.01]">
          <Shield className="size-3.5 text-brand/60" />
          <p className="font-sans text-[0.72rem] text-ink-faint">
            Your response is encrypted and invisible to other participants until reveal.
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={locked || saving}
          maxLength={MAX_CHARS + 200} // Soft limit with buffer
          rows={12}
          placeholder={
            sessionQuestion
              ? 'Write your response to the question above. Be specific about your proposed solution, its rationale, and how it could be implemented.'
              : 'Write your response...'
          }
          className="block w-full resize-y border-0 bg-transparent px-5 py-4 font-sans text-[0.95rem] leading-[1.75] text-ink placeholder:text-ink-subtle/60 focus:outline-none disabled:opacity-60"
          aria-label="Session input"
        />

        {/* Character counter */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-2">
          <span
            className={`font-mono text-[0.68rem] tabular-nums ${
              charWarning ? 'text-sem-danger' : charOk ? 'text-ink-faint' : 'text-amber-light'
            }`}
          >
            {charCount.toLocaleString()} / {MIN_CHARS.toLocaleString()} min
            {charWarning ? (
              <>
                {' '}
                <AlertTriangle className="inline size-3" /> approaching limit
              </>
            ) : null}
          </span>
          {!locked ? (
            <span className="font-sans text-[0.68rem] text-ink-subtle">Auto-saving draft</span>
          ) : null}
        </div>
      </div>

      {/* Submit controls */}
      {!locked ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-sans text-[0.78rem] leading-relaxed text-ink-faint">
            Once submitted, your response is locked. Write with intention —
            {timeRemainingMs !== null
              ? ` you have ${formatCountdown(timeRemainingMs)} remaining.`
              : ' take your time.'}
          </p>
          <button
            type="button"
            onClick={() => void handleFinalSubmit(false)}
            disabled={saving || !charOk}
            className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? (
              'Submitting…'
            ) : (
              <>
                <Send className="size-4" />
                Lock &amp; Submit
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-brand/15 bg-brand/[0.03] px-4 py-3">
          <Check className="size-5 text-brand" />
          <p className="font-sans text-[0.88rem] text-ink-secondary">
            Your response is locked. Waiting for other participants to submit.
          </p>
        </div>
      )}
    </div>
  );
}

export default InputPhasePanel;
