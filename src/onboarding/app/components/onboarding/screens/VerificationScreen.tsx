import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { useOnboarding } from '../OnboardingContext';
import { getAuthCallbackUrl } from '../../../../../lib';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../../../../lib/supabase/client';
import { srInputClass } from '../frames/squadRidgeUi';

interface VerificationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function VerificationScreen({ onNext, onBack }: VerificationScreenProps) {
  const m = useOnboardingMotion();
  const { authUserId, userEmail, sessionPending, refreshSession, setDraft } = useOnboarding();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();
  const hasSession = Boolean(authUserId);
  /** Without backend, onboarding still completes locally; with Supabase, require a session. */
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
      options: { emailRedirectTo: getAuthCallbackUrl('/onboarding') },
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
    onNext();
  };

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="relative mx-auto w-full"
    >
      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        {COPY.verification.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.15)}
        className={`space-y-4 ${obBody} ${obBodyMuted}`}
      >
        <p className="mb-0">{COPY.verification.leadLine1}</p>
        <p className="mb-0">{COPY.verification.leadLine2}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.22)}
        className="mb-8 rounded-md border border-onboarding-accent/25 bg-onboarding-accent/[0.06] px-4 py-3 font-sans text-[13px] leading-snug text-white/72"
      >
        <p className="mb-0">
          <span className="font-semibold text-white/88">{COPY.verification.zkGateEmphasis}</span>
          {COPY.verification.zkGateRest}
        </p>
      </motion.div>

      {!sessionPending && configured && (
        <div className="mb-10 space-y-4">
          {hasSession ? (
            <p className="font-sans text-sm text-onboarding-accent/95">
              {COPY.verification.signedIn}
              {userEmail ? ` · ${userEmail}` : ''}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="verify-email" className="text-white/85">
                  Email
                </Label>
                <Input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={COPY.verification.emailPlaceholder}
                  className={srInputClass}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => void sendMagicLink()}
                  disabled={sending}
                  className="font-sans text-[12px] font-semibold tracking-[0.02em] text-onboarding-accent underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {sending ? 'Sending…' : COPY.verification.sendLink}
                </button>
                <button
                  type="button"
                  onClick={() => void refreshSession()}
                  className="font-sans text-[12px] font-medium text-white/45 hover:text-white/75"
                >
                  I signed in — refresh
                </button>
              </div>
              {sent && (
                <p className="font-sans text-[13px] text-white/55">
                  {COPY.verification.checkEmail}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {!configured && (
        <div className="mb-10 space-y-1.5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.02em] text-white/65">
            {COPY.verification.devNoticeLabel}
          </p>
          <p className="font-sans text-[13px] leading-relaxed text-white/55">
            {COPY.verification.devSupabaseNotice}
          </p>
        </div>
      )}

      <OnboardingFooter
        onNext={handleContinue}
        onBack={onBack}
        navMode="last"
        finalizeLabel={COPY.verification.continue}
        nextDisabled={!canContinue}
        delay={0.4}
      />
    </motion.div>
  );
}
