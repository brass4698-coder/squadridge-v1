import { useCallback, useState, type FormEvent } from 'react';
import { cn } from '../ui/utils';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

/** Payload passed to `onComplete` when all required fields pass validation. */
export type PlacementRequiredFormData = {
  language: string;
  regionLane: string;
  roleArchetype: string;
  rulesAccepted: boolean;
};

export type SelectOption = { value: string; label: string };

const EMPTY = '';

const defaultLanguageOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'other', label: 'Other' },
];

const defaultRegionLaneOptions: SelectOption[] = [
  { value: 'europe-nato', label: 'Europe / NATO context' },
  { value: 'mena', label: 'Middle East & North Africa' },
  { value: 'indo-pacific', label: 'Indo-Pacific' },
  { value: 'americas', label: 'Americas' },
  { value: 'africa-sahel', label: 'Africa / Sahel' },
  { value: 'global-multi', label: 'Global / multi-theater' },
];

const defaultRoleArchetypeOptions: SelectOption[] = [
  { value: 'strategist', label: 'Strategist' },
  { value: 'mediator', label: 'Mediator' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'field', label: 'Field practitioner' },
  { value: 'policy', label: 'Policy' },
  { value: 'other', label: 'Other' },
];

const fieldClass =
  'w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white shadow-none outline-none transition-[border-color,box-shadow] focus:border-onboarding-accent/55 focus:ring-2 focus:ring-onboarding-accent/25';

const errorTextClass = 'mt-1.5 text-[12px] font-medium text-red-400/95';

export type PlacementRequiredFieldsFormProps = {
  onComplete: (data: PlacementRequiredFormData) => void;
  languageOptions?: SelectOption[];
  regionLaneOptions?: SelectOption[];
  roleArchetypeOptions?: SelectOption[];
  rulesLabel?: string;
  continueLabel?: string;
  className?: string;
};

/**
 * Blocks progression until `language`, `regionLane`, `roleArchetype` are chosen and `rulesAccepted` is true.
 * On invalid submit, shows inline errors and does not call `onComplete`.
 */
