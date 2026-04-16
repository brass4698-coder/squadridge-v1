import { useEffect, useState } from 'react';

type Props = {
  originalBody: string;
  sentAtLabel: string;
  retracted: boolean;
  isOwn: boolean;
  translationEnabled: boolean;
  preferredLanguage: string;
  translationPreferenceEpoch: number;
  /** Epoch captured when this message id first appeared (see SessionPage). */
  receivedEpoch: number;
  translate: (text: string, targetLang: string) => Promise<string>;
  onPullBack: () => void;
};

/**
 * Incoming messages from others can be translated client-side; own messages stay as-is.
 * Does not re-translate when preference epoch changes — parent passes epoch so stale rows show original only.
 */
export function SessionMessageItem({
  originalBody,
  sentAtLabel,
  retracted,
  isOwn,
  translationEnabled,
  preferredLanguage,
  translationPreferenceEpoch,
  receivedEpoch,
  translate,
  onPullBack,
}: Props) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const shouldTranslate =
    !retracted &&
    !isOwn &&
    translationEnabled &&
    receivedEpoch === translationPreferenceEpoch;

  useEffect(() => {
    if (!shouldTranslate) {
      setTranslated(null);
      setPending(false);
      setShowOriginal(false);
      return;
    }

    let cancelled = false;
    setPending(true);
    setTranslated(null);
    setShowOriginal(false);

    void translate(originalBody, preferredLanguage)
      .then((t) => {
        if (cancelled) return;
        setTranslated(t);
        setPending(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTranslated(null);
        setPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shouldTranslate, originalBody, preferredLanguage, translate]);

  const hasAlternate =
    shouldTranslate && translated !== null && translated.trim() !== originalBody.trim();

  const displayText =
    retracted ? 'Message retracted' : showOriginal ? originalBody : (translated ?? originalBody);

  return (
    <li className="rounded-lg border border-[#1a2236] bg-[#0b0f14]/80 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <p
          className={`max-w-full font-sans text-[0.95rem] leading-relaxed text-[#e2e8f0] ${
            retracted ? 'line-through opacity-70' : ''
          } ${!retracted && pending && shouldTranslate ? 'session-translation-pending border-b-2 border-[#148C86]/50 pb-0.5' : ''}`}
        >
          {displayText}
        </p>
        {!retracted ? (
          <button
            type="button"
            className="shrink-0 font-sans text-[0.75rem] font-medium text-teal underline-offset-2 transition-colors hover:text-[#33d4c7] hover:underline"
            onClick={onPullBack}
          >
            Pull back
          </button>
        ) : null}
      </div>
      {hasAlternate ? (
        <button
          type="button"
          className="mt-2 font-sans text-[0.7rem] font-medium text-[#148C86] underline-offset-2 transition-colors hover:text-teal-light hover:underline"
          onClick={() => setShowOriginal((v) => !v)}
        >
          {showOriginal ? 'Show translation' : 'Show original'}
        </button>
      ) : null}
      <p className="mt-2 font-sans text-[0.7rem] text-[#6b7280]">{sentAtLabel}</p>
    </li>
  );
}
