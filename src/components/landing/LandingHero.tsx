import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

export const LANDING_SLOGAN =
  'SquadRidge: Zero‑Knowledge Harmony Rooms for High‑Stakes Organizational Truce.';

const TRUST_LINE = 'Trust comes from boundaries, approvals, and verifiable release—not exposure.';

/**
 * Hero — brand-first, exact slogan, honest subhead, dual CTAs.
 * No cards, no floating badges, no surveillance aesthetics.
 */
export function LandingHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      aria-labelledby="landing-hero-heading"
      className="relative overflow-hidden border-b"
      style={{
        borderColor: 'var(--color-border)',
        background:
          'linear-gradient(165deg, color-mix(in oklab, var(--color-surface) 88%, var(--color-accent-light)) 0%, var(--color-bg) 42%, var(--color-bg) 100%)',
      }}
    >
      {/* Atmospheric plane — restrained institutional texture, not decoration cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 100% 0%, color-mix(in oklab, var(--color-accent) 12%, transparent), transparent 55%), radial-gradient(ellipse 60% 40% at 0% 100%, color-mix(in oklab, var(--color-accent-light) 40%, transparent), transparent 50%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:pb-24 lg:pt-20">
        <div className="max-w-2xl text-left">
          <motion.p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--color-accent)' }}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            SquadRidge
          </motion.p>

          <motion.h1
            id="landing-hero-heading"
            className="mb-5 font-medium tracking-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(1.75rem, 4.2vw, 2.75rem)',
              lineHeight: 1.15,
            }}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {LANDING_SLOGAN}
          </motion.h1>

          <motion.p
            className="mb-3 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            Private, facilitator-governed rooms for sensitive organizational conflict, with approved
            outcomes only and verifiable release when the process allows.
          </motion.p>

          <motion.p
            className="mb-8 max-w-xl text-sm font-medium leading-relaxed"
            style={{ color: 'var(--color-text-primary)' }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            {TRUST_LINE}
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
          >
            <Link
              to="/request-access"
              className="inline-flex items-center justify-center rounded px-6 py-3 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-accent)',
                outlineColor: 'var(--color-accent)',
              }}
            >
              Request pilot access
            </Link>
            <Link
              to="/?demo=1"
              className="inline-flex items-center justify-center rounded border px-6 py-3 text-sm font-medium transition-[opacity,background-color] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                outlineColor: 'var(--color-accent)',
              }}
            >
              View demo walkthrough
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center justify-center px-2 py-3 text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70 hover:underline sm:ml-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              See release model
            </Link>
          </motion.div>
        </div>

        {/* Room vs record — visual plane, not a card stack */}
        <motion.aside
          aria-label="Room versus record model"
          className="relative min-h-[220px] lg:min-h-[280px]"
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background:
                'linear-gradient(135deg, var(--color-surface) 0%, color-mix(in oklab, var(--color-accent-light) 55%, var(--color-surface)) 100%)',
              border: '1px solid var(--color-border)',
            }}
          />
          <div className="relative flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
            <div>
              <p
                className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Private session room
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                Invite-only dialogue. Facilitator control. Identity minimized inside the room. Raw
                conversation is not the public artifact.
              </p>
            </div>
            <div
              className="border-t pt-6"
              style={{ borderColor: 'color-mix(in oklab, var(--color-border) 80%, transparent)' }}
            >
              <p
                className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--color-accent)' }}
              >
                Released record
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                Approved outcome text and limited metadata only—after recorded approvals—with a
                verification anchor the public can check.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
