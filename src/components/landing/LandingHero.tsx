import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '../SectionLabel';
import { TrustStrip } from './TrustStrip';
import { RoomGateRecordDiagram } from './RoomGateRecordDiagram';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Landing hero — audience, outcome, one primary CTA.
 */
export function LandingHero() {
  return (
    <section className="border-b border-[color:var(--color-border-subtle)] pt-24 pb-20 md:pt-32 md:pb-28">
      <div className={publicShellInnerClass}>
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-24">
          <div className="sr-align-content min-w-0 max-w-[34rem]">
            <SectionLabel className="!mb-4">
              Mediators · Facilitators · Institutional conveners
            </SectionLabel>
            <h1 className="mt-0 max-w-[15ch] text-left font-display text-display font-medium leading-[1.05] tracking-tight text-ink">
              Verified deliberation for sensitive decisions.
            </h1>
            <p className="mt-7 max-w-[32rem] text-left text-[1.0625rem] leading-[1.65] text-ink-secondary">
              Run sensitive mediations and inquiries in a private written room and release only an
              approved outcome to a public, verifiable record.
            </p>
            <p className="mt-4 max-w-[28rem] text-sm leading-relaxed text-ink-faint">
              For mediation practices, ombuds offices, and city community safety teams.
            </p>
            <p className="mt-6 text-sm font-medium leading-relaxed text-ink-secondary">
              No transcript. No open feed. No auto-publish.
            </p>
            <div className="mt-12 flex flex-wrap justify-start gap-3">
              <a href="#pilot" className="btn-institutional btn-institutional--primary">
                Request pilot access
                <ArrowRight className="size-3.5" aria-hidden />
              </a>
              <Link to="/how-it-works" className="btn-institutional btn-institutional--ghost">
                See the process
              </Link>
            </div>
            <div className="mt-10">
              <TrustStrip />
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
