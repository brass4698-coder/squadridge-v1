import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

/** Full institutional slogan — kept for CTA band / footer echo. */
export const LANDING_SLOGAN =
  'SquadRidge: Zero‑Knowledge Harmony Rooms for High‑Stakes Organizational Truce.';

const CATEGORY = 'Zero‑Knowledge Harmony Rooms';
const CATEGORY_FOR = 'for High‑Stakes Organizational Truce';
const TRUST_LINE = 'Trust comes from boundaries, approvals, and verifiable release—not exposure.';

/**
 * Category-defining hero.
 * Brand is hero-level; the ownable claim is Zero‑Knowledge Harmony Rooms;
 * CTAs are audience-aware without cluttering the first viewport.
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 85% 55% at 100% -10%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 58%), radial-gradient(ellipse 55% 45% at -5% 110%, color-mix(in oklab, var(--color-accent-light) 45%, transparent), transparent 52%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl text-left">
          <motion.p
            className="mb-5 font-semibold tracking-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(1.125rem, 2.2vw, 1.375rem)',
              letterSpacing: '-0.02em',
            }}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
          >
            SquadRidge
          </motion.p>

          <motion.h1
            id="landing-hero-heading"
            className="mb-5 font-medium tracking-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(2.15rem, 5.2vw, 3.35rem)',
              lineHeight: 1.08,
            }}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block">{CATEGORY}</span>
            <span
              className="mt-2 block font-normal"
              style={{
                fontSize: 'clamp(1.15rem, 2.4vw, 1.5rem)',
                lineHeight: 1.35,
                color: 'var(--color-text-secondary)',
              }}
            >
              {CATEGORY_FOR}
            </span>
          </motion.h1>

          <motion.p className="sr-only">{LANDING_SLOGAN}</motion.p>

          <motion.p
            className="mb-3 max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Facilitator-governed rooms for sensitive organizational conflict. Identity is minimized.
            Release is deliberate. Only approved outcomes become a verifiable public record—never
            the transcript.
          </motion.p>

          <motion.p
            className="mb-8 max-w-xl text-sm font-medium leading-relaxed"
            style={{ color: 'var(--color-text-primary)' }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            {TRUST_LINE}
          </motion.p>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
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
              to="/request-access?intent=briefing"
              className="inline-flex items-center justify-center rounded border px-6 py-3 text-sm font-medium transition-[opacity,background-color] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                outlineColor: 'var(--color-accent)',
              }}
            >
              Request a briefing
            </Link>
            <Link
              to="/security"
              className="inline-flex items-center justify-center px-2 py-3 text-sm font-medium underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              For security reviewers
            </Link>
          </motion.div>

          <motion.p
            className="mt-5 text-xs leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
          >
            Documented limits apply.{' '}
            <Link
              to="/security"
              className="underline-offset-2 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              We do not claim operator-blind E2EE or anonymity today
            </Link>
            .
          </motion.p>
        </div>

        <motion.aside
          aria-label="Three governed states"
          className="relative min-h-[260px] lg:min-h-[320px]"
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background:
                'linear-gradient(145deg, var(--color-surface) 0%, color-mix(in oklab, var(--color-accent-light) 50%, var(--color-surface)) 100%)',
              border: '1px solid var(--color-border)',
            }}
          />
          <div className="relative flex h-full flex-col justify-between gap-5 p-6 sm:p-8">
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--color-accent)' }}
            >
              Three governed states · One matter
            </p>
            {[
              {
                label: 'Private room',
                body: 'Invite-only dialogue. Facilitator control. Identity minimized.',
              },
              {
                label: 'Release gate',
                body: 'Recorded approvals. No auto-publish. Facilitator action required.',
              },
              {
                label: 'Public ledger',
                body: 'Approved outcome text + limited metadata + verification anchor.',
              },
            ].map((row, i) => (
              <div
                key={row.label}
                className={i > 0 ? 'border-t pt-4' : ''}
                style={
                  i > 0
                    ? {
                        borderColor: 'color-mix(in oklab, var(--color-border) 85%, transparent)',
                      }
                    : undefined
                }
              >
                <p
                  className="mb-1 text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {row.label}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {row.body}
                </p>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
