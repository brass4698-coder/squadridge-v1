import { useEffect, useRef } from 'react';

/**
 * Explicit consent gate before {@link finalizeDemoSessionClaim} merges anonymous demo
 * squad memberships into a verified account. The user must read what is migrated and
 * what is not, and tick the consent box before the primary action enables. Modal
 * traps focus and closes on Escape; closing it counts as cancel.
 */
export function DemoClaimConsentModal({
  open,
  busy,
  consented,
  onConsentChange,
  expiresAt,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  busy: boolean;
  consented: boolean;
  onConsentChange: (next: boolean) => void;
  /** ISO timestamp from issue_demo_claim_consent. Renders a relative countdown hint. */
  expiresAt: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const expiresText = formatExpiresAt(expiresAt);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-claim-consent-title"
      aria-describedby="demo-claim-consent-body"
      className="sr-glass-scrim fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[520px] rounded-[12px] border border-[#1e2a3a] bg-[#0c1118] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <h2
          id="demo-claim-consent-title"
          className="font-heading text-[1.15rem] font-semibold text-[#e2e8f0]"
        >
          Confirm transfer to your verified account
        </h2>
        <div
          id="demo-claim-consent-body"
          className="mt-4 space-y-3 font-sans text-[0.9rem] leading-relaxed text-[#c4cdd9]"
        >
          <p>
            We&apos;ll migrate the squads you joined as an anonymous demo user to your verified
            account. After this, you&apos;ll see those squads when signed in here.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-[#a8b2c1]">
            <li>
              <strong className="text-[#e2e8f0]">Migrated:</strong> your squad membership rows.
            </li>
            <li>
              <strong className="text-[#e2e8f0]">Not migrated:</strong> existing message history
              keeps the original anonymous sender id; new messages will use your verified account.
            </li>
            <li>
              Squads where you&apos;re already a member under your verified account are skipped — no
              duplicate memberships.
            </li>
          </ul>
          <p className="text-[#94a3b8]">
            Moderation policy still applies to all squads (see{' '}
            <a href="/security" className="text-teal-light underline-offset-4 hover:underline">
              Security &amp; privacy
            </a>
            ).
          </p>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-lg border border-[#1a2236] bg-[#0f1623] px-3 py-2.5">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1 h-4 w-4 cursor-pointer accent-teal"
          />
          <span className="font-sans text-[0.85rem] leading-relaxed text-[#c4cdd9]">
            I understand and want to migrate my anonymous demo squad memberships to this verified
            account.
          </span>
        </label>

        {expiresText ? (
          <p className="mt-3 font-sans text-[0.78rem] text-[#5c6570]" aria-live="polite">
            {expiresText}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-5 font-sans text-[0.88rem] text-[#c4cdd9] transition hover:border-teal/40 hover:text-[#e2e8f0] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || !consented}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border-0 bg-teal px-5 font-heading text-[0.88rem] font-semibold text-[#0b0f1a] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Applying…' : 'Confirm and migrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatExpiresAt(iso: string | null): string | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return null;
  const ms = ts - Date.now();
  if (ms <= 0) return 'Consent expired — close this dialog and request consent again.';
  const seconds = Math.round(ms / 1000);
  if (seconds < 90) {
    return `Consent expires in about ${seconds}s. Confirm or cancel before then.`;
  }
  const minutes = Math.round(seconds / 60);
  return `Consent expires in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
