import { useState } from 'react';

type ConfidenceLevel = 'high' | 'medium' | 'low';

type DebriefState = {
  keyLearning: string;
  nextSteps: string;
  unresolvedItems: string;
  confidence: ConfidenceLevel;
  facilitatorNotes: string;
};

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string; colour: string }[] = [
  { value: 'high', label: 'High', colour: 'border-teal/50 bg-teal/15 text-teal-light' },
  { value: 'medium', label: 'Medium', colour: 'border-amber/45 bg-amber/10 text-amber-200' },
  { value: 'low', label: 'Low', colour: 'border-slate-500/50 bg-slate-800/40 text-slate-400' },
];

const EMPTY: DebriefState = {
  keyLearning: '',
  nextSteps: '',
  unresolvedItems: '',
  confidence: 'medium',
  facilitatorNotes: '',
};

/**
 * Post-session structured debrief capture.
 *
 * The output feeds into `outcome_extras` on the ledger proposal (follow-up,
 * confidence_note, alignment fields). The facilitator fills this after the
 * session closes; it is not sent to Supabase from this component — calling
 * code receives the structured data via `onCapture` and can merge it into a
 * draft or transmit it separately.
 *
 * @param onCapture  Called with the filled-in debrief when the facilitator
 *                   submits. The parent component is responsible for storing.
 * @param onDismiss  Called when the facilitator skips the debrief.
 * @param busy       Disables the submit button (e.g., while mutation is in flight).
 */
export function SessionDebriefPanel({
  topic,
  onCapture,
  onDismiss,
  busy = false,
}: {
  topic: string;
  onCapture: (data: DebriefOutput) => void;
  onDismiss: () => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<DebriefState>(EMPTY);

  function set<K extends keyof DebriefState>(key: K, value: DebriefState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit = form.keyLearning.trim().length >= 10 && form.confidence != null && !busy;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const nextStepsArr = form.nextSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const unresolvedArr = form.unresolvedItems
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onCapture({
      confidence_note: `${CONFIDENCE_OPTIONS.find((o) => o.value === form.confidence)?.label ?? form.confidence} — ${form.keyLearning.trim()}`,
      follow_up: nextStepsArr,
      unresolved: unresolvedArr,
      alignment: form.facilitatorNotes.trim() || undefined,
    });
  }

  const inputCls =
    'block w-full rounded-md border border-[#1f2940] bg-[#070b13] px-3 py-2 font-sans text-[0.875rem] text-[#e2e8f0] placeholder:text-[#475569] focus:border-teal/60 focus:outline-none resize-y';

  return (
    <section
      className="rounded-[10px] border border-teal/20 bg-[#07101a]/90 px-5 py-5"
      aria-labelledby="debrief-heading"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="debrief-heading"
            className="font-heading text-[0.95rem] font-semibold text-[#e2e8f0]"
          >
            Session debrief
          </h2>
          <p className="mt-0.5 font-sans text-[0.78rem] text-[#94a3b8]">
            <em className="not-italic text-slate-500">Topic: </em>
            {topic}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="font-sans text-[0.75rem] text-slate-600 underline-offset-2 hover:text-slate-400 hover:underline"
        >
          Skip debrief
        </button>
      </header>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {/* Key learning */}
        <label className="block">
          <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
            Key learning <span className="text-slate-600">(required, ≥10 chars)</span>
          </span>
          <textarea
            rows={3}
            maxLength={500}
            value={form.keyLearning}
            onChange={(e) => set('keyLearning', e.target.value)}
            placeholder="What emerged from this session that wasn't obvious going in?"
            className={`mt-1 ${inputCls}`}
          />
        </label>

        {/* Confidence */}
        <fieldset>
          <legend className="font-sans text-[0.78rem] font-medium text-[#94a3b8]">
            Confidence in outcome
          </legend>
          <div className="mt-1.5 flex gap-2">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('confidence', opt.value)}
                className={`rounded-md border px-3 py-1.5 font-sans text-[0.8rem] font-medium transition-colors ${
                  form.confidence === opt.value
                    ? opt.colour
                    : 'border-[#1f2940] bg-[#0c1219] text-[#a8b2c1] hover:border-teal/30 hover:text-[#e2e8f0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Next steps */}
        <label className="block">
          <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
            Follow-up actions <span className="text-slate-600">(one per line, optional)</span>
          </span>
          <textarea
            rows={3}
            maxLength={800}
            value={form.nextSteps}
            onChange={(e) => set('nextSteps', e.target.value)}
            placeholder="• Schedule a follow-up session&#10;• Distribute agreed text to relevant parties"
            className={`mt-1 ${inputCls}`}
          />
        </label>

        {/* Unresolved */}
        <label className="block">
          <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
            Unresolved items <span className="text-slate-600">(one per line, optional)</span>
          </span>
          <textarea
            rows={2}
            maxLength={500}
            value={form.unresolvedItems}
            onChange={(e) => set('unresolvedItems', e.target.value)}
            placeholder="Issues that remain open or need escalation"
            className={`mt-1 ${inputCls}`}
          />
        </label>

        {/* Facilitator notes */}
        <label className="block">
          <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
            Facilitator alignment note{' '}
            <span className="text-slate-600">(optional, not published)</span>
          </span>
          <textarea
            rows={2}
            maxLength={400}
            value={form.facilitatorNotes}
            onChange={(e) => set('facilitatorNotes', e.target.value)}
            placeholder="e.g. Strong on corridor timing; medium on authority scope"
            className={`mt-1 ${inputCls}`}
          />
        </label>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-teal/35 bg-teal/15 px-4 font-heading text-[0.85rem] font-semibold text-teal-light transition-colors hover:border-teal/55 hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save debrief'}
          </button>
          <p className="font-sans text-[0.75rem] text-slate-600">
            Results are attached to the session ledger draft.
          </p>
        </div>
      </form>
    </section>
  );
}

/** Structured output of the debrief form — maps onto `outcome_extras` fields. */
export type DebriefOutput = {
  confidence_note: string;
  follow_up: string[];
  unresolved: string[];
  alignment?: string;
};