export function PlacementRequiredFieldsForm({
  onComplete,
  languageOptions = defaultLanguageOptions,
  regionLaneOptions = defaultRegionLaneOptions,
  roleArchetypeOptions = defaultRoleArchetypeOptions,
  rulesLabel = 'I have read and accept the operational rules for SquadRidge rooms.',
  continueLabel = 'Continue',
  className,
}: PlacementRequiredFieldsFormProps) {
  const [language, setLanguage] = useState(EMPTY);
  const [regionLane, setRegionLane] = useState(EMPTY);
  const [roleArchetype, setRoleArchetype] = useState(EMPTY);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof PlacementRequiredFormData, string>>>({});

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof PlacementRequiredFormData, string>> = {};

    if (!language.trim()) next.language = 'Select a language.';
    if (!regionLane.trim()) next.regionLane = 'Select a region / lane.';
    if (!roleArchetype.trim()) next.roleArchetype = 'Select a role.';
    if (!rulesAccepted) next.rulesAccepted = 'Accept the rules to continue.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [language, regionLane, roleArchetype, rulesAccepted]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onComplete({
      language,
      regionLane,
      roleArchetype,
      rulesAccepted: true,
    });
  };

  const selectProps = (field: keyof PlacementRequiredFormData) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${String(field)}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-8', className)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="placement-language" className="text-white/85">
          Language
        </Label>
        <select
          id="placement-language"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            if (errors.language) setErrors((prev) => ({ ...prev, language: undefined }));
          }}
          className={cn(fieldClass, errors.language && 'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/25')}
          {...selectProps('language')}
        >
          <option value={EMPTY} disabled>
            Choose language
          </option>
          {languageOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0f1622]">
              {o.label}
            </option>
          ))}
        </select>
        {errors.language ? (
          <p id="language-error" role="alert" className={errorTextClass}>
            {errors.language}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="placement-region" className="text-white/85">
          Region / lane
        </Label>
        <select
          id="placement-region"
          value={regionLane}
          onChange={(e) => {
            setRegionLane(e.target.value);
            if (errors.regionLane) setErrors((prev) => ({ ...prev, regionLane: undefined }));
          }}
          className={cn(fieldClass, errors.regionLane && 'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/25')}
          {...selectProps('regionLane')}
        >
          <option value={EMPTY} disabled>
            Choose region or lane
          </option>
          {regionLaneOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0f1622]">
              {o.label}
            </option>
          ))}
        </select>
        {errors.regionLane ? (
          <p id="regionLane-error" role="alert" className={errorTextClass}>
            {errors.regionLane}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="placement-role" className="text-white/85">
          Role archetype
        </Label>
        <select
          id="placement-role"
          value={roleArchetype}
          onChange={(e) => {
            setRoleArchetype(e.target.value);
            if (errors.roleArchetype) setErrors((prev) => ({ ...prev, roleArchetype: undefined }));
          }}
          className={cn(
            fieldClass,
            errors.roleArchetype && 'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/25',
          )}
          {...selectProps('roleArchetype')}
        >
          <option value={EMPTY} disabled>
            Choose role
          </option>
          {roleArchetypeOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0f1622]">
              {o.label}
            </option>
          ))}
        </select>
        {errors.roleArchetype ? (
          <p id="roleArchetype-error" role="alert" className={errorTextClass}>
            {errors.roleArchetype}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div
          className={cn(
            'flex items-start gap-3 rounded-md border px-3 py-3',
            errors.rulesAccepted ? 'border-red-400/50 bg-red-500/[0.06]' : 'border-white/[0.08] bg-white/[0.02]',
          )}
        >
          <Checkbox
            id="placement-rules"
            checked={rulesAccepted}
            onCheckedChange={(v) => {
              setRulesAccepted(v === true);
              if (errors.rulesAccepted) setErrors((prev) => ({ ...prev, rulesAccepted: undefined }));
            }}
            className="mt-0.5 border-white/35 data-[state=checked]:border-onboarding-accent data-[state=checked]:bg-onboarding-accent"
            aria-invalid={errors.rulesAccepted ? true : undefined}
            aria-describedby={errors.rulesAccepted ? 'rulesAccepted-error' : undefined}
          />
          <Label htmlFor="placement-rules" className="cursor-pointer text-left text-sm font-normal leading-snug text-white/78">
            {rulesLabel}
          </Label>
        </div>
        {errors.rulesAccepted ? (
          <p id="rulesAccepted-error" role="alert" className={errorTextClass}>
            {errors.rulesAccepted}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end border-t border-white/[0.08] pt-6">
        <button
          type="submit"
          className="rounded-md border border-onboarding-accent/45 bg-onboarding-accent/[0.12] px-6 py-2.5 font-sans text-[13px] font-semibold tracking-wide text-onboarding-accent transition-[transform,box-shadow] hover:bg-onboarding-accent/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/50"
        >
          {continueLabel}
        </button>
      </div>
    </form>
  );
}

/*
 * Example usage (e.g. route `/onboarding/placement` or inside a parent step):
 *
 * ```tsx
 * import { useNavigate } from 'react-router';
 * import {
 *   PlacementRequiredFieldsForm,
 *   type PlacementRequiredFormData,
 * } from '@/app/components/onboarding/PlacementRequiredFieldsForm';
 *
 * export function OnboardingPlacementRoute() {
 *   const navigate = useNavigate();
 *
 *   const handleComplete = (data: PlacementRequiredFormData) => {
 *     // persist, context, or API — then advance
 *     console.log(data);
 *     navigate('/onboarding/next-step');
 *   };
 *
 *   return (
 *     <div className="mx-auto max-w-lg px-4 py-10 text-white">
 *       <h1 className="mb-8 font-display text-2xl font-semibold">Placement</h1>
 *       <PlacementRequiredFieldsForm onComplete={handleComplete} />
 *     </div>
 *   );
 * }
 * ```
 */
