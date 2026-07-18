import { Link } from 'react-router-dom';
import { EVALUATOR_JOURNEY, type EvaluatorStepId } from '../../data/siteMessaging';

/**
 * Cross-page recommended path for mediators: understand → trust → fit → apply.
 */
export function EvaluatorPath({ current }: { current?: EvaluatorStepId }) {
  return (
    <nav
      aria-label="Recommended path for mediators"
      className="border border-line bg-surface-elevated p-5 md:p-6"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
        Recommended reading order
      </p>
      <ol className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {EVALUATOR_JOURNEY.map((step, index) => {
          const isCurrent = step.id === current;
          const content = (
            <>
              <span className="font-mono text-[0.6rem] text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="mt-1 text-sm font-medium">{step.label}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{step.description}</p>
            </>
          );
          return (
            <li key={step.id}>
              {isCurrent ? (
                <div
                  aria-current="page"
                  className="block border border-line-strong bg-surface-sunken px-4 py-3 text-ink"
                >
                  {content}
                </div>
              ) : (
                <Link
                  to={step.href}
                  className="block border border-line bg-surface px-4 py-3 text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
