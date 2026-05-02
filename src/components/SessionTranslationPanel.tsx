import { useEffect, useState } from 'react';
import { useUserPreferences } from '../hooks';
import { COMMON_LANGUAGES, nativeNameForCode } from '../lib';
import { setPreferredLanguage, setTranslationEnabled } from '../store/userPreferences';

const BANNER_DONE_KEY = 'squadridge:translationLoadingBannerDone';

type Props = {
  modelLoading: boolean;
};

/**
 * Session translation preferences + one-time loading banner (client-side models).
 */
const SLOW_LOAD_HINT_MS = 45_000;

export function SessionTranslationPanel({ modelLoading }: Props) {
  const { preferredLanguage, translationEnabled } = useUserPreferences();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    if (!modelLoading) {
      setShowSlowHint(false);
      return;
    }
    const t = window.setTimeout(() => setShowSlowHint(true), SLOW_LOAD_HINT_MS);
    return () => clearTimeout(t);
  }, [modelLoading]);

  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(BANNER_DONE_KEY) === '1';
    } catch {
      done = true;
    }
    if (done) {
      setShowBanner(false);
      return;
    }
    if (!translationEnabled) {
      setShowBanner(false);
      return;
    }
    if (modelLoading) {
      setShowBanner(true);
    } else if (showBanner) {
      try {
        localStorage.setItem(BANNER_DONE_KEY, '1');
      } catch {
        /* ignore */
      }
      setShowBanner(false);
    }
  }, [modelLoading, translationEnabled, showBanner]);

  function onLangChange(next: string) {
    setPreferredLanguage(next);
    setConfirm(`Messages will now appear in ${nativeNameForCode(next)}`);
    window.setTimeout(() => setConfirm(null), 4000);
  }

  const bannerLang = nativeNameForCode(preferredLanguage);

  return (
    <div className="space-y-4">
      {showBanner && modelLoading ? (
        <p
          className="rounded-lg border border-[#148C86]/35 bg-surface-elevated px-4 py-3 font-sans text-[0.85rem] leading-relaxed text-ink-secondary"
          role="status"
        >
          Translation is loading for your language — messages will appear in {bannerLang} shortly.
          {showSlowHint ? (
            <span className="mt-2 block text-[0.8rem] text-[#8892a4]">
              First load can take a while on slow networks (the model is large). If the wait is too
              long, we’ll temporarily show the original text until you reconnect.
            </span>
          ) : null}
        </p>
      ) : null}

      <div className="rounded-lg border border-line bg-surface-elevated p-4">
        <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
          Translation
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-[#2d3f55] bg-[#0b0f14] text-teal focus:ring-[#148C86]"
            checked={translationEnabled}
            onChange={(e) => setTranslationEnabled(e.target.checked)}
          />
          <span className="font-sans text-[0.9rem] text-ink">
            Translate messages to your language
          </span>
        </label>

        <div className="mt-4">
          <label htmlFor="session-lang-select" className="sr-only">
            Preferred language
          </label>
          <select
            id="session-lang-select"
            className="w-full max-w-xs rounded-lg border border-line bg-[#0b0f14] px-3 py-2 font-sans text-[0.9rem] text-ink focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#148C86]/40"
            value={
              COMMON_LANGUAGES.some((l) => l.code === preferredLanguage) ? preferredLanguage : 'en'
            }
            disabled={!translationEnabled}
            onChange={(e) => onLangChange(e.target.value)}
          >
            {COMMON_LANGUAGES.map(({ code, nativeName }) => (
              <option key={code} value={code}>
                {nativeName}
              </option>
            ))}
          </select>
        </div>

        {confirm ? (
          <p className="mt-3 font-sans text-[0.8rem] text-[#148C86]" role="status">
            {confirm}
          </p>
        ) : null}

        <p className="mt-4 border-t border-line pt-3 font-sans text-[0.75rem] leading-relaxed text-[#6b7280]">
          Translation runs on your device. Your messages are never sent to a translation server.
        </p>
      </div>
    </div>
  );
}
