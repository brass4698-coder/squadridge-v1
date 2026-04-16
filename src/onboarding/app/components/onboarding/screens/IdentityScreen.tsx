import { motion } from 'motion/react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { cn } from '../../ui/utils';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { upsertProfilePatch } from '../../../../lib/supabase/profile';
import { useCallsignSync, useOnboarding, type EraAffiliation, type RoleArchetype } from '../OnboardingContext';
import { srInputClass, srSelectContent, srSelectTrigger } from '../frames/squadRidgeUi';

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

/** When Role is Other, free text must stay within this range (trimmed). */
const ROLE_OTHER_MIN_LEN = 8;
const ROLE_OTHER_MAX_LEN = 80;

/** Explanatory lines under labels — lighter than labels and choices. */
const obIdentitySubtle = 'text-[13px] leading-relaxed text-white/[0.38]';

const ERAS: { value: Exclude<EraAffiliation, ''>; label: string }[] = [
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'post_911', label: 'Post-9/11' },
  { value: 'cold_war_legacy', label: 'Cold War legacy' },
  { value: 'multi_theater', label: 'Multi-theater' },
  { value: 'undisclosed', label: 'Prefer not to say' },
];

export function IdentityScreen({ onNext, onBack }: IdentityScreenProps) {
  const m = useOnboardingMotion();
  const { draft, setDraft } = useOnboarding();
  useCallsignSync(draft.callsign);

  const otherTrimmed = draft.roleOtherDetail.trim();
  const otherDetailValid =
    draft.roleArchetype !== 'other' ||
    (otherTrimmed.length >= ROLE_OTHER_MIN_LEN &&
      otherTrimmed.length <= ROLE_OTHER_MAX_LEN);
  const valid =
    draft.callsign.trim().length >= 2 &&
    draft.roleArchetype !== '' &&
    otherDetailValid;

  const handleNext = async () => {
    if (!valid) return;
    await upsertProfilePatch({
      callsign: draft.callsign.trim(),
      role_archetype: draft.roleArchetype,
      role_other_detail:
        draft.roleArchetype === 'other' ? draft.roleOtherDetail.trim() : null,
      era_affiliation: draft.eraAffiliation === '' ? null : draft.eraAffiliation,
    });
    onNext();
  };

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full"
    >
      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        {COPY.identity.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-8 max-w-prose font-sans text-[15px] leading-relaxed sm:text-[16px] ${obBodyMuted}`}
      >
        {COPY.identity.lead}
      </motion.p>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.fadeTransition(0.1)}
        role="status"
        className="mb-8 rounded-md border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[13px] leading-snug text-white/70"
      >
        {COPY.identity.requiredFieldsNotice}
      </motion.div>

      <div className="mb-10 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="sr-callsign" className="text-white/85">
            {COPY.identity.callsignLabel}
            <span className="ml-0.5 text-onboarding-accent" aria-hidden="true">
              *
            </span>
          </Label>
          <p className={obIdentitySubtle}>{COPY.identity.callsignWhy}</p>
          <Input
            id="sr-callsign"
            name="callsign"
            autoComplete="nickname"
            value={draft.callsign}
            onChange={(e) => setDraft({ callsign: e.target.value })}
            placeholder="e.g. Northstar-7"
            className={srInputClass}
            aria-required="true"
          />
          <p className={obIdentitySubtle}>{COPY.identity.callsignHint}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white/85" id="sr-role-label">
            {COPY.identity.roleLabel}
            <span className="ml-0.5 text-onboarding-accent" aria-hidden="true">
              *
            </span>
          </p>
          <div className="flex flex-col gap-1.5">
            <p className={obIdentitySubtle}>{COPY.identity.roleWhy}</p>
            <p className={obIdentitySubtle}>{COPY.identity.roleOptionsHint}</p>
          </div>
          <RadioGroup
            value={draft.roleArchetype || undefined}
            onValueChange={(v) => {
              const next = v as RoleArchetype;
              setDraft({
                roleArchetype: next,
                ...(next !== 'other' ? { roleOtherDetail: '' } : {}),
              });
            }}
            className="mt-2 grid gap-2 sm:grid-cols-2"
            aria-labelledby="sr-role-label"
            aria-required="true"
          >
            {ROLES.map(({ value, label }) => (
              <label
                key={value}
                htmlFor={`role-${value}`}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                  draft.roleArchetype === value
                    ? 'border-onboarding-accent/45 bg-onboarding-accent/[0.08]'
                    : 'border-white/12 bg-white/[0.02] hover:border-white/20',
                )}
              >
                <RadioGroupItem value={value} id={`role-${value}`} className="border-white/35" />
                <span className="text-sm text-white/88">{label}</span>
              </label>
            ))}
          </RadioGroup>

          {draft.roleArchetype === 'other' && (
            <div className="space-y-2 pt-1">
              <Label htmlFor="sr-role-other" className="text-white/85">
                {COPY.identity.roleOtherLabel}
                <span className="ml-0.5 text-onboarding-accent" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="sr-role-other"
                name="roleOtherDetail"
                value={draft.roleOtherDetail}
                onChange={(e) =>
                  setDraft({
                    roleOtherDetail: e.target.value.slice(0, ROLE_OTHER_MAX_LEN),
                  })
                }
                placeholder="e.g. humanitarian negotiator"
                className={srInputClass}
                maxLength={ROLE_OTHER_MAX_LEN}
                aria-required="true"
                autoComplete="off"
              />
              <p className={obIdentitySubtle}>{COPY.identity.roleOtherHint}</p>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className={cn(
                    'text-[12px]',
                    otherTrimmed.length > 0 && otherTrimmed.length < ROLE_OTHER_MIN_LEN
                      ? 'text-amber-400/90'
                      : 'text-white/35',
                  )}
                >
                  {otherTrimmed.length > 0 && otherTrimmed.length < ROLE_OTHER_MIN_LEN
                    ? COPY.identity.roleOtherTooShort
                    : `${ROLE_OTHER_MIN_LEN}–${ROLE_OTHER_MAX_LEN} characters.`}
                </p>
                <span className="tabular-nums text-[12px] text-white/35" aria-live="polite">
                  {otherTrimmed.length} / {ROLE_OTHER_MAX_LEN}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white/85">{COPY.identity.eraLabel}</Label>
          <p className={obIdentitySubtle}>{COPY.identity.eraHint}</p>
          <Select
            value={draft.eraAffiliation || undefined}
            onValueChange={(v) => setDraft({ eraAffiliation: v as EraAffiliation })}
          >
            <SelectTrigger className={srSelectTrigger}>
              <SelectValue placeholder="Select an era (optional)" />
            </SelectTrigger>
            <SelectContent className={srSelectContent} position="popper">
              {ERAS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
