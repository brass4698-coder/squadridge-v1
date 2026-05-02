import { useState } from 'react';
import { toast } from 'sonner';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { COPY } from '../copy';
import { getAuthCallbackUrl } from '../../../../../lib';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../../../../lib/supabase/client';
import { useOnboarding } from '../OnboardingContext';
import { ONBOARDING_INPUT_CLASS } from '../onboardingShellStyles';
import { obBody, obH1, obH1ToBlock, obLabel, obQuote } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

export function VerificationStep({ onBack, onNext, nextLabel, nextDisabled }: StepProps) {
  const { authUserId, userEmail, sessionPending, refreshSession, setDraft } = useOnboarding();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();
  const hasSession = Boolean(authUserId);
  const canContinue = !configured || hasSession;

  const sendMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Enter a work email.');
      return;
    }
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setSending(true);
    const { error } = await sb.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: getAuthCallbackUrl('/onboarding/verification') },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success(COPY.verification.checkEmail);
  };

  const handleContinue = () => {
    setDraft({ verificationAcknowledged: true });
    onNext?.();
  };

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={handleContinue}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled || !canContinue}
      trustNote={TRUST_FOOTER.verification}
    >
      <OnboardingCard>
        <div className="flex max-w-[40rem] flex-col gap-3">
          <aside
            className="vault-frost-subtle mb-4 rounded-xl border border-teal/20 bg-teal/[0.06] p-4"
            aria-label="Verification concierge"
          >
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-teal-light/90">
              {COPY.verification.conciergeTitle}
            </p>
            <ul className="mt-3 list-none space-y-2.5 font-sans text-[0.8125rem] leading-relaxed text-ink-secondary">
              {COPY.verification.conciergeTips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-teal/50" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </aside>
          <div className={`flex flex-col ${obH1ToBlock}`}>
            <h1 className={obH1}>{COPY.verification.title}</h1>

            <div className="flex flex-col gap-2">
              <p className={obBody}>{COPY.verification.leadLine1}</p>
              <p className={obBody}>{COPY.verification.leadLine2}</p>
            </div>
          </div>

          <div className={obQuote}>
            <p className={obBody}>
              <span className="font-semibold text-ink">{COPY.verification.zkGateEmphasis}</span>
              {COPY.verification.zkGateRest}
            </p>
          </div>

          {sessionPending && configured && (
            <div className="flex flex-col gap-1" role="status" aria-live="polite" aria-busy="true">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber sm:text-[0.6875rem]">
                Checking sign-in session…
              </p>
              <p className="text-[0.6875rem] leading-snug text-ink-muted">
                Confirming whether you already opened a magic-link in this browser. The Continue
                button stays disabled until this check finishes.
              </p>
            </div>
          )}

          {!sessionPending && configured && (
            <div className="flex flex-col gap-3">
              {hasSession ? (
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber sm:text-[0.6875rem]">
                  {COPY.verification.signedIn}
                  {userEmail ? ` · ${userEmail}` : ''}
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className={obLabel}>Email</span>
                    <input
                      id="verify-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={COPY.verification.emailPlaceholder}
                      className={ONBOARDING_INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void sendMagicLink()}
                      disabled={sending}
                      className="text-[0.8125rem] font-medium text-teal underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {sending ? 'Sending…' : COPY.verification.sendLink}
                    </button>
                    <button
                      type="button"
                      onClick={() => void refreshSession()}
                      className="text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      I signed in — refresh
                    </button>
                  </div>
                  {sent && (
                    <p className="text-[0.6875rem] leading-snug text-ink-muted">
                      {COPY.verification.checkEmail}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {!configured && (
            <div className="flex flex-col gap-1">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-amber sm:text-[0.6875rem]">
                {COPY.verification.devNoticeLabel}
              </p>
              <p className="text-[0.6875rem] leading-snug text-ink-muted">
                {COPY.verification.devSupabaseNotice}
              </p>
            </div>
          )}
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
