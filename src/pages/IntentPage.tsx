import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/env';
import { clearSessionIntent, writeSessionIntent } from '../lib/intentStorage';
import { createDemoSquad } from '../lib/squad';

const MAX_CHARS = 300;

const headingStyle: CSSProperties = {
  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: '#f1f5f9',
};

const primaryCtaStyle: CSSProperties = {
  borderRadius: '8px',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  borderBottomLeftRadius: '8px',
  borderBottomRightRadius: '8px',
  fontWeight: 600,
};

/** Display labels for optional intent chips (stored verbatim in session intent). */
const OPTIONAL_TAGS = [
  'Processing something hard',
  'Wanting to be heard',
  'Cross\u2011cultural dialogue',
  'Military / veteran experience',
] as const;

export function IntentPage() {
  const navigate = useNavigate();
  const { supabase, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const len = text.length;

  function toggleTag(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function handleFindSquad() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      writeSessionIntent({
        text: text.trim(),
        tags: [...selected],
      });
      await ensureAnonymousSession();
      const squadId = await createDemoSquad(supabase);
      navigate(`/session/${squadId}`, { replace: true });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' &&
              e !== null &&
              'message' in e &&
              typeof (e as { message: unknown }).message === 'string'
            ? (e as { message: string }).message
            : 'Could not start matching. You can try again in a moment.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    clearSessionIntent();
    navigate('/session', { replace: true });
  }

  if (!configured) {
    return (
      <section className="mx-auto w-full max-w-copy px-md py-12" aria-labelledby="intent-unconfigured">
        <h1 id="intent-unconfigured" className="font-heading text-fluid-h2 text-gray-light">
          Matching unavailable
        </h1>
        <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          Configure Supabase to use the squad room. See the home page for setup steps.
        </p>
        <Link to="/" className="mt-6 inline-flex text-teal underline-offset-4 hover:underline">
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section
      className="intent-page-root mx-auto flex w-full max-w-[640px] flex-col px-md pb-16 pt-[100px] md:pt-[120px]"
      aria-labelledby="intent-heading"
    >
      <header className="flex flex-col gap-4">
        <h1 id="intent-heading" className="font-heading" style={headingStyle}>
          Set your intention
        </h1>
        <p className="max-w-[520px] font-sans text-[0.95rem] font-normal leading-[1.65] text-[#8892a4]">
          This stays private. It helps us route you to the right room.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        <div>
          <label
            htmlFor="intent-text"
            className="mb-2 block font-sans text-[0.95rem] font-medium leading-snug text-[#c4cdd9]"
          >
            I&apos;m here because…
          </label>
          <textarea
            id="intent-text"
            name="intent"
            rows={5}
            maxLength={MAX_CHARS}
            placeholder=""
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="intent-char-count"
            className="w-full resize-y rounded-[10px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] leading-relaxed text-[#e2e8f0] placeholder:text-[#6b7280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          />
          <p
            id="intent-char-count"
            className="mt-2 text-right font-sans text-[0.8rem] tabular-nums text-[#6b7280]"
            aria-live="polite"
          >
            {len}/{MAX_CHARS}
          </p>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-3 font-sans text-[0.85rem] font-medium text-[#a8b2c1]">
            Optional — tap what fits (you can leave this blank)
          </legend>
          <div className="flex flex-wrap gap-2">
            {OPTIONAL_TAGS.map((tag) => {
              const on = selected.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-[8px] border px-3 py-2 font-sans text-[0.85rem] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                    on
                      ? 'border-teal bg-teal/[0.12] text-[#e2e8f0]'
                      : 'border-[#2d3f55] bg-transparent text-[#a8b2c1] hover:border-[#3d4f63] hover:text-[#c4cdd9]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={busy || !supabase}
            onClick={() => void handleFindSquad()}
            className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center bg-teal px-8 py-[0.65rem] font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity duration-150 ease-out hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={primaryCtaStyle}
          >
            {busy ? 'Finding…' : 'Find my squad'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="self-center font-sans text-[0.9rem] font-medium text-[#6b7280] underline-offset-4 transition-colors hover:text-[#a8b2c1] hover:underline"
        >
          Skip for now
        </button>

        {error ? (
          <p className="font-sans text-[0.875rem] text-amber" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
