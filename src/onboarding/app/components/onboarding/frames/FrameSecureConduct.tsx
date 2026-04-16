import { useState } from 'react';
import { motion } from 'motion/react';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obBodyMuted, obFootnote, obH1Hero } from '../OnboardingTypography';
import { OnboardingFooter } from '../OnboardingFooter';

interface FrameSecureConductProps {
  onNext: () => void;
  onBack: () => void;
}

export function FrameSecureConduct({ onNext, onBack }: FrameSecureConductProps) {
  const m = useOnboardingMotion();
  const [accepted, setAccepted] = useState(false);

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="relative mx-auto w-full"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-[radial-gradient(ellipse_at_center,rgba(201,166,107,0.06)_0%,transparent_65%)] opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 0h120v120H0z' fill='%23fff' fill-opacity='0'/%3E%3Cpath d='M20 40h80v50H20z' stroke='%23fff' stroke-width='0.5' fill='none' opacity='0.4'/%3E%3Cpath d='M35 20h40v15H35z' stroke='%23fff' stroke-width='0.5' fill='none' opacity='0.25'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
          filter: 'blur(1px)',
        }}
        aria-hidden
      />

      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        Operational rules inside every squad
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-6 ${obBody} ${obBodyMuted}`}
      >
        <p>To protect you and everyone in the room, you agree to:</p>
      </motion.div>

      <motion.ul
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.2)}
        className="mb-8 space-y-4 font-sans text-[15px] leading-relaxed text-white/80 sm:text-[16px]"
      >
        <li className="border-l-2 border-onboarding-accent/50 pl-4">
          Never share real names, units, exact locations, or live operations.
        </li>
        <li className="border-l-2 border-onboarding-accent/50 pl-4">
          Keep conversations focused on problems and solutions, not personal targeting.
        </li>
        <li className="border-l-2 border-onboarding-accent/50 pl-4">
          Treat every session as off-record and high-risk if mishandled.
        </li>
      </motion.ul>

      <motion.p
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.32)}
        className={obFootnote}
      >
        We run secure-conversation AI on text to help catch mistakes, but you are responsible for what you say.
      </motion.p>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.38)}
        className="mb-10 flex items-start gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-4"
      >
        <Checkbox
          id="rules-accept"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          className="mt-0.5 border-white/30 data-[state=checked]:bg-onboarding-accent data-[state=checked]:border-onboarding-accent"
        />
        <Label htmlFor="rules-accept" className="cursor-pointer text-left text-sm font-normal leading-snug text-white/75">
          I have read and accept the operational rules above.
        </Label>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="I accept these rules"
        nextDisabled={!accepted}
        delay={0.45}
      />
    </motion.div>
  );
}
