import { Link } from 'react-router-dom';
import { homepageSampleRecord } from '../../data/sampleRecords';
import { RecordCard } from '../shared/RecordCard';
import { TrustLabel } from '../shared/TrustLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Specimen-led section — released instrument with a plain-language anchor note.
 */
export function RecordSpecimen() {
  return (
    <section
      data-demo="landing-ledger"
      className="border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/45 py-16 md:py-20"
      data-scroll-section
      aria-labelledby="record-specimen-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-start lg:gap-16">
          <div className="max-w-[22rem]">
            <TrustLabel variant="ledger" className="mb-5" />
            <h2
              id="record-specimen-h"
              className="mt-0 font-display text-[1.625rem] font-medium leading-tight tracking-tight text-ink md:text-[1.875rem]"
            >
              The public integrity record.
            </h2>
            <p className="mt-5 mb-0 text-sm leading-relaxed text-ink-secondary">
              Approved text, limited metadata, verification anchor. Proves an outcome was released
              at a time — not what was said in the room.
            </p>
            <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary">
              Anyone can recompute this anchor from the published outcome to confirm it has not been
              altered.
            </p>
            <p className="mt-4 mb-0 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary">
              How to verify: download the published outcome text → compute SHA-256 → compare to the
              listed anchor.
            </p>
            <Link
              to="/ledger"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand no-underline transition-colors hover:text-ink"
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
