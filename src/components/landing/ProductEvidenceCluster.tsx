/**
 * Product evidence — facilitator chrome with operational risk framing.
 */
import { InterfaceEvidence } from '../institutional/InterfaceEvidence';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

export function ProductEvidenceCluster() {
  return (
    <section
      className="border-b border-[color:var(--color-border-subtle)] bg-surface-sunken/30 py-16 md:py-20"
      aria-labelledby="evidence-h"
    >
      <div className={`${publicShellInnerClass} md:py-2`}>
        <div className="max-w-[34rem]">
          <SectionLabel className="!mb-2">Product evidence</SectionLabel>
          <h2
            id="evidence-h"
            className="mt-0 font-display text-[1.625rem] font-medium leading-tight tracking-tight text-ink md:text-[1.875rem]"
          >
            Facilitator chrome — not a chat product.
          </h2>
          <p className="mt-4 mb-0 max-w-[34rem] text-sm leading-relaxed text-ink-secondary">
            One governed sequence with three visual modes — enclosed room, accent-tinted gate, open
            ledger — so control is visible without decoration.
          </p>
        </div>
        <div className="mt-12 md:mt-14">
          <InterfaceEvidence />
        </div>
      </div>
    </section>
  );
}
