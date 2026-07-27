import { Link } from 'react-router-dom';
import { homepageSpecimen } from '../../data/ledgerSpecimens';
import { RecordCard, specimenToRecordCardProps } from '../shared/RecordCard';
import { SpecimenNotice } from '../shared/SpecimenNotice';
import { TrustLabel } from '../shared/TrustLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/** Homepage specimen — format of an approved record, not a live release. */
export function RecordSpecimen() {
  const card = specimenToRecordCardProps(homepageSpecimen, `/ledger/${homepageSpecimen.id}`);

  return (
    <section
      id="record-specimen"
      data-demo="landing-ledger"
      className="sr-section-enter scroll-mt-24 py-16 md:py-20 lg:py-24"
      data-scroll-section
      aria-labelledby="record-specimen-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-start lg:gap-14">
          <div className="max-w-[22rem]">
            <TrustLabel variant="ledger" className="mb-5" />
            <h2
              id="record-specimen-h"
              className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
            >
              What an approved record looks like
            </h2>
            <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary">
              Approved text, limited metadata, verification anchor — not what was said in the room.
            </p>
            <p className="mt-4 mb-0 rounded-[var(--sr-radius-md)] bg-surface-elevated px-4 py-3 font-mono text-xs leading-relaxed text-ink-secondary shadow-sr-card">
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
            <RecordCard {...card} />
            <SpecimenNotice className="mt-4" heading="Example data — not a live release">
              This specimen shows format only. Its anchor does not resolve against a released
              instrument. Live entries appear on the ledger only after facilitator release and an
              organisation opt-in to public publication.
            </SpecimenNotice>
          </div>
        </div>
      </div>
    </section>
  );
}
