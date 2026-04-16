import { useId } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Checkbox } from '../../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { useOnboarding } from '../OnboardingContext';

interface RulesScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function RulesScreen({ onNext, onBack }: RulesScreenProps) {
  const m = useOnboardingMotion();
  const { draft, setDraft } = useOnboarding();
  const verifiedExplainerId = useId();

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="relative mx-auto w-full"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-[radial-gradient(ellipse_at_center,rgba(201,166,107,0.05)_0%,transparent_62%)] opacity-90"
        aria-hidden
      />

      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        {COPY.rules.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-6 font-sans text-[16px] font-medium leading-snug text-white/88 sm:text-[17px]`}
      >
        <span className="inline align-baseline">{COPY.rules.leadOpen}</span>
        <Collapsible className="inline-block max-w-full align-baseline text-left">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              title={COPY.rules.verifiedAnonymityTriggerAriaLabel}
              className="inline border-0 bg-transparent p-0 text-left font-inherit text-inherit underline decoration-dotted decoration-white/40 underline-offset-[3px] transition-colors hover:decoration-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onboarding-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]"
              aria-controls={verifiedExplainerId}
            >
              {COPY.rules.leadVerifiedPhrase}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
            <div
              id={verifiedExplainerId}
              role="region"
              className="mt-3 border-l-2 border-onboarding-accent/35 pl-3 font-sans text-[14px] font-normal leading-relaxed text-white/72 sm:text-[15px]"
            >
              <p className={`mb-0 ${obBodyMuted}`}>{COPY.rules.verifiedAnonymityExplainer}</p>
              <p className={`mb-0 mt-2 text-[13px] leading-relaxed text-white/60 sm:text-[14px] ${obBodyMuted}`}>
                <Link
                  to="/verify"
                  className="font-medium text-onboarding-accent underline-offset-[3px] hover:underline"
                >
                  {COPY.rules.verifiedAnonymityLinkLabel}
                </Link>
                {COPY.rules.verifiedAnonymityLinkAfter}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>

      <motion.ul
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.2)}
        className={`mb-10 space-y-3 font-sans text-[15px] leading-relaxed sm:text-[16px] ${obBodyMuted}`}
      >
        <li className="border-l-2 border-onboarding-accent/45 pl-4">{COPY.rules.b1}</li>
        <li className="border-l-2 border-onboarding-accent/45 pl-4">{COPY.rules.b2}</li>
        <li className="border-l-2 border-onboarding-accent/45 pl-4">{COPY.rules.b3}</li>
      </motion.ul>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.28)}
        className="mb-10 flex items-start gap-3 rounded-md border border-white/[0.08] bg-white/[0.03] p-4"
      >
        <Checkbox
          id="rules-accept"
          checked={draft.rulesAccepted}
          onCheckedChange={(v) => setDraft({ rulesAccepted: v === true })}
          className="mt-0.5 border-white/30 data-[state=checked]:border-onboarding-accent data-[state=checked]:bg-onboarding-accent"
        />
        <Label htmlFor="rules-accept" className="cursor-pointer text-left text-sm font-normal leading-snug text-white/78">
          {COPY.rules.checkbox}
        </Label>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Continue"
        nextDisabled={!draft.rulesAccepted}
        delay={0.4}
      />
    </motion.div>
  );
}
