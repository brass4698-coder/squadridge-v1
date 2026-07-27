import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appRoutes } from '../../lib/appRoutes';

type Step = 'basics' | 'eligibility' | 'verification' | 'review';

const steps: { id: Step; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'verification', label: 'Verification' },
  { id: 'review', label: 'Review & Launch' },
];

type FormData = {
  title: string;
  description: string;
  maxParticipants: string;
  sessionDate: string;
  sessionTime: string;
  outcomeType: string;
  eligibilityNotes: string;
  requireOrgEmail: boolean;
  requireIdDoc: boolean;
  requireManualApproval: boolean;
  groundRules: string;
};

const initial: FormData = {
  title: '',
  description: '',
  maxParticipants: '12',
  sessionDate: '',
  sessionTime: '',
  outcomeType: 'joint-statement',
  eligibilityNotes: '',
  requireOrgEmail: true,
  requireIdDoc: false,
  requireManualApproval: true,
  groundRules: '',
};

export function SessionSetupPage() {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [launching, setLaunching] = useState(false);
  const navigate = useNavigate();

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(step: Step): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 'basics') {
      if (!form.title.trim()) e.title = 'Session title is required.';
      if (!form.sessionDate) e.sessionDate = 'Date is required.';
      if (!form.sessionTime) e.sessionTime = 'Time is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function advance() {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (!validateStep(currentStep)) return;
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
  }

  function back() {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].id);
  }

  function launch() {
    setLaunching(true);
    // Replace with real API call
    setTimeout(() => navigate(appRoutes.session('sess-new-001')), 1200);
  }

  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  const Field = ({
    id,
    label,
    hint,
    children,
  }: {
    id: string;
    label: string;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </label>
      {hint && (
        <p
          id={`${id}-hint`}
          className="mb-2 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {hint}
        </p>
      )}
      {children}
      {errors[id as keyof typeof errors] && (
        <p role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--color-danger)' }}>
          {errors[id as keyof typeof errors]}
        </p>
      )}
    </div>
  );

  const inputCls =
    'w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]';
  const inputStyle = (hasErr: boolean) => ({
    borderColor: hasErr ? 'var(--color-danger)' : 'var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="mb-1 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          New Session
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Configure your session before invitations go out.
        </p>
      </div>

      {/* Step progress */}
      <nav aria-label="Setup steps" className="mb-10">
        <ol className="flex items-center gap-0">
          {steps.map((step, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <li key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    if (done) setCurrentStep(step.id);
                  }}
                  disabled={!done && !active}
                  className="flex flex-col items-center gap-1"
                  aria-current={active ? 'step' : undefined}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: active
                        ? 'var(--color-accent)'
                        : done
                          ? 'var(--color-accent-light)'
                          : 'var(--color-border)',
                      color: active
                        ? '#fff'
                        : done
                          ? 'var(--color-accent)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className="hidden text-xs sm:block"
                    style={{
                      color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      fontWeight: active ? '500' : '400',
                    }}
                  >
                    {step.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className="mx-2 h-px flex-1"
                    style={{
                      backgroundColor: done ? 'var(--color-accent-light)' : 'var(--color-border)',
                      minWidth: '2rem',
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div
        className="rounded-lg border p-8"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {currentStep === 'basics' && (
          <div className="flex flex-col gap-6">
            <Field id="title" label="Session title">
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                aria-invalid={!!errors.title}
                className={inputCls}
                style={inputStyle(!!errors.title)}
                placeholder="e.g. Northern Watershed Consultation — Round 3"
              />
            </Field>

            <Field
              id="description"
              label="Description"
              hint="Optional internal note. Not shown to participants."
            >
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className={inputCls}
                style={{ ...inputStyle(false), resize: 'vertical' }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="sessionDate" label="Date">
                <input
                  id="sessionDate"
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => update('sessionDate', e.target.value)}
                  aria-invalid={!!errors.sessionDate}
                  className={inputCls}
                  style={inputStyle(!!errors.sessionDate)}
                />
              </Field>
              <Field id="sessionTime" label="Start time (your timezone)">
                <input
                  id="sessionTime"
                  type="time"
                  value={form.sessionTime}
                  onChange={(e) => update('sessionTime', e.target.value)}
                  aria-invalid={!!errors.sessionTime}
                  className={inputCls}
                  style={inputStyle(!!errors.sessionTime)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field id="maxParticipants" label="Max participants">
                <input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="12"
                  value={form.maxParticipants}
                  onChange={(e) => update('maxParticipants', e.target.value)}
                  className={inputCls}
                  style={inputStyle(false)}
                />
              </Field>
              <Field id="outcomeType" label="Outcome format">
                <select
                  id="outcomeType"
                  value={form.outcomeType}
                  onChange={(e) => update('outcomeType', e.target.value)}
                  className={inputCls}
                  style={inputStyle(false)}
                >
                  <option value="joint-statement">Joint Statement</option>
                  <option value="consensus-summary">Consensus Summary</option>
                  <option value="recommendation">Formal Recommendation</option>
                  <option value="working-principles">Working Principles</option>
                  <option value="no-outcome">No public outcome</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {currentStep === 'eligibility' && (
          <div className="flex flex-col gap-6">
            <Field
              id="eligibilityNotes"
              label="Eligibility criteria"
              hint="Describe who is eligible to participate. This is shown to invitees before they apply."
            >
              <textarea
                id="eligibilityNotes"
                rows={5}
                value={form.eligibilityNotes}
                onChange={(e) => update('eligibilityNotes', e.target.value)}
                className={inputCls}
                style={{ ...inputStyle(false), resize: 'vertical' }}
                placeholder="e.g. Eligible participants must be registered stakeholders in the northern watershed catchment area..."
              />
            </Field>

            <Field
              id="groundRules"
              label="Ground rules"
              hint="Shared with all participants before the session begins."
            >
              <textarea
                id="groundRules"
                rows={5}
                value={form.groundRules}
                onChange={(e) => update('groundRules', e.target.value)}
                className={inputCls}
                style={{ ...inputStyle(false), resize: 'vertical' }}
                placeholder="e.g. All participants agree to treat contributions as confidential until the outcome document is released..."
              />
            </Field>
          </div>
        )}

        {currentStep === 'verification' && (
          <div className="flex flex-col gap-5">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Select the verification steps each participant must complete before gaining access.
            </p>
            {[
              {
                key: 'requireOrgEmail' as const,
                label: 'Organisational email confirmation',
                description: 'Participant must verify an email at an approved domain.',
              },
              {
                key: 'requireIdDoc' as const,
                label: 'Identity document review',
                description:
                  'Participant must upload a government-issued ID for facilitator review.',
              },
              {
                key: 'requireManualApproval' as const,
                label: 'Facilitator manual approval',
                description:
                  'Each participant application is reviewed and approved by you before access is granted.',
              },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-start gap-4 rounded-lg border p-5 transition-colors"
                style={{
                  borderColor: form[opt.key] ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: form[opt.key]
                    ? 'var(--color-accent-light)'
                    : 'var(--color-surface)',
                }}
              >
                <input
                  type="checkbox"
                  checked={form[opt.key]}
                  onChange={(e) => update(opt.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {currentStep === 'review' && (
          <div className="flex flex-col gap-6">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Review your session configuration before launching.
            </p>
            {[
              { label: 'Title', value: form.title || '—' },
              {
                label: 'Date & time',
                value:
                  form.sessionDate && form.sessionTime
                    ? `${form.sessionDate} at ${form.sessionTime}`
                    : '—',
              },
              { label: 'Max participants', value: form.maxParticipants },
              { label: 'Outcome format', value: form.outcomeType },
              { label: 'Eligibility criteria', value: form.eligibilityNotes || 'None specified' },
              { label: 'Ground rules', value: form.groundRules || 'None specified' },
              {
                label: 'Verification',
                value:
                  [
                    form.requireOrgEmail ? 'Org email' : null,
                    form.requireIdDoc ? 'ID document' : null,
                    form.requireManualApproval ? 'Manual approval' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="border-b pb-4"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {row.label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={back}
          disabled={currentIdx === 0}
          className="rounded px-5 py-2.5 text-sm transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ← Back
        </button>

        {currentStep !== 'review' ? (
          <button
            onClick={advance}
            className="rounded px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={launch}
            disabled={launching}
            className="rounded px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {launching ? 'Launching…' : 'Launch Session'}
          </button>
        )}
      </div>
    </div>
  );
}
