import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '../SectionLabel';
import { TrustStrip } from './TrustStrip';
import { AudiencePathStrip } from './AudiencePathStrip';
import { RoomGateRecordDiagram } from './RoomGateRecordDiagram';
import { publicShellInnerClass } from '../layout/publicShellTokens';

const TRUST_RAIL = [
  'Private session room',
  'Facilitator-governed release',
  'Approved outcomes only',
  'Verifiable public record',
] as const;

/**
 * Landing hero — category claim, diligence CTAs, audience routing.
 */
export function LandingHero() {
  return (
    <section className="sr-section-enter border-b border-[color:var(--color-border-subtle)] pt-24 pb-20 md:pt-32 md:pb-28">
      <div className={publicShellInnerClass}>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
          <div className="sr-align-content min-w-0 max-w-[36rem]">
            <SectionLabel className="!mb-3">Private written mediation infrastructure</SectionLabel>
            <p className="mb-5 m-0 max-w-[34rem] text-left text-xs leading-relaxed text-ink-faint md:text-sm">
              SquadRidge: Zero-Knowledge Harmony Rooms for High-Stakes Organizational Truce.
            </p>
            <h1
              className="mt-0 max-w-[18ch] text-left font-display text-display font-medium leading-[1.05] tracking-tight text-ink"
              data-demo="landing-hero"
            >
              High-stakes organizational truce, without public exposure.
            </h1>
            <p className="mt-7 max-w-[32rem] text-left text-[length:var(--sr-text-lead)] leading-[1.65] text-ink-secondary">
              Run sensitive mediations and inquiries in a private written room and release only an
              approved outcome to a public, verifiable record.
            </p>
            <p className="mt-4 max-w-[30rem] text-base leading-relaxed text-ink-faint">
              For mediation practices, ombuds offices, institutional conveners, and city community
              safety teams.
            </p>
            <p className="mt-6 text-base font-medium leading-relaxed text-ink-secondary">
              No transcript. No open feed. No auto-publish.
            </p>
            <div className="mt-12 flex flex-wrap justify-start gap-3">
              <a href="/request-access" className="btn-institutional btn-institutional--primary">
                Request pilot access
                <ArrowRight className="size-3.5" aria-hidden />
              </a>
              <a href="#stage-gate" className="btn-institutional btn-institutional--ghost">
                Inspect the release model
              </a>
            </div>
            <AudiencePathStrip />
            <div className="mt-10">
              <TrustStrip items={TRUST_RAIL} />
            </div>
          </div>

          <div className="min-w-0 lg:pt-2">
            <RoomGateRecordDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
