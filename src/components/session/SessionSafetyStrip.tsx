import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Persistent room safety affordances + short operator-visibility reminder.
 */
export function SessionSafetyStrip({ squadId }: { squadId: string }) {
  const [showVisibility, setShowVisibility] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border border-navy-light bg-surface-elevated p-3">
      <p className="font-sans text-[0.78rem] leading-snug text-slate-400">
        <span className="text-slate-200">Safety:</span> this space uses pseudonyms in-room; squad
        keys exist for support and safety — not Signal-grade encryption. Use reports for facilitator
        follow-up when available.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={`/app/settings/safety?ref=session`}
          className="inline-flex min-h-[38px] items-center rounded-md border border-teal/40 bg-teal/10 px-3 font-sans text-[0.78rem] font-medium text-teal hover:bg-teal/20"
        >
          Report / resources
        </Link>
        <Link
          to="/session"
          className="inline-flex min-h-[38px] items-center rounded-md border border-slate-600 px-3 font-sans text-[0.78rem] text-slate-300 hover:border-amber/40"
        >
          Leave session hub
        </Link>
        <button
          type="button"
          className="font-sans text-[0.75rem] font-medium text-slate-500 underline underline-offset-2 hover:text-slate-300"
          onClick={() => setShowVisibility((x) => !x)}
          aria-expanded={showVisibility}
        >
          Who can see what
        </button>
      </div>
      {showVisibility ? (
        <div className="rounded border border-line bg-surface-secondary p-3 font-sans text-[0.74rem] text-slate-400">
          <p>
            <span className="font-medium text-slate-300">Participants</span> see pseudonyms and
            in-room text (after encryption/decrypt in-app).
          </p>
          <p className="mt-1">
            <span className="font-medium text-slate-300">Facilitators / moderators</span> may see
            more per policy; this UI does not grant moderator tools.
          </p>
          <p className="mt-1 font-mono text-[0.65rem] text-slate-500">room id: {squadId}</p>
        </div>
      ) : null}
    </div>
  );
}
