import { InstitutionalVisualFrame } from './InstitutionalVisualFrame';

type Step = { step: string; title: string; body: string };

export function ProcessDiagram({ steps }: { steps: readonly Step[] }) {
  return (
    <InstitutionalVisualFrame
      ariaLabel="Facilitator workflow schematic from configuration through release"
      aspect="auto"
      className="!aspect-auto"
    >
      <div className="w-full max-w-5xl py-2">
        <svg
          viewBox={`0 0 ${steps.length * 160} 32`}
          className="mb-6 hidden w-full text-line-strong md:block"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <line
            x1="40"
            y1="16"
            x2={steps.length * 160 - 40}
            y2="16"
            stroke="currentColor"
            strokeWidth="1"
          />
          {steps.map((_, index) => {
            const x = 80 + index * 160;
            return (
              <g key={index}>
                <circle cx={x} cy="16" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
                {index < steps.length - 1 ? (
                  <polygon
                    points={`${x + 52},12 ${x + 60},16 ${x + 52},20`}
                    fill="currentColor"
                    opacity="0.7"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        <ol className="grid gap-6 md:grid-cols-4 md:gap-4">
          {steps.map((item) => (
            <li key={item.step} className="relative flex flex-col border-t border-line-strong pt-5">
              <span className="font-mono text-xs text-ink-faint">{item.step}</span>
              <h3 className="mt-2 text-sm font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </InstitutionalVisualFrame>
  );
}
