import { Link } from 'react-router-dom';
import { homepageSampleRecord } from '../../data/sampleRecords';
import { RecordCard } from '../shared/RecordCard';
import { TrustLabel } from '../shared/TrustLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Specimen-led section — released instrument; card carries the persuasion.
 */
export function RecordSpecimen() {
  return (
    <section
      id="record-specimen"
      data-demo="landing-ledger"
      className="scroll-mt-24 border-b border-line bg-surface-sunken/40 py-16 md:py-20"
      data-scroll-section
      aria-labelledby="record-specimen-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-start lg:gap-14">
          <div className="max-w-[22rem]">
            <TrustLabel variant="ledger" className="mb-5" />
            <h2
              id="record-specimen-h"
              className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
            >
              The approved record.
            </h2>
            <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary">
              Approved text, limited metadata, verification anchor — not what was said in the room.
            </p>
            <p className="mt-4 mb-0 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
              Verify: download published text → SHA-256 → compare to listed anchor.
            </p>
            <Link
              to="/ledger"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Browse the ledger →
            </Link>
          </div>
          <div className="min-w-0">
            <RecordCard {...homepageSampleRecord} />
          </div>
        </div>
      </div>
    </section>
  );
}
