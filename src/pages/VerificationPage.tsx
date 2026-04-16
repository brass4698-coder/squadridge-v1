import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/env';
import { runVerification, ZK_SESSION_CREDENTIAL_TYPE } from '../lib/zk';

const onboardingDoneCtaClass =
  'btn-primary onboarding-nav-primary inline-flex h-auto min-h-[44px] max-w-max flex-none items-center justify-center px-[2.5rem] py-[0.65rem] font-heading text-[0.95rem] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal';

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
        <div className="relative z-[1] mx-auto w-full max-w-copy px-md py-10">
          <p className="font-sans text-body-lg font-normal text-ink-secondary">
            Supabase is not configured. Add your project keys to{' '}
            <code className="text-teal-light/90">.env</code> and deploy the{' '}
            <code className="text-teal-light/90">verify-zk-proof</code> Edge Function to enable this step.
          </p>
          <Link
            to="/onboarding"
            className="mt-6 inline-flex items-center text-sm font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Back to onboarding
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(42vh,28rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.065)_0%,transparent_58%)]"
        aria-hidden="true"
      />
      <div className="relative z-[1] mx-auto w-full max-w-copy px-md py-10">
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
        <p className="mb-0 mt-4 max-w-copy font-sans text-body-lg font-normal text-ink-secondary">
          This step never asks for documents, email, or phone. Your session stays pseudonymous: the system stores only a
          cryptographic commitment and a nullifier after server-side verification—nothing that links this visit to your
          legal identity.
        </p>

        <section className="mt-10 rounded-2xl border border-[#1e2a3a] bg-gradient-to-b from-[#101722] via-[#0d121c] to-[#0a0f16] px-7 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_32px_64px_-28px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] md:px-11 md:py-11">
          {done ? (
            <div className="space-y-6">
              <p className="mb-0 font-sans text-onboarding-body text-ink-secondary">
                Your verification is recorded for this session. Next, you&apos;ll set your intent so we can match you into
                the right room.
              </p>
              <button type="button" className={onboardingDoneCtaClass} onClick={() => navigate('/intent')}>
                Continue to intent
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {error ? (
                <p className="mb-0 font-sans text-fluid-small text-red-300/95" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="mb-0 font-sans text-onboarding-body text-ink-muted">
                This button generates a Semaphore proof in your browser and sends it to the{' '}
                <code className="text-ink-secondary/90">verify-zk-proof</code> Edge Function for verification and
                persistence. Set <code className="text-ink-secondary/90">VITE_ZK_STUB=true</code> only for a lightweight
                hash demo without ZK cryptography.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className={onboardingDoneCtaClass}
                  disabled={busy}
                  onClick={() => void handleVerify()}
                >
                  {busy ? 'Verifying…' : 'Run verification'}
                </button>

                <Link
                  to="/onboarding"
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
