/** Dispatched after a successful waitlist signup so other UI can refresh (e.g. aggregate counts elsewhere). */
export const WAITLIST_CHANGED_EVENT = 'mendguild:waitlist-changed';

/**
 * Hero proof beneath primary CTAs: pilot positioning + live capability checklist (no waitlist counts).
 */
const CAPABILITIES = ['Verification', 'Matching', 'Session entry', 'Ledger output'] as const;

export function HeroWaitlistCounter() {
  return (
    <div>
      <p className="mt-2 max-w-copy font-sans text-sm font-normal leading-relaxed text-landing-muted">
        For pilot cohorts where trust, access control, and outcome quality matter more than scale.
      </p>
      <ul
        className="mt-4 flex list-none flex-wrap gap-2 p-0"
        aria-label="Live product capabilities"
      >
        {CAPABILITIES.map((item) => (
          <li
            key={item}
            className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-sans text-[0.78rem] font-medium text-landing-body"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
