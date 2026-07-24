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

const TRUST_RAIL = [
  'Manual review',
  'Invite-only pilot',
  'Role-scoped access',
  'No open self-serve deployment',
  '5–7 business day response',
] as const;

/**
 * Institutional pilot intake console.
 */
export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email')?.trim() ?? '';
  const buyerTrack = resolveBuyerTrack(searchParams.get('track'));
  const trackDefaults = buyerTrack ? BUYER_TRACK_INTAKE[buyerTrack] : null;
  const { submit, loading, error, submitted } = useAccessRequest();
  const [form, setForm] = useState({
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

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            Confidential application for facilitators and institutions. Manual review within 5–7
            business days — co-designed pilot scope, not self-serve signup.
          </p>
        </div>
      </header>

      <div
        className={`${publicShellInnerClass} mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16`}
      >
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="font-display text-h3 font-medium text-ink">Who this is for</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Foundations, NGOs, boards and executive teams, HR/ombuds offices, and peacebuilding
              facilitators preparing a governed written room with optional public or private
              anchored release.
            </p>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">Strong fit</h3>
              <ul className="mt-3 m-0 list-none space-y-2.5 p-0 text-sm text-ink-secondary">
                {PILOT_FIT_STRONG.map((item) => (
                  <li key={item} className="flex gap-2.5">
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
              <h3 className="text-sm font-semibold text-ink">Likely not a fit</h3>
              <ul className="mt-3 m-0 list-none space-y-2.5 p-0 text-sm text-ink-secondary">
                {PILOT_FIT_WEAK.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-h3 font-medium text-ink">How intake works</h2>
            <ol className="mt-4 m-0 list-none space-y-4 p-0">
              {[
                'Submit this application with matter context and sensitivity.',
                'Manual diligence conversation within 5–7 business days.',
                'Co-designed pilot scope and role-scoped invitations — no open deployment.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-ink-secondary">
                  <span className="font-mono text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <FormPanel
            eyebrow="Application"
            title="Pilot application"
            description="Share matter context and sensitivity so review can stay deliberate."
            footer="A human reviews fit before any invitations are issued."
          >
            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
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
                  Prefilling for <span className="font-medium text-ink">{trackDefaults.label}</span>{' '}
                  track.
                </p>
              ) : null}
              {form.buyerTrack ? (
                <input type="hidden" name="buyerTrack" value={form.buyerTrack} readOnly />
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="name" label="Name" instrument>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </FormField>
                <FormField id="organisation" label="Organization" instrument>
                  <Input
                    id="organisation"
                    required
                    value={form.organisation}
                    onChange={(e) => set('organisation', e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="email"
                  label="Work email"
                  hint="Used only for intake review — not shared with other applicants."
                  instrument
                >
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </FormField>
                <FormField id="phone" label="Contact phone (optional)" instrument>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </FormField>
              </div>
              <FormField id="role" label="Role in process" instrument>
                <Select
                  id="role"
                  required
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                >
                  <option value="">Select…</option>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="orgType" label="Organization type" instrument>
                  <Select
                    id="orgType"
                    required
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
                <FormField id="matterType" label="Matter type / use case" instrument>
                  <Select
                    id="matterType"
                    required
                    value={form.matterType}
                    onChange={(e) => set('matterType', e.target.value)}
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
                <FormField id="participants" label="Estimated participants" instrument>
                  <Input
                    id="participants"
                    required
                    value={form.participants}
                    onChange={(e) => set('participants', e.target.value)}
                    placeholder="e.g. 6–12"
                  />
                </FormField>
                <FormField id="region" label="Region / operating geography" instrument>
                  <Input
                    id="region"
                    required
                    value={form.region}
                    onChange={(e) => set('region', e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="sensitivity"
                  label="Sensitivity level"
                  hint="Helps reviewers scope diligence — not a public classification."
                  instrument
                >
                  <Select
                    id="sensitivity"
                    required
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
                <FormField
                  id="publicRecord"
                  label="Whether a public record may be needed"
                  hint="Private anchored memos are the pilot default; public ledger is optional."
                  instrument
                >
                  <Select
                    id="publicRecord"
                    required
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
              <FormField id="timeframe" label="Desired pilot timeframe" instrument>
                <Select
                  id="timeframe"
                  required
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
              <FormField id="pain" label="Current tools or process pain points" instrument>
                <Textarea
                  id="pain"
                  required
                  rows={4}
                  value={form.painPoints}
                  onChange={(e) => set('painPoints', e.target.value)}
                />
              </FormField>
              <button
                type="submit"
                className="btn-institutional btn-institutional--primary"
                disabled={loading}
              >
                {loading ? 'Submitting…' : CTA.primaryLabel}
              </button>
            </form>
          </FormPanel>

          <section>
            <h2 className="font-display text-h3 font-medium text-ink">
              What happens after submission
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              A human reviews fit, sensitivity, and whether a public record path is appropriate. You
              may be asked for a short briefing before any invitations are issued.
            </p>
            <Link to="/contact" className="mt-4 inline-flex text-sm text-brand">
              Optional: request a briefing first →
            </Link>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Trust rail
          </p>
          <ul
            className="sr-evidence-rail mt-3 m-0 list-none space-y-2 p-0"
            aria-label="Intake trust signals"
          >
            {TRUST_RAIL.map((item) => (
              <li
                key={item}
                className="rounded-[var(--sr-radius-sm)] border border-line bg-surface-sunken/80 px-3 py-2 font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em] text-ink-secondary"
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
