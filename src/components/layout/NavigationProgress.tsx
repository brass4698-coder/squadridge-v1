import { useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { publicShellInnerClass } from './publicShellTokens';

const FLOW_STEPS = [
  { id: 'intent', label: 'Find squad', number: 1 },
  { id: 'match', label: 'Matching', number: 2 },
  { id: 'session', label: 'Room', number: 3 },
  { id: 'ledger', label: 'Outcomes', number: 4 },
] as const;

function getFlowStepIndex(pathname: string): number {
  if (pathname.startsWith('/find-squad') || pathname.startsWith('/intent')) return 0;
  if (pathname.startsWith('/match')) return 1;
  if (pathname.startsWith('/session')) return 2;
  if (pathname.startsWith('/ledger')) return 3;
  return -1;
}

/** Linear progress for the match → session → ledger journey (not shown on marketing-only routes). */
export function NavigationProgress() {
  const { pathname } = useLocation();
  /** Published ledger routes are public records, not part of the match → session product flow. */
  if (pathname.startsWith('/ledger')) return null;
  const currentIndex = getFlowStepIndex(pathname);
  if (currentIndex < 0) return null;

  return (
    <div className="border-b border-[#141e30] bg-[rgba(8,11,18,0.5)] py-2.5 sm:py-3">
      <nav
        className={twMerge(
          publicShellInnerClass,
          'flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:justify-start sm:gap-x-4',
        )}
        aria-label="Match flow progress"
      >
        {FLOW_STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            {i > 0 ? (
              <div
                className="hidden h-px w-4 shrink-0 bg-slate-700/40 sm:block sm:w-6"
                aria-hidden
              />
            ) : null}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-medium sm:h-8 sm:w-8 sm:text-[0.75rem] ${
                i <= currentIndex ? 'bg-teal/30 text-teal' : 'bg-slate-700/30 text-slate-500'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-[0.7rem] font-medium sm:text-[0.8rem] ${
                i <= currentIndex ? 'text-slate-200' : 'text-slate-600'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
