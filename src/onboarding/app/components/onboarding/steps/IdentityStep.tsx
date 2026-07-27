import { useCallback } from 'react';
import { cn } from '../../ui/utils';
import { upsertProfilePatch } from '../../../../lib/supabase/profile';
import { PROFILE_ROLE_OTHER_MAX_LEN, PROFILE_ROLE_OTHER_MIN_LEN } from '../../../../../lib';
import {
  useCallsignSync,
  useOnboarding,
  type EraAffiliation,
  type RoleArchetype,
} from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { COPY } from '../copy';
import {
  ONBOARDING_INPUT_CLASS,
  ROLE_BUTTON_ACTIVE_CLASS,
  ROLE_BUTTON_INACTIVE_CLASS,
} from '../onboardingShellStyles';
import { obBody, obH1, obH1ToLead, obHelper, obLabel } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

const ROLES: { label: string; value: Exclude<RoleArchetype, ''>; hint: string }[] = [
  { label: 'Strategist', value: 'strategist', hint: 'Shapes options and trade-offs' },
  { label: 'Analyst', value: 'analyst', hint: 'Grounds the room in evidence' },
  { label: 'Policy', value: 'policy', hint: 'Keeps decisions implementable' },
  { label: 'Mediator', value: 'mediator', hint: 'Holds space when tension rises' },
  { label: 'Field practitioner', value: 'field', hint: 'Brings lived operational context' },
  { label: 'Other', value: 'other', hint: 'Describe your lane in your own words' },
];

const ERAS: { label: string; value: Exclude<EraAffiliation, ''> }[] = [
  { label: 'Contemporary', value: 'contemporary' },
  { label: 'Cold War', value: 'cold_war_legacy' },
  { label: 'Futures', value: 'post_911' },
  { label: 'Historical', value: 'multi_theater' },
];

export function IdentityStep({ onBack, onNext, nextLabel, nextDisabled }: StepProps) {
  const { draft, setDraft } = useOnboarding();
  useCallsignSync(draft.callsign);

  const otherTrimmed = draft.roleOtherDetail.trim();
  const otherDetailValid =
    draft.roleArchetype !== 'other' ||
    (otherTrimmed.length >= PROFILE_ROLE_OTHER_MIN_LEN &&
      otherTrimmed.length <= PROFILE_ROLE_OTHER_MAX_LEN);
  const valid = draft.callsign.trim().length >= 2 && draft.roleArchetype !== '' && otherDetailValid;

  const handleNext = useCallback(async () => {
    if (!valid) return;
    await upsertProfilePatch({
      callsign: draft.callsign.trim(),
      role_archetype: draft.roleArchetype,
      role_other_detail: draft.roleArchetype === 'other' ? draft.roleOtherDetail.trim() : null,
      era_affiliation: draft.eraAffiliation === '' ? 'contemporary' : draft.eraAffiliation,
    });
    onNext?.();
  }, [draft, onNext, valid]);

  const eraValue = draft.eraAffiliation || 'contemporary';

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={() => void handleNext()}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled || !valid}
      trustNote={TRUST_FOOTER.identity}
    >
      <OnboardingCard>
        <div className="grid min-h-0 grid-cols-1 items-start gap-x-6 gap-y-3 lg:grid-cols-[1.12fr_1fr] lg:gap-x-8">
          <div className="flex min-h-0 flex-col gap-3">
            <div className={`flex flex-col ${obH1ToLead}`}>
              <h1 className={obH1}>Identity model</h1>
              <p className={obBody}>
                Your callsign is how the room knows you. No real name. No rank. No unit. Just the
                handle you bring to the table.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className={obLabel}>Callsign</span>
                <span className="text-xs text-teal">*</span>
              </div>
              <p className={obHelper}>How others address you in the room. Choose deliberately.</p>
              <input
                type="text"
                name="callsign"
                autoComplete="nickname"
                data-demo="onboarding-callsign"
                value={draft.callsign}
                onChange={(e) => setDraft({ callsign: e.target.value })}
                placeholder="e.g. Ironveil, Delta-7, Wren"
                className={ONBOARDING_INPUT_CLASS}
                aria-required="true"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className={obLabel} id="sr-role-label">
                  Your lane
                </span>
                <span className="text-xs text-teal">*</span>
              </div>
              <p className={obHelper}>{COPY.identity.roleWhy}</p>
              <div
                className="grid grid-cols-2 gap-1.5"
                role="group"
                aria-labelledby="sr-role-label"
                aria-required="true"
              >
                {ROLES.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    data-demo={
                      value === 'strategist'
                        ? 'onboarding-role-strategist'
                        : value === 'analyst'
                          ? 'onboarding-role-analyst'
                          : undefined
                    }
                    className={cn(
                      draft.roleArchetype === value
                        ? ROLE_BUTTON_ACTIVE_CLASS
                        : ROLE_BUTTON_INACTIVE_CLASS,
                      'flex flex-col items-start gap-0.5 text-left',
                    )}
                    aria-pressed={draft.roleArchetype === value}
                    title={hint}
                    onClick={() => {
                      setDraft({
                        roleArchetype: value,
                        ...(value !== 'other' ? { roleOtherDetail: '' } : {}),
                      });
                    }}
                  >
                    <span>{label}</span>
                    <span className="text-[0.65rem] font-normal leading-snug text-white/45">
                      {hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {draft.roleArchetype === 'other' && (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className={obLabel}>{COPY.identity.roleOtherLabel}</span>
                  <span className="text-xs text-teal">*</span>
                </div>
                <input
                  type="text"
                  name="roleOtherDetail"
                  value={draft.roleOtherDetail}
                  onChange={(e) =>
                    setDraft({
                      roleOtherDetail: e.target.value.slice(0, PROFILE_ROLE_OTHER_MAX_LEN),
                    })
                  }
                  placeholder="e.g. humanitarian negotiator"
                  className={ONBOARDING_INPUT_CLASS}
                  maxLength={PROFILE_ROLE_OTHER_MAX_LEN}
                  aria-required="true"
                  autoComplete="off"
                />
                <p className={obHelper}>{COPY.identity.roleOtherHint}</p>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      'text-[0.6875rem]',
                      otherTrimmed.length > 0 && otherTrimmed.length < PROFILE_ROLE_OTHER_MIN_LEN
                        ? 'text-amber'
                        : 'text-ink-muted',
                    )}
                  >
                    {otherTrimmed.length > 0 && otherTrimmed.length < PROFILE_ROLE_OTHER_MIN_LEN
                      ? COPY.identity.roleOtherTooShort
                      : `${PROFILE_ROLE_OTHER_MIN_LEN}–${PROFILE_ROLE_OTHER_MAX_LEN} characters.`}
                  </p>
                  <span className="tabular-nums text-[0.6875rem] text-ink-muted" aria-live="polite">
                    {otherTrimmed.length} / {PROFILE_ROLE_OTHER_MAX_LEN}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className={obLabel}>Operational context</span>
              <p className={obHelper}>{COPY.identity.eraHint}</p>
              <select
                data-demo="onboarding-era-trigger"
                className={ONBOARDING_INPUT_CLASS}
                value={eraValue}
                onChange={(e) =>
                  setDraft({ eraAffiliation: (e.target.value || '') as EraAffiliation })
                }
              >
                {ERAS.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    data-demo={
                      value === 'contemporary' ? 'onboarding-era-item-contemporary' : undefined
                    }
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
