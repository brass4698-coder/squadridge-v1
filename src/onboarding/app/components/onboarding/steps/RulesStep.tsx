import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { COPY } from '../copy';
import { useOnboarding } from '../OnboardingContext';
import { obBody, obH1, obH1ToRulesLead, obQuote } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

export function RulesStep({ onBack, onNext, nextLabel, nextDisabled }: StepProps) {
  const { draft, setDraft } = useOnboarding();
  const verifiedExplainerId = useId();
  const messagingExplainerId = useId();
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
      trustNote={TRUST_FOOTER.rules}
    >
      <OnboardingCard>
        <div className="flex max-w-[40rem] flex-col gap-3">
          <div className={`flex flex-col ${obH1ToRulesLead}`}>
            <h1 className={obH1}>{COPY.rules.title}</h1>

            <div className={obBody}>
              <span>{COPY.rules.leadOpen}</span>
              <button
                type="button"
                title={COPY.rules.verifiedAnonymityTriggerAriaLabel}
                onClick={() => setExplainerOpen((o) => !o)}
                className="border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted decoration-white/40 underline-offset-[2px] transition-colors hover:decoration-white/65"
                aria-expanded={explainerOpen}
                aria-controls={verifiedExplainerId}
              >
                {COPY.rules.leadVerifiedPhrase}
              </button>
              {explainerOpen && (
                <div id={verifiedExplainerId} className={`mt-2 ${obQuote}`} role="region">
                  <p className={obBody}>{COPY.rules.verifiedAnonymityExplainer}</p>
                  <p className={`mt-1.5 ${obBody}`}>
                    <Link
                      to="/verify"
                      className="font-medium text-teal underline-offset-2 hover:underline"
                    >
                      {COPY.rules.verifiedAnonymityLinkLabel}
                    </Link>
                    {COPY.rules.verifiedAnonymityLinkAfter}
                  </p>
                </div>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            <li className={obQuote}>
              <p className={obBody}>{COPY.rules.b1}</p>
            </li>
            <li className={obQuote}>
              <p className={obBody}>{COPY.rules.b2}</p>
            </li>
            <li className={obQuote}>
              <p className={obBody}>{COPY.rules.b3}</p>
            </li>
          </ul>

          <div className={obBody}>
            <button
              type="button"
              title={COPY.rules.messagingPrivacyTriggerAriaLabel}
              onClick={() => setMessagingOpen((o) => !o)}
              className="border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted decoration-white/40 underline-offset-[2px] transition-colors hover:decoration-white/65"
              aria-expanded={messagingOpen}
              aria-controls={messagingExplainerId}
            >
              {COPY.rules.messagingPrivacyTriggerLabel}
            </button>
            {messagingOpen && (
              <div id={messagingExplainerId} className={`mt-2 ${obQuote}`} role="region">
                <p className={obBody}>{COPY.rules.messagingPrivacyExplainer}</p>
                <p className={`mt-1.5 ${obBody}`}>
                  <Link
                    to="/security"
                    className="font-medium text-teal underline-offset-2 hover:underline"
                  >
                    {COPY.rules.messagingSecurityLinkLabel}
                  </Link>
                </p>
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-white/8 bg-navy/50 p-3">
            <input
              type="checkbox"
              id="rules-accept"
              data-demo="onboarding-rules-accept"
              checked={draft.rulesAccepted}
              onChange={(e) => setDraft({ rulesAccepted: e.target.checked })}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border border-white/8 bg-navy text-teal focus:ring-1 focus:ring-teal/40"
            />
            <span className={obBody}>{COPY.rules.checkbox}</span>
          </label>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
