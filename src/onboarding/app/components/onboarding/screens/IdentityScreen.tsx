import { useCallback, useId } from 'react';
import { motion } from 'motion/react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { cn } from '../../ui/utils';
import { useOnboardingMotion } from '../onboardingMotion';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { PROFILE_ROLE_OTHER_MAX_LEN, PROFILE_ROLE_OTHER_MIN_LEN } from '../../../../../lib';
import { upsertProfilePatch } from '../../../../lib/supabase/profile';
import {
  useCallsignSync,
  useOnboarding,
  type EraAffiliation,
  type RoleArchetype,
} from '../OnboardingContext';

interface IdentityScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const ROLES: { value: Exclude<RoleArchetype, ''>; label: string }[] = [
  { value: 'strategist', label: 'Strategist' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'policy', label: 'Policy' },
  { value: 'mediator', label: 'Mediator' },
  { value: 'field', label: 'Field practitioner' },
  { value: 'other', label: 'Other' },
];

const callsignInputClass =
  'w-full rounded-md bg-navy border border-white/8 px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-teal/40';

const roleButtonClass =
  'rounded-md border border-white/8 bg-navy/60 px-3 py-2 text-sm text-ink-secondary hover:border-teal/40 hover:text-ink transition-colors text-left';

const eraSelectClass =
  'w-full rounded-md border border-white/8 bg-navy px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-teal/40';

/** Four compact options; values map to `EraAffiliation` stored on the profile. */
const ERA_OPTIONS: { value: Exclude<EraAffiliation, ''>; label: string }[] = [
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'cold_war_legacy', label: 'Cold War' },
  { value: 'post_911', label: 'Futures' },
  { value: 'multi_theater', label: 'Historical' },
];

export function IdentityScreen({ onNext, onBack }: IdentityScreenProps) {
  const m = useOnboardingMotion();
  const { draft, setDraft } = useOnboarding();
  const eraId = useId();
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
      era_affiliation: draft.eraAffiliation === '' ? null : draft.eraAffiliation,
    });
    onNext();
  }, [draft, onNext, valid]);

  const eraValue = draft.eraAffiliation || '';

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full min-w-0"
    >
      <section className="w-full">
        <div className="mx-auto max-w-[1040px] rounded-xl border border-white/8 bg-charcoal px-4 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.7)] sm:px-6 sm:py-6 md:px-8">
          <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr] md:gap-8">
            <section className="flex flex-col gap-4">
              <div>
                <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink">
                  {COPY.identity.title}
                </h1>
                <p className="text-sm leading-relaxed text-ink-secondary">{COPY.identity.lead}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="sr-callsign"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
                >
                  {COPY.identity.callsignLabel} <span className="text-teal">*</span>
                </label>
                <p className="mb-1 text-xs text-ink-muted">{COPY.identity.callsignWhy}</p>
                <input
                  id="sr-callsign"
                  name="callsign"
                  autoComplete="nickname"
                  data-demo="onboarding-callsign"
                  value={draft.callsign}
                  onChange={(e) => setDraft({ callsign: e.target.value })}
                  placeholder="e.g. Ironveil, Delta-7, Wren"
                  className={callsignInputClass}
                  aria-required="true"
                />
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
                  id="sr-role-label"
                >
                  {COPY.identity.roleLabel} <span className="text-teal">*</span>
                </p>
                <p className="text-xs text-ink-muted">{COPY.identity.roleWhy}</p>
                <div
                  className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2"
                  role="group"
                  aria-labelledby="sr-role-label"
                  aria-required="true"
                >
                  {ROLES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      data-demo={value === 'strategist' ? 'onboarding-role-strategist' : undefined}
                      className={cn(
                        roleButtonClass,
                        draft.roleArchetype === value && 'border-teal/40 text-ink',
                      )}
                      aria-pressed={draft.roleArchetype === value}
                      onClick={() => {
                        const next = value;
                        setDraft({
                          roleArchetype: next,
                          ...(next !== 'other' ? { roleOtherDetail: '' } : {}),
                        });
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {draft.roleArchetype === 'other' && (
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="sr-role-other"
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
                  >
                    {COPY.identity.roleOtherLabel}
                    <span className="text-teal"> *</span>
                  </Label>
                  <Input
                    id="sr-role-other"
                    name="roleOtherDetail"
                    value={draft.roleOtherDetail}
                    onChange={(e) =>
                      setDraft({
                        roleOtherDetail: e.target.value.slice(0, PROFILE_ROLE_OTHER_MAX_LEN),
                      })
                    }
                    placeholder="e.g. humanitarian negotiator"
                    className={callsignInputClass}
                    maxLength={PROFILE_ROLE_OTHER_MAX_LEN}
                    aria-required="true"
                    autoComplete="off"
                  />
                  <p className="text-xs text-ink-muted">{COPY.identity.roleOtherHint}</p>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        'text-[12px]',
                        otherTrimmed.length > 0 && otherTrimmed.length < PROFILE_ROLE_OTHER_MIN_LEN
                          ? 'text-amber-400/90'
                          : 'text-white/35',
                      )}
                    >
                      {otherTrimmed.length > 0 && otherTrimmed.length < PROFILE_ROLE_OTHER_MIN_LEN
                        ? COPY.identity.roleOtherTooShort
                        : `${PROFILE_ROLE_OTHER_MIN_LEN}–${PROFILE_ROLE_OTHER_MAX_LEN} characters.`}
                    </p>
                    <span className="tabular-nums text-[12px] text-white/35" aria-live="polite">
                      {otherTrimmed.length} / {PROFILE_ROLE_OTHER_MAX_LEN}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={eraId}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
                >
                  {COPY.identity.eraLabel}
                </label>
                <p className="mb-1 text-xs text-ink-muted">{COPY.identity.eraHint}</p>
                <select
                  id={eraId}
                  data-demo="onboarding-era-trigger"
                  className={eraSelectClass}
                  value={eraValue}
                  onChange={(e) =>
                    setDraft({ eraAffiliation: (e.target.value || '') as EraAffiliation })
                  }
                >
                  <option value="">Select context (optional)</option>
                  {ERA_OPTIONS.map(({ value, label }) => (
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
            </section>
          </div>
        </div>
      </section>

      <OnboardingFooter
        onNext={handleNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Continue"
        nextDisabled={!valid}
        delay={0.35}
      />
    </motion.div>
  );
}
