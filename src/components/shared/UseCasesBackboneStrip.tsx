import { CapsLabel } from './CapsLabel';
import { FigureFrame } from './FigureFrame';

const STAGES = [
  {
    step: '01',
    label: 'Private room',
    line: 'Deliberation stays inside',
    src: '/assets/usecases-private-room.png',
  },
  {
    step: '02',
    label: 'Facilitator gate',
    line: 'Release is governed',
    src: '/assets/usecases-facilitator-gate.png',
    accent: true,
  },
  {
    step: '03',
    label: 'Approved record',
    line: 'Only the approved record leaves',
    src: '/assets/usecases-approved-record.png',
  },
] as const;

/**
 * Canonical room → gate → record strip for marketing.
 * Light product-native illustrations; teal only on the gate connector.
 */
export function UseCasesBackboneStrip({
  caption = 'Room stays private · Gate governs release · Approved record only',
}: {
  caption?: string;
}) {
  return (
    <FigureFrame
      className="sr-backbone"
      caption={caption}
      aria-label="Private room, then facilitator gate, then approved record"
    >
      <ol className="sr-backbone-track m-0 grid list-none gap-0 p-0 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STAGES.map((stage, i) => (
          <li key={stage.step} className="contents">
            {i > 0 ? <Connector accent={i === 1} /> : null}
            <div className="flex flex-col items-center px-5 py-7 text-center md:px-4 md:py-9">
              <div
                className={
                  'relative flex size-24 items-center justify-center rounded-full border bg-[var(--sr-bg)] md:size-28 ' +
                  (stage.accent ? 'border-[color:var(--color-border-strong)]' : 'border-line')
                }
              >
                <img
                  src={stage.src}
                  alt=""
                  aria-hidden
                  width={128}
                  height={128}
                  className="block h-auto w-[74%] select-none"
                  decoding="async"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <CapsLabel className="tracking-[var(--tracking-caps)]">{stage.step}</CapsLabel>
                <span className="font-display text-base font-medium leading-none text-ink md:text-lg">
                  {stage.label}
                </span>
              </div>
              <p className="mt-1.5 mb-0 text-sm leading-snug text-ink-secondary">{stage.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </FigureFrame>
  );
}

/** Hairline connector between stages: horizontal on desktop, vertical on mobile. */
function Connector({ accent }: { accent?: boolean }) {
  const stroke = accent ? 'text-brand' : 'text-[color:var(--color-border-strong)]';
  return (
    <div aria-hidden className="flex items-center justify-center py-2 md:py-0">
      <svg
        className={`hidden h-3 w-16 md:block ${stroke}`}
        viewBox="0 0 64 12"
        fill="none"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="6" x2="52" y2="6" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M52 2 L60 6 L52 10"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className={`block h-10 w-3 md:hidden ${stroke}`}
        viewBox="0 0 12 40"
        fill="none"
        preserveAspectRatio="none"
      >
        <line x1="6" y1="0" x2="6" y2="30" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M2 30 L6 38 L10 30"
          stroke="currentColor"
          strokeWidth="1.25"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
