import { useState } from 'react';
import { toast } from 'sonner';
import { describeCrisisAlertResult, postCrisisAlert, type CrisisAlertReason } from '../../lib';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPreferences } from '../../hooks';

/**
 * Out-of-band "alert facilitator" control (Phase 2.4 of the audit remediation
 * plan). Lives in `SessionStrategyRoomChrome` so participants can summon a
 * trained facilitator without sending a message that would go through chat
 * redaction / queueing. The reason code enum is fixed; no free-form text
 * crosses the wire (see `supabase/functions/crisis-alert/index.ts`).
 */
const REASONS: ReadonlyArray<{ id: CrisisAlertReason; label: string; hint: string }> = [
  {
    id: 'immediate_danger',
    label: 'Immediate danger',
    hint: 'Use only if someone is in physical danger right now. The facilitator is paged immediately.',
  },
  {
    id: 'request_pause',
    label: 'Request a pause',
    hint: 'Things are getting heated; ask the facilitator to pause the room.',
  },
  {
    id: 'request_facilitator',
    label: 'Ask for a facilitator',
    hint: 'You want a trained facilitator to join, but it is not an emergency.',
  },
];

export function AlertFacilitatorButton({ squadId }: { squadId: string }) {
  const { supabase } = useAuth();
  const { preferredLanguage } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickedReason, setPickedReason] = useState<CrisisAlertReason | null>(null);

  function close() {
    setOpen(false);
    setPickedReason(null);
  }

  async function handleConfirm() {
    if (!supabase || !pickedReason) return;
    setBusy(true);
    try {
      const result = await postCrisisAlert(supabase, squadId, pickedReason);
      const message = describeCrisisAlertResult(result, preferredLanguage);
      if (result.ok) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[40px] items-center rounded-md border border-amber/35 bg-amber/10 px-3 font-sans text-[0.8rem] font-medium text-amber hover:border-amber/60 hover:bg-amber/15"
        aria-haspopup="dialog"
      >
        Alert facilitator
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-facilitator-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-[480px] rounded-[12px] border border-amber/40 bg-surface-elevated p-5 shadow-sr-lg">
            <h2
              id="alert-facilitator-title"
              className="font-heading text-[1.05rem] font-semibold text-amber"
            >
              Alert a facilitator
            </h2>
            <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
              Pick the closest reason. Your alert is sent out-of-band — it does not go through chat.
              Free-form details are intentionally not sent to keep the audit log private.
            </p>

            <fieldset className="mt-4 space-y-3">
              <legend className="sr-only">Reason for alerting facilitator</legend>
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                    pickedReason === r.id
                      ? 'border-amber/60 bg-amber/10'
                      : 'border-line bg-surface-elevated hover:border-amber/35'
                  }`}
                >
                  <input
                    type="radio"
                    name="crisis-alert-reason"
                    value={r.id}
                    checked={pickedReason === r.id}
                    onChange={() => setPickedReason(r.id)}
                    className="mt-1 h-4 w-4 cursor-pointer accent-amber"
                  />
                  <span className="font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
                    <span className="block font-medium text-ink">{r.label}</span>
                    <span className="block text-[0.78rem] text-ink-secondary">{r.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <p className="mt-3 font-sans text-[0.78rem] text-ink-secondary">
              For immediate physical danger, also contact your local emergency number — SquadRidge
              cannot reach emergency services for you.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-line-strong bg-transparent px-5 font-sans text-[0.85rem] text-ink-secondary hover:border-amber/40 hover:text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={busy || !pickedReason}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border-0 bg-amber px-5 font-heading text-[0.85rem] font-semibold text-surface hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Send alert'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
