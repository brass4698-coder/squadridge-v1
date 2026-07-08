import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const STORAGE_KEY = 'sr_facilitator_walkthrough_dismissed';

const STEPS = [
  'You control the room. You control the release.',
  'The platform handles verification flow, participant status, and ledger publish.',
  'Session dialogue stays in the room — only your approved outcome becomes public.',
];

export function FacilitatorWalkthrough() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <aside
      className="mb-8 rounded-lg border border-brand/30 bg-brand-soft p-6"
      aria-labelledby="facilitator-walkthrough-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            id="facilitator-walkthrough-heading"
            className="text-xs font-semibold uppercase tracking-widest text-brand"
          >
            How facilitation works here
          </p>
          <ol className="mt-4 flex flex-col gap-2">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="mt-0.5 font-mono text-xs text-brand">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-ink-faint">
            <Link to="/how-it-works" className="text-brand hover:underline">
              Full lifecycle guide
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-1 text-ink-faint transition-opacity hover:opacity-70"
          aria-label="Dismiss walkthrough"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
