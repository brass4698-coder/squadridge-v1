/**
 * Product evidence — facilitator chrome; UI does the persuasion.
 */
import { InterfaceEvidence } from '../institutional/InterfaceEvidence';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

export function ProductEvidenceCluster() {
  return (
    <section
      className="border-b border-line bg-surface-sunken/40 py-16 md:py-20"
      data-scroll-section
      aria-labelledby="evidence-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[34rem]">
          <SectionLabel className="!mb-2">Product evidence</SectionLabel>
          <h2
            id="evidence-h"
            className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
          >
            Facilitator chrome — not a chat product.
          </h2>
          <p className="mt-3 mb-0 max-w-[30rem] text-sm leading-relaxed text-ink-secondary">
            Governed visual modes keep control visible.
          </p>
        </div>
        <div className="mt-10 md:mt-12">
          <InterfaceEvidence />
        </div>
      </div>
    </section>
  );
}
