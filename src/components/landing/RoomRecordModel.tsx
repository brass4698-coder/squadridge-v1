import { useReducedMotion, motion } from 'motion/react';
import { Reveal } from './Reveal';

const STAGES = [
  {
    id: 'room',
    label: 'Private room',
    enters: 'Verified participants, facilitator guidance, written contributions',
    stays: 'Raw dialogue, contact details, verification artifacts not meant for release',
  },
  {
    id: 'gate',
    label: 'Release gate',
    enters: 'Draft outcome text, designated approvers, recorded approvals',
    stays: 'Anything not approved—there is no automated publish path',
  },
  {
    id: 'record',
    label: 'Public record',
    enters: 'Approved outcome text, limited metadata, verification anchor',
    stays: 'Never implied: full transcripts, anonymity guarantees, operator-blind E2EE today',
  },
];

/** Diagrammatic room → gate → record with restrained motion. */
export function RoomRecordModel() {
  const reduce = useReducedMotion();

  return (
    <section
      id="room-and-record"
      aria-labelledby="room-record-heading"
      className="mx-auto max-w-6xl px-6 py-20 lg:py-28"
    >
      <Reveal className="mb-12 max-w-2xl">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Architecture
        </p>
        <h2
          id="room-record-heading"
          className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
          style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
        >
          The room and the record are different objects.
        </h2>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          What enters the room stays under session boundaries. What the public can verify is only
          what survives the release gate—with documented limits, not marketing shortcuts.
        </p>
      </Reveal>

      <ol className="relative grid gap-6 lg:grid-cols-3">
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[8%] right-[8%] top-[2.75rem] hidden h-px lg:block"
            style={{ backgroundColor: 'var(--color-border)' }}
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        )}
        {STAGES.map((stage, i) => (
          <Reveal key={stage.id} as="li" delay={0.08 * i}>
            <article
              className="relative h-full border-t-2 pt-6"
              style={{ borderColor: 'var(--color-accent)' }}
            >
              <p
                className="mb-1 font-mono text-xs tabular-nums"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3
                className="mb-4 text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {stage.label}
              </h3>
              <p
                className="mb-3 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Enters:{' '}
                </span>
                {stage.enters}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Stays out of public view:{' '}
                </span>
                {stage.stays}
              </p>
            </article>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
