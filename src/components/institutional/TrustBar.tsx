import { TRUST_INDICATORS } from '../../data/institutionalHome';

export function TrustBar() {
  return (
    <div
      className="border-y border-line bg-surface-sunken"
      role="region"
      aria-label="Platform credibility indicators"
    >
      <div className="mx-auto max-w-6xl px-6 py-5 md:px-8 lg:px-12">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST_INDICATORS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink-faint"
            >
              <span aria-hidden className="inline-block h-px w-3 bg-line-strong" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
