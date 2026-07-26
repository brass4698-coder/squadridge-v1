import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { FormPanel } from '../../components/ui/FormPanel';
import { FormAlert } from '../../components/ui/FormAlert';
import { FormProgress } from '../../components/ui/FormProgress';
import { FormSection } from '../../components/ui/FormSection';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useAccessRequest } from '../../hooks/useAccessRequest';
import { usePageTitle } from '../../hooks/usePageTitle';
import { CTA, PILOT_FIT_STRONG, PILOT_FIT_WEAK } from '../../data/siteMessaging';
import { BUYER_TRACK_INTAKE, type BuyerTrackParam } from '../../data/useCases';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { SectionLabel } from '../../components/SectionLabel';
import { getPublicContactEmail } from '../../lib/env';

const DRAFT_STORAGE_KEY = 'sr.pilot-intake.draft.v1';

function resolveBuyerTrack(raw: string | null): BuyerTrackParam | null {
  if (raw === 'foundations' || raw === 'peacebuilding' || raw === 'hr') return raw;
  return null;
}

const ORG_TYPES = [
  'Foundation / philanthropy',
  'NGO / civil society',
  'Mediation practice / ADR center',
  'Corporation / board / executive office',
  'HR / compliance / ombuds',
  'Government or public institution',
  'Peacebuilding / Track II',
  'Other',
];

const MATTER_TYPES = [
  'Internal deliberation / decision memo',
  'Mediation & dispute resolution',
  'Board or executive conflict',
  'HR / ombuds inquiry',
  'Peacebuilding / cross-party dialogue',
  'Other',
];

const ROLE_OPTIONS = [
  'Professional mediator / facilitator',
  'Program lead / foundation officer',
  'Ombuds / HR / compliance',
  'Executive / board sponsor',
  'Institutional convener',
  'Other',
];

const SENSITIVITY = ['Standard', 'Elevated', 'High'];
const PUBLIC_RECORD = ['Likely needed', 'Optional', 'Internal-only preferred', 'Unsure'];
const TIMEFRAMES = ['Within 30 days', '1–3 months', '3–6 months', 'Exploratory only'];
const ORG_SIZES = ['1–10 people', '11–50', '51–250', '251–1,000', '1,000+', 'Prefer not to say'];
const MEDIATION_VOLUME = [
  'Fewer than 5 matters / year',
  '5–20 matters / year',
  '20–50 matters / year',
  '50+ matters / year',
  'Not primarily mediation volume',
];
const FACILITATOR_COUNTS = ['1', '2–5', '6–15', '16+', 'Not yet staffed'];

const AFTER_SUBMIT_STEPS = [
  {
    title: 'Submit',
    body: 'Share contact details, matter context, and pilot scope.',
  },
  {
    title: 'Manual review',
    body: 'A human assesses fit and sensitivity within 5–7 business days.',
  },
  {
    title: 'Scoped next step',
    body: 'Co-designed pilot scope and role-scoped invitations — no open deployment.',
  },
] as const;

const FORM_SECTIONS = [
  { id: 'contact', label: 'Contact' },
  { id: 'matter', label: 'Matter' },
  { id: 'additional', label: 'Additional' },
] as const;

const TRUST_RAIL = [
  'Manual review',
  'Invite-only',
  'Role-scoped access',
  '5–7 day response',
] as const;

type FormState = {
  name: string;
  organisation: string;
  email: string;
  role: string;
  orgType: string;
  orgSize: string;
  matterType: string;
  mediationVolume: string;
  facilitatorCount: string;
  participants: string;
  region: string;
  sensitivity: string;
  publicRecord: string;
  painPoints: string;
  timeframe: string;
  phone: string;
  buyerTrack: string;
};

type FormKey = keyof FormState;

const REQUIRED_KEYS: FormKey[] = [
  'name',
  'organisation',
  'email',
  'role',
  'matterType',
  'painPoints',
];

const EMPTY_FORM: FormState = {
  name: '',
  organisation: '',
  email: '',
  role: '',
  orgType: '',
  orgSize: '',
  matterType: '',
  mediationVolume: '',
  facilitatorCount: '',
  participants: '',
  region: '',
  sensitivity: '',
  publicRecord: '',
  painPoints: '',
  timeframe: '',
  phone: '',
  buyerTrack: '',
};

function readDraft(): FormState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...EMPTY_FORM, ...parsed };
  } catch {
    return null;
  }
}

