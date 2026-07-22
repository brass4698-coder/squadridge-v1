import { TRUST_INDICATORS } from '../../data/institutionalHome';
import { publicShellInnerClass } from '../layout/publicShellTokens';

export function TrustBar() {
  return (
    <div
      className="border-y border-line bg-surface-sunken/80"
      role="region"
      aria-label="Platform credibility indicators"
    >
      <div className={`${publicShellInnerClass} py-4 md:py-5`}>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 md:justify-start">
          {TRUST_INDICATORS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint"
            >
              <span aria-hidden className="inline-block h-px w-4 bg-line-strong" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
