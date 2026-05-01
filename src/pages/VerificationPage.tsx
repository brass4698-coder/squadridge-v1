import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NextStepHint } from '../components/ui/NextStepHint';
import { useAuth } from '../contexts/AuthContext';
import {
  isSupabaseConfigured,
  isZkTlsLabsEnabled,
  runVerification,
  ZK_SESSION_CREDENTIAL_TYPE,
} from '../lib';

const onboardingDoneCtaClass =
  'btn-primary onboarding-nav-primary inline-flex h-auto min-h-[44px] max-w-full items-center justify-center px-6 py-[0.65rem] font-heading text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:px-[2.5rem]';

/**
 * Verification entry: no PII forms. Uses {@link runVerification} (Semaphore + `verify-zk-proof`, or hash stub if `VITE_ZK_STUB=true`).
 */
export function VerificationPage() {
  const navigate = useNavigate();
  const { supabase, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!configured || !supabase) return;
    void ensureAnonymousSession();
  }, [configured, supabase, ensureAnonymousSession]);

  async function handleVerify() {
    if (!supabase || busy) return;

    setBusy(true);
    setError(null);

    try {
      await runVerification(supabase, ZK_SESSION_CREDENTIAL_TYPE, 'verification_flow');
      setDone(true);
    } catch (e) {
      const message =
        e instanceof Error && e.message?.trim().length
          ? e.message
          : 'Verification could not be completed. Please try again.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (!configured || !supabase) {
    return (
      <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
        <div className="relative z-[1] mx-auto w-full max-w-copy px-gutter py-10">
          <p className="font-sans text-body-lg font-normal text-ink-secondary">
            Live verification isn’t available in this environment. Add your project keys to{' '}
            <code className="text-teal-light/90">.env</code> and deploy the{' '}
            <code className="text-teal-light/90">verify-zk-proof</code> Edge Function to enable this
            step.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center text-sm font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5" data-demo="verify-root">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(42vh,28rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.065)_0%,transparent_58%)]"
        aria-hidden="true"
      />
      <div className="relative z-[1] mx-auto w-full max-w-copy px-gutter py-10">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Verification
        </p>
        <h1
          className="mb-0 mt-2 font-heading text-ink"
          style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
          }}
        >
          Prove you belong without exposing identity
        </h1>
        <p className="mb-0 mt-3 max-w-copy font-sans text-[0.88rem] leading-relaxed text-ink-muted">
          Standalone page for tests and returning users. The cryptography is the same as in the main
          product flow; this route is optional if you already completed verification elsewhere.
        </p>
        <p className="mb-0 mt-3 max-w-copy font-sans text-[0.88rem] leading-relaxed text-ink-secondary">
          Verification helps us match you with vetted peers when you use squad matching — optional
          for open dialogue.
        </p>
        <p className="mb-0 mt-4 max-w-copy font-sans text-body-lg font-normal text-ink-secondary">
          This step never asks for documents, email, or phone. Your session stays pseudonymous: the
          system stores only a cryptographic commitment and a nullifier after server-side
          verification—nothing that links this visit to your legal identity.
        </p>
        <p className="mb-0 mt-4 rounded-lg border border-teal/25 bg-navy-dark/50 px-4 py-3 font-sans text-[0.85rem] leading-relaxed text-ink-muted">
          What verification proves here: cryptographic attribute checks for matching. What it still
          permits by design: timestamps, coarse routing signals, squad keys for support contexts,
          and moderator-visible records under policy—not “operator-proof” secrecy.
        </p>
        <ol className="mb-0 mt-6 list-decimal space-y-2 pl-5 font-sans text-[0.85rem] leading-relaxed text-ink-muted">
          <li>Keep this tab or stay in the same browser session.</li>
          <li>Run verification so the browser can prove your attribute to the Edge function.</li>
          <li>Continue to Find squad when you are ready to match.</li>
        </ol>
        <p className="mb-0 mt-5 font-sans text-[0.82rem] leading-relaxed text-ink-muted">
          Need help? Facilitators should follow{' '}
          <code className="text-ink-secondary/90">docs/operations/pilot-runbook.md</code> — see
          “Verification failures (facilitators)”. Participants can review the{' '}
          <Link to="/security" className="text-teal-light underline underline-offset-4">
            Security disclosure
          </Link>
          .
        </p>
        {isZkTlsLabsEnabled() ? (
          <p
            className="mb-0 mt-4 rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 font-sans text-[0.85rem] text-amber"
            role="status"
          >
            Labs: <code className="font-mono text-[0.8rem]">VITE_ZKTLS_LABS</code> is on —
            zkTLS-style proofs are not shipped; see{' '}
            <code className="font-mono text-[0.8rem]">
              docs/technical/rfc-zktls-attribute-proofs.md
            </code>
            .
          </p>
        ) : null}

        <section className="mt-10 rounded-2xl border border-[#1e2a3a] bg-gradient-to-b from-[#101722] via-[#0d121c] to-[#0a0f16] px-7 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_32px_64px_-28px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] md:px-11 md:py-11">
          {done ? (
            <div className="space-y-6">
              <p className="mb-0 font-sans text-onboarding-body text-ink-secondary">
                Your verification is recorded for this session. Next, you&apos;ll set your intent so
                we can match you into the right room.
              </p>
              <NextStepHint className="border-[#1e2a3a] bg-[#0c1118]/80">
                <span className="font-medium text-slate-400">Next:</span> Open Find squad, choose a
                perspective, and start matching. Your verified role can improve pool routing.
              </NextStepHint>
              <button
                type="button"
                className={onboardingDoneCtaClass}
                onClick={() => navigate('/find-squad')}
              >
                Continue to Find squad
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {error ? (
                <p className="mb-0 font-sans text-fluid-small text-red-300/95" role="alert">
                  {error}
                </p>
              ) : null}

              <NextStepHint className="border-[#1e2a3a] bg-[#0c1118]/80">
                <span className="font-medium text-slate-400">Next:</span> After verification, use
                Find squad to enter matchmaking. You can return here anytime this session.
              </NextStepHint>

              <p className="mb-0 font-sans text-onboarding-body text-ink-muted">
                This button generates a Semaphore proof in your browser and sends it to the{' '}
                <code className="text-ink-secondary/90">verify-zk-proof</code> Edge Function for
                verification and persistence. Set{' '}
                <code className="text-ink-secondary/90">VITE_ZK_STUB=true</code> only for a
                lightweight hash demo without ZK cryptography.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className={onboardingDoneCtaClass}
                  disabled={busy}
                  data-demo="verify-run"
                  onClick={() => void handleVerify()}
                >
                  {busy ? 'Verifying…' : 'Run verification'}
                </button>

                <Link
                  to="/"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-heading text-[0.9rem] font-medium text-ink-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-[#3d4f65] hover:text-ink"
                >
                  Back
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
