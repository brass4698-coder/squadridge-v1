import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { FormPanel } from '../../components/ui/FormPanel';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useAccessRequest } from '../../hooks/useAccessRequest';
import { CTA, PILOT_FIT_STRONG, PILOT_FIT_WEAK } from '../../data/siteMessaging';
import { BUYER_TRACK_INTAKE, type BuyerTrackParam } from '../../data/useCases';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { SectionLabel } from '../../components/SectionLabel';
import { cn } from '../../lib/cn';

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
  { id: 'matter', label: 'Matter context' },
  { id: 'scope', label: 'Pilot scope' },
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
  matterType: string;
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
  'orgType',
  'matterType',
  'participants',
  'region',
  'sensitivity',
  'publicRecord',
  'timeframe',
  'painPoints',
];

/**
 * Institutional pilot intake console.
 */
export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email')?.trim() ?? '';
  const buyerTrack = resolveBuyerTrack(searchParams.get('track'));
  const trackDefaults = buyerTrack ? BUYER_TRACK_INTAKE[buyerTrack] : null;
  const { submit, loading, error, submitted } = useAccessRequest();
  const [form, setForm] = useState<FormState>({
    name: '',
    organisation: '',
    email: prefilledEmail,
    role: '',
    orgType: trackDefaults?.orgType ?? '',
    matterType: trackDefaults?.matterType ?? '',
    participants: '',
    region: '',
    sensitivity: '',
    publicRecord: '',
    painPoints: '',
    timeframe: '',
    phone: '',
    buyerTrack: buyerTrack ?? '',
  });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

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
  const matterKeys: FormKey[] = ['orgType', 'matterType', 'participants', 'region', 'sensitivity'];
  const scopeKeys: FormKey[] = ['publicRecord', 'timeframe', 'painPoints'];

  const sectionStatus = [
    sectionComplete(contactKeys),
    sectionComplete(matterKeys),
    sectionComplete(scopeKeys),
  ];

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
      `Organization type: ${form.orgType}`,
      `Matter type: ${form.matterType}`,
      `Estimated participants: ${form.participants}`,
      `Region / geography: ${form.region}`,
      `Sensitivity level: ${form.sensitivity}`,
      `Public record may be needed: ${form.publicRecord}`,
      `Desired pilot timeframe: ${form.timeframe}`,
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
            title="Submission received"
            description="Manual review. Expect a response within 5–7 business days — not an automated approval."
            footer="We reduce exposure by design. We do not claim full platform zero-knowledge or Signal-grade E2E today."
          >
            <div className="space-y-3 text-sm text-ink-secondary">
              <p className="m-0 font-medium text-ink">Possible next steps from the review team</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                <li>Additional diligence required</li>
                <li>Briefing recommended before review</li>
                <li>Not a fit at this stage</li>
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className="btn-institutional btn-institutional--ghost">
                Return home
              </Link>
              <Link to="/contact" className="btn-institutional btn-institutional--primary">
                Request briefing
              </Link>
            </div>
          </FormPanel>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-form-atmosphere border-b border-line pb-20">
      <header className="scroll-mt-20 border-b border-line py-14 md:py-16" data-scroll-section>
        <div className={publicShellInnerClass}>
          <SectionLabel>Confidential pilot intake</SectionLabel>
          <h1 className="mt-3 max-w-2xl font-display text-display font-medium tracking-tight text-ink">
            Request pilot access
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            Confidential application for facilitators and institutions preparing a governed written
            room. Manual review within 5–7 business days — co-designed pilot scope, not self-serve
            signup.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-faint">
            For foundations, NGOs, boards and executive teams, HR/ombuds offices, and peacebuilding
            facilitators.
          </p>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12`}
      >
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="after-submit-heading">
            <h2 id="after-submit-heading" className="font-display text-h3 font-medium text-ink">
              What happens after submission
            </h2>
            <ol className="mt-4 m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
              {AFTER_SUBMIT_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2">
                  <span className="font-mono text-[length:var(--text-label)] text-ink-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="m-0 text-sm font-medium text-ink">{step.title}</p>
                    <p className="mt-1 m-0 text-sm leading-relaxed text-ink-secondary">
                      {step.body}
                    </p>
                  </div>
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

          <section
            aria-labelledby="fit-heading"
            className="rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/30 px-4 py-4 sm:px-5"
          >
            <h2 id="fit-heading" className="text-sm font-semibold text-ink">
              Fit guidance
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="m-0 text-xs font-medium text-ink-secondary">Strong fit</h3>
                <ul className="mt-2 m-0 list-none space-y-1.5 p-0 text-sm text-ink-secondary">
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
                <h3 className="m-0 text-xs font-medium text-ink-secondary">Not a fit</h3>
                <ul className="mt-2 m-0 list-none space-y-1.5 p-0 text-sm text-ink-secondary">
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
            </div>
          </section>

          <FormPanel
            eyebrow="Application"
            title="Pilot application"
            description="Share enough context for deliberate review. Fields marked optional can be left blank."
          >
            <nav aria-label="Application sections" className="mb-6">
              <ol className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-2 p-0 text-sm">
                {FORM_SECTIONS.map((section, i) => (
                  <li key={section.id} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span aria-hidden className="text-ink-faint">
                        /
                      </span>
                    ) : null}
                    <a
                      href={`#section-${section.id}`}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-ink-secondary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sr-primary)]',
                        sectionStatus[i] && 'text-ink',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'inline-block h-1.5 w-1.5 rounded-full',
                          sectionStatus[i] ? 'bg-brand' : 'bg-ink-faint',
                        )}
                      />
                      {section.label}
                      <span className="sr-only">
                        {sectionStatus[i] ? ', complete' : ', incomplete'}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <form className="space-y-8" noValidate onSubmit={(e) => void handleSubmit(e)}>
              {error ? (
                <p
                  className="rounded-[var(--sr-radius-md)] border border-sem-danger/40 bg-sem-danger-soft px-3 py-2 text-sm"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              {trackDefaults ? (
                <p className="m-0 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/40 px-3 py-2 text-sm text-ink-secondary">
                  Applying under:{' '}
                  <span className="font-medium text-ink">{trackDefaults.label}</span>
                </p>
              ) : null}

              {form.buyerTrack ? (
                <input type="hidden" name="buyerTrack" value={form.buyerTrack} readOnly />
              ) : null}

              <fieldset id="section-contact" className="m-0 min-w-0 border-0 p-0">
                <legend className="mb-4 w-full border-b border-line pb-2 font-display text-base font-medium text-ink">
                  Contact
                </legend>
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
              </fieldset>

              <fieldset id="section-matter" className="m-0 min-w-0 border-0 p-0">
                <legend className="mb-4 w-full border-b border-line pb-2 font-display text-base font-medium text-ink">
                  Matter context
                </legend>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="orgType"
                      label="Organization type"
                      error={fieldInvalid('orgType') ? 'Select an organization type.' : undefined}
                    >
                      <Select
                        id="orgType"
                        name="orgType"
                        required
                        value={form.orgType}
                        onChange={(e) => set('orgType', e.target.value)}
                        onBlur={() => markTouched('orgType')}
                      >
                        <option value="">Select…</option>
                        {ORG_TYPES.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    </FormField>
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
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="participants"
                      label="Participants"
                      hint="Estimated number for the pilot room."
                      error={
                        fieldInvalid('participants') ? 'Enter estimated participants.' : undefined
                      }
                    >
                      <Input
                        id="participants"
                        name="participants"
                        required
                        value={form.participants}
                        onChange={(e) => set('participants', e.target.value)}
                        onBlur={() => markTouched('participants')}
                        placeholder="e.g. 6–12"
                      />
                    </FormField>
                    <FormField
                      id="region"
                      label="Region"
                      hint="Operating geography for the matter."
                      error={fieldInvalid('region') ? 'Enter a region.' : undefined}
                    >
                      <Input
                        id="region"
                        name="region"
                        required
                        value={form.region}
                        onChange={(e) => set('region', e.target.value)}
                        onBlur={() => markTouched('region')}
                      />
                    </FormField>
                  </div>
                  <FormField
                    id="sensitivity"
                    label="Sensitivity level"
                    hint="Helps reviewers scope diligence — not a public classification."
                    error={fieldInvalid('sensitivity') ? 'Select a sensitivity level.' : undefined}
                  >
                    <Select
                      id="sensitivity"
                      name="sensitivity"
                      required
                      value={form.sensitivity}
                      onChange={(e) => set('sensitivity', e.target.value)}
                      onBlur={() => markTouched('sensitivity')}
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
              </fieldset>

              <fieldset id="section-scope" className="m-0 min-w-0 border-0 p-0">
                <legend className="mb-4 w-full border-b border-line pb-2 font-display text-base font-medium text-ink">
                  Pilot scope
                </legend>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="publicRecord"
                      label="Public record needed?"
                      hint="Private anchored memos are the pilot default; public ledger is optional."
                      error={
                        fieldInvalid('publicRecord')
                          ? 'Indicate whether a public record may be needed.'
                          : undefined
                      }
                    >
                      <Select
                        id="publicRecord"
                        name="publicRecord"
                        required
                        value={form.publicRecord}
                        onChange={(e) => set('publicRecord', e.target.value)}
                        onBlur={() => markTouched('publicRecord')}
                      >
                        <option value="">Select…</option>
                        {PUBLIC_RECORD.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField
                      id="timeframe"
                      label="Pilot timeframe"
                      error={fieldInvalid('timeframe') ? 'Select a timeframe.' : undefined}
                    >
                      <Select
                        id="timeframe"
                        name="timeframe"
                        required
                        value={form.timeframe}
                        onChange={(e) => set('timeframe', e.target.value)}
                        onBlur={() => markTouched('timeframe')}
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
                  <FormField
                    id="painPoints"
                    label="Current tools or pain points"
                    error={
                      fieldInvalid('painPoints')
                        ? 'Briefly describe current tools or pain points.'
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
                      placeholder="Briefly describe your current workflow, constraints, or what is breaking down."
                    />
                  </FormField>
                </div>
              </fieldset>

              <div className="space-y-3 border-t border-line pt-6">
                <p className="m-0 text-sm leading-relaxed text-ink-secondary">
                  Manual review only. No open invitations are issued before approval.
                </p>
                <button
                  type="submit"
                  className="btn-institutional btn-institutional--primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : CTA.primaryLabel}
                </button>
              </div>
            </form>
          </FormPanel>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="m-0 text-xs font-medium text-ink-faint">Trust signals</p>
          <ul className="mt-2 m-0 list-none space-y-1.5 p-0" aria-label="Intake trust signals">
            {TRUST_RAIL.map((item) => (
              <li
                key={item}
                className="border-l-2 border-brand/40 pl-2.5 text-xs leading-snug text-ink-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            We reduce exposure by design. We do not claim full platform zero-knowledge or
            Signal-grade E2E today.
          </p>
        </aside>
      </div>
    </div>
  );
}