function writeDraft(form: FormState) {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  } catch {
    /* private mode / quota */
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function formHasContent(form: FormState): boolean {
  return (Object.keys(form) as FormKey[]).some((k) => form[k].trim().length > 0);
}

/**
 * Institutional pilot intake console.
 */
export function RequestAccessPage() {
  usePageTitle('Request pilot access');
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email')?.trim() ?? '';
  const buyerTrack = resolveBuyerTrack(searchParams.get('track'));
  const trackDefaults = buyerTrack ? BUYER_TRACK_INTAKE[buyerTrack] : null;
  const { submit, loading, error, submitted } = useAccessRequest();
  const contactEmail = getPublicContactEmail() ?? 'hello@squadridge.com';
  const [form, setForm] = useState<FormState>(() => {
    const draft = typeof window !== 'undefined' ? readDraft() : null;
    return {
      ...EMPTY_FORM,
      ...draft,
      email: prefilledEmail || draft?.email || '',
      orgType: trackDefaults?.orgType ?? draft?.orgType ?? '',
      matterType: trackDefaults?.matterType ?? draft?.matterType ?? '',
      buyerTrack: buyerTrack ?? draft?.buyerTrack ?? '',
    };
  });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(() => Boolean(readDraft()));

  useEffect(() => {
    if (submitted) {
      clearDraft();
      return;
    }
    if (!formHasContent(form)) {
      clearDraft();
      setDraftRestored(false);
      return;
    }
    writeDraft(form);
    setDraftRestored(true);
  }, [form, submitted]);

  useEffect(() => {
    if (submitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!formHasContent(form)) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [form, submitted]);

  function set(key: FormKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function markTouched(key: FormKey) {
    setTouched((t) => (t[key] ? t : { ...t, [key]: true }));
  }

  function fieldInvalid(key: FormKey): boolean {
    if (!REQUIRED_KEYS.includes(key)) return false;
    if (!(attempted || touched[key])) return false;
    return !form[key].trim();
  }

  function sectionComplete(keys: FormKey[]): boolean {
    return keys.every((k) => form[k].trim().length > 0);
  }

  const contactKeys: FormKey[] = ['name', 'organisation', 'email', 'role'];
  const matterKeys: FormKey[] = ['matterType', 'painPoints'];
  const additionalKeys: FormKey[] = [
    'orgType',
    'orgSize',
    'mediationVolume',
    'facilitatorCount',
    'participants',
    'region',
    'sensitivity',
    'publicRecord',
    'timeframe',
  ];

  const sectionStatus = [
    sectionComplete(contactKeys),
    sectionComplete(matterKeys),
    additionalKeys.some((k) => form[k].trim().length > 0),
  ];
  const completedSections = [sectionComplete(contactKeys), sectionComplete(matterKeys)].filter(
    Boolean,
  ).length;
  const progressTotal = 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);

    const missing = REQUIRED_KEYS.filter((k) => !form[k].trim());
    if (missing.length > 0) {
      const first = missing[0];
      document.getElementById(first)?.focus();
      return;
    }

    const detailBlock = [
      form.painPoints.trim(),
      form.buyerTrack ? `Buyer track: ${form.buyerTrack}` : '',
      `Role in process: ${form.role}`,
      `Matter type: ${form.matterType}`,
      form.orgType ? `Organization type: ${form.orgType}` : '',
      form.orgSize ? `Organization size: ${form.orgSize}` : '',
      form.mediationVolume ? `Mediation / matter volume: ${form.mediationVolume}` : '',
      form.facilitatorCount ? `Facilitators available: ${form.facilitatorCount}` : '',
      form.participants ? `Estimated participants: ${form.participants}` : '',
      form.region ? `Region / geography: ${form.region}` : '',
      form.sensitivity ? `Sensitivity level: ${form.sensitivity}` : '',
      form.publicRecord ? `Public record may be needed: ${form.publicRecord}` : '',
      form.timeframe ? `Desired pilot timeframe: ${form.timeframe}` : '',
      form.phone ? `Contact phone: ${form.phone}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await submit({
      full_name: form.name,
      organisation: form.organisation || undefined,
      email: form.email,
      use_case: form.matterType || form.orgType,
      description: detailBlock,
    });
  }

  if (submitted) {
    return (
      <div className="sr-form-atmosphere flex min-h-[70vh] items-start py-20">
        <div className={publicShellInnerClass}>
          <FormPanel
            className="max-w-lg"
            eyebrow="Intake"
            title="Thank you — submission received"
            description="A human reviews every application. Expect a response within 5–7 business days — not an automated approval or live status tracker."
            footer="We reduce exposure by design. We do not claim full platform zero-knowledge or Signal-grade E2E today."
          >
            <div className="space-y-4 text-sm text-ink-secondary">
              <div>
                <p className="m-0 font-medium text-ink">What happens next</p>
                <ol className="mt-2 mb-0 list-decimal space-y-1.5 pl-5">
                  <li>Manual fit and sensitivity review (typically 5–7 business days).</li>
                  <li>Possible request for a short briefing before any invitations.</li>
                  <li>Scoped next step if there is a clear pilot fit — or an honest decline.</li>
                </ol>
              </div>
              <div>
                <p className="m-0 font-medium text-ink">Possible outcomes</p>
                <ul className="mt-2 mb-0 list-disc space-y-1 pl-5">
                  <li>Additional diligence required</li>
                  <li>Briefing recommended before review</li>
                  <li>Not a fit at this stage</li>
                </ul>
              </div>
              <p className="m-0">
                Follow up:{' '}
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent('Pilot intake follow-up')}`}
                  className="text-brand underline-offset-4 hover:underline"
                >
                  {contactEmail}
                </a>
                . There is no self-serve status page for this intake.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className="btn-institutional btn-institutional--ghost">
                Return home
              </Link>
              <Link to="/briefings" className="btn-institutional btn-institutional--primary">
                Briefing overview
              </Link>
            </div>
          </FormPanel>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-form-atmosphere border-b border-line pb-20" data-page="request-access">
      <header className="scroll-mt-20 border-b border-line py-14 md:py-16" data-scroll-section>
        <div className={publicShellInnerClass}>
          <SectionLabel>Confidential pilot intake</SectionLabel>
          <h1 className="mt-3 max-w-2xl font-heading text-display font-semibold tracking-tight text-ink">
            Request pilot access
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Confidential application for facilitators and institutions preparing a governed written
            room. Manual review within 5–7 business days — co-designed pilot scope, not self-serve
            signup.
          </p>
          <p className="mt-3 max-w-2xl rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/40 px-3 py-2.5 text-sm leading-relaxed text-ink-secondary">
            We reduce exposure by design. We do not claim full platform zero-knowledge or
            Signal-grade E2E today — rooms are operator-readable. Details on{' '}
            <Link
              to="/security#reviewers"
              className="text-brand underline-offset-2 hover:underline"
            >
              Security
            </Link>
            .
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-faint">
            For foundations, NGOs, boards and executive teams, HR/ombuds offices, and peacebuilding
            facilitators. Need board or funder sign-off during review? Forward the{' '}
            <a
              href="/diligence/trust-diligence-packet.md"
              className="text-brand underline-offset-2 hover:underline"
              download
            >
              Trust &amp; Diligence Packet
            </a>
            . Investor materials are invite-only — see{' '}
            <Link to="/briefings" className="text-brand underline-offset-2 hover:underline">
              briefings
            </Link>
            .
          </p>
          <p className="mt-4 mb-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            {CTA.pilotStatusLine}
          </p>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12`}
      >
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="after-submit-heading">
            <h2 id="after-submit-heading" className="font-heading text-h3 font-semibold text-ink">
              What happens after submission
            </h2>
            <ol className="sr-form-step-cards">
              {AFTER_SUBMIT_STEPS.map((step, i) => (
                <li key={step.title} className="sr-form-step-card">
                  <p className="sr-form-step-card__index m-0">{String(i + 1).padStart(2, '0')}</p>
                  <p className="mt-2 mb-0 text-sm font-medium text-ink">{step.title}</p>
                  <p className="mt-1.5 m-0 text-sm leading-relaxed text-ink-secondary">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-4 m-0 text-sm text-ink-secondary">
              You may be asked for a short briefing before any invitations are issued.{' '}
              <Link to="/contact" className="text-brand underline-offset-4 hover:underline">
                Optional: request a briefing first
              </Link>
            </p>
          </section>

          <section aria-labelledby="fit-heading" className="sr-form-callout-grid">
            <div>
              <h2 id="fit-heading" className="m-0 text-sm font-semibold text-ink">
                Strong fit
              </h2>
              <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                {PILOT_FIT_STRONG.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="m-0 text-sm font-semibold text-ink">Not a fit</h3>
              <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                {PILOT_FIT_WEAK.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ink-faint"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <FormPanel
            eyebrow="Application"
            title="Pilot application"
            description="First-touch essentials only. Strong-fit / not-a-fit guidance above already prequalifies — volume and sensitivity details can wait for follow-up."
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-sm text-ink-secondary" aria-live="polite">
                Required sections:{' '}
                <span className="font-medium text-ink">
                  {completedSections} of {progressTotal} complete
                </span>
              </p>
              {draftRestored && formHasContent(form) ? (
                <p className="m-0 text-xs text-ink-faint" role="status">
                  Draft saved in this browser tab
                  <button
                    type="button"
                    className="ml-2 text-brand underline-offset-2 hover:underline"
                    onClick={() => {
                      clearDraft();
                      setForm({
                        ...EMPTY_FORM,
                        email: prefilledEmail,
                        orgType: trackDefaults?.orgType ?? '',
                        matterType: trackDefaults?.matterType ?? '',
                        buyerTrack: buyerTrack ?? '',
                      });
                      setDraftRestored(false);
                      setTouched({});
                      setAttempted(false);
                    }}
                  >
                    Clear draft
                  </button>
                </p>
              ) : null}
            </div>

            <FormProgress
              progress={completedSections / progressTotal}
              steps={FORM_SECTIONS.map((section, i) => ({
                id: section.id,
                label: section.label,
                complete: sectionStatus[i],
                active: !sectionStatus[i] && (i === 0 || sectionStatus[i - 1]),
              }))}
            />

            <form className="space-y-10" noValidate onSubmit={(e) => void handleSubmit(e)}>
              {error ? <FormAlert variant="error">{error}</FormAlert> : null}

              {trackDefaults ? (
                <FormAlert title="Applying under track">
                  <span className="font-medium text-ink">{trackDefaults.label}</span>
                </FormAlert>
              ) : null}

              {form.buyerTrack ? (
                <input type="hidden" name="buyerTrack" value={form.buyerTrack} readOnly />
              ) : null}

              <FormSection
                id="section-contact"
                title="Contact"
                index={1}
                complete={sectionComplete(contactKeys)}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="name"
                      label="Name"
                      error={fieldInvalid('name') ? 'Enter your name.' : undefined}
                    >
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={(e) => set('name', e.target.value)}
                        onBlur={() => markTouched('name')}
                      />
                    </FormField>
                    <FormField
                      id="organisation"
                      label="Organization"
                      error={fieldInvalid('organisation') ? 'Enter your organization.' : undefined}
                    >
                      <Input
                        id="organisation"
                        name="organisation"
                        autoComplete="organization"
                        required
                        value={form.organisation}
                        onChange={(e) => set('organisation', e.target.value)}
                        onBlur={() => markTouched('organisation')}
                      />
                    </FormField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="email"
                      label="Work email"
                      hint="Used only for intake review — not shared with other applicants."
                      error={fieldInvalid('email') ? 'Enter a work email.' : undefined}
                    >
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        onBlur={() => markTouched('email')}
                      />
                    </FormField>
                    <FormField id="phone" label="Contact phone" hint="Optional">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                      />
                    </FormField>
                  </div>
                  <FormField
                    id="role"
                    label="Role in process"
                    error={fieldInvalid('role') ? 'Select your role.' : undefined}
                  >
                    <Select
                      id="role"
                      name="role"
                      required
                      value={form.role}
                      onChange={(e) => set('role', e.target.value)}
                      onBlur={() => markTouched('role')}
                    >
                      <option value="">Select…</option>
                      {ROLE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </FormSection>

              <FormSection
                id="section-matter"
                title="Matter"
                index={2}
                complete={sectionComplete(matterKeys)}
              >
                <div className="space-y-4">
                  <FormField
                    id="matterType"
                    label="Matter type"
                    error={fieldInvalid('matterType') ? 'Select a matter type.' : undefined}
                  >
                    <Select
                      id="matterType"
                      name="matterType"
                      required
                      value={form.matterType}
                      onChange={(e) => set('matterType', e.target.value)}
                      onBlur={() => markTouched('matterType')}
                    >
                      <option value="">Select…</option>
                      {MATTER_TYPES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField
                    id="painPoints"
                    label="Why now — matter context"
                    hint="Briefly describe the situation, current tools, and what is breaking down."
                    error={
                      fieldInvalid('painPoints')
                        ? 'Briefly describe why you are requesting a pilot now.'
                        : undefined
                    }
                  >
                    <Textarea
                      id="painPoints"
                      name="painPoints"
                      required
                      rows={4}
                      value={form.painPoints}
                      onChange={(e) => set('painPoints', e.target.value)}
                      onBlur={() => markTouched('painPoints')}
                      placeholder="Matter context, constraints, and why a governed written room is needed."
                    />
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="participants"
                      label="Participants per room"
                      hint="Optional estimate for a typical pilot room."
                    >
                      <Input
                        id="participants"
                        name="participants"
                        value={form.participants}
                        onChange={(e) => set('participants', e.target.value)}
                        placeholder="e.g. 6–12"
                      />
                    </FormField>
                    <FormField id="timeframe" label="Pilot timeframe" hint="Optional">
                      <Select
                        id="timeframe"
                        name="timeframe"
                        value={form.timeframe}
                        onChange={(e) => set('timeframe', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {TIMEFRAMES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </div>
              </FormSection>

              <details id="section-additional" className="sr-form-details">
                <summary>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    Additional context
                    <span className="font-mono text-[length:var(--text-label)] font-normal uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                      Optional — for follow-up
                    </span>
                  </span>
                </summary>
                <div className="sr-form-details__body">
                  <p className="mt-0 mb-4 text-sm text-ink-secondary">
                    Volume, sensitivity, and facilitator capacity can wait for human review. Fill
                    only if useful now.
                  </p>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="orgType" label="Organization type">
                        <Select
                          id="orgType"
                          name="orgType"
                          value={form.orgType}
                          onChange={(e) => set('orgType', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {ORG_TYPES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField id="orgSize" label="Organization size">
                        <Select
                          id="orgSize"
                          name="orgSize"
                          value={form.orgSize}
                          onChange={(e) => set('orgSize', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {ORG_SIZES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="mediationVolume" label="Mediation / matter volume">
                        <Select
                          id="mediationVolume"
                          name="mediationVolume"
                          value={form.mediationVolume}
                          onChange={(e) => set('mediationVolume', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {MEDIATION_VOLUME.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField id="facilitatorCount" label="Facilitators available">
                        <Select
                          id="facilitatorCount"
                          name="facilitatorCount"
                          value={form.facilitatorCount}
                          onChange={(e) => set('facilitatorCount', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {FACILITATOR_COUNTS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField id="region" label="Region">
                        <Input
                          id="region"
                          name="region"
                          value={form.region}
                          onChange={(e) => set('region', e.target.value)}
                        />
                      </FormField>
                      <FormField id="sensitivity" label="Sensitivity level">
                        <Select
                          id="sensitivity"
                          name="sensitivity"
                          value={form.sensitivity}
                          onChange={(e) => set('sensitivity', e.target.value)}
                        >
                          <option value="">Select…</option>
                          {SENSITIVITY.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                    <FormField
                      id="publicRecord"
                      label="Public record needed?"
                      hint="Private anchored memos are the pilot default; public ledger is optional."
                    >
                      <Select
                        id="publicRecord"
                        name="publicRecord"
                        value={form.publicRecord}
                        onChange={(e) => set('publicRecord', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {PUBLIC_RECORD.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </div>
              </details>

              <div className="space-y-4 border-t border-line pt-6">
                <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                  Manual review only. No open invitations are issued before approval. Leaving this
                  page keeps a draft in this browser tab until you submit or clear it. During the
                  5–7 day window, share the{' '}
                  <a
                    href="/diligence/trust-diligence-packet.md"
                    className="text-brand underline-offset-2 hover:underline"
                    download
                  >
                    Trust &amp; Diligence Packet
                  </a>{' '}
                  with internal reviewers.
                </p>
                <button
                  type="submit"
                  className="btn-institutional btn-institutional--primary btn-institutional--block sm:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : CTA.primaryLabel}
                </button>
              </div>
            </form>
          </FormPanel>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="sr-form-panel !p-4 md:!p-5">
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-brand/80">
              Trust signals
            </p>
            <ul className="mt-3 m-0 list-none space-y-2 p-0" aria-label="Intake trust signals">
              {TRUST_RAIL.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm leading-snug text-ink-secondary"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_color-mix(in_oklch,var(--sr-primary)_18%,transparent)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 mb-0 text-xs leading-relaxed text-ink-faint">
              We reduce exposure by design. We do not claim full platform zero-knowledge or
              Signal-grade E2E today.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
