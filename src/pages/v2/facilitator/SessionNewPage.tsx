import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { useSessions } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';
import {
  DEFAULT_PILOT_TEMPLATE_ID,
  SESSION_TEMPLATES,
  getSessionTemplate,
  type SessionTemplateId,
} from '../../../lib/sessionTemplates';

const CONFLICT_TYPES = [
  'Labour / employment',
  'Land & property',
  'Commercial / contractual',
  'Community & civic',
  'Family & interpersonal',
  'Environmental',
  'Political / governance',
  'Other',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Arabic',
  'French',
  'Spanish',
  'Mandarin',
  'Swahili',
  'Portuguese',
  'Russian',
  'Hindi',
  'Other',
];

function formFromTemplate(id: SessionTemplateId) {
  const template = getSessionTemplate(id);
  if (!template) {
    return {
      title: '',
      conflictType: '',
      language: 'English',
      maxParticipants: '2',
      eligibilityNotes: '',
      outcomePublic: false,
      identityVerification: true,
    };
  }
  return {
    title: '',
    conflictType: template.conflictType,
    language: template.language,
    maxParticipants: String(template.maxParticipants),
    eligibilityNotes: template.eligibilityNotes,
    outcomePublic: template.outcomePublic,
    identityVerification: template.identityVerification,
  };
}

export function SessionNewPage() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const [templateId, setTemplateId] = useState<SessionTemplateId>(DEFAULT_PILOT_TEMPLATE_ID);
  const [form, setForm] = useState(() => formFromTemplate(DEFAULT_PILOT_TEMPLATE_ID));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: SessionTemplateId) {
    const template = getSessionTemplate(id);
    if (!template || template.pilotFocus === 'deferred') return;
    setTemplateId(id);
    setForm(formFromTemplate(id));
  }

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const template = templateId ? getSessionTemplate(templateId) : undefined;
      const row = await createSession({
        title: form.title,
        conflict_type: form.conflictType,
        language: form.language,
        max_participants: parseInt(form.maxParticipants, 10) || 2,
        eligibility_notes: form.eligibilityNotes || null,
        identity_verification_required: form.identityVerification,
        outcome_public: form.outcomePublic,
        status: 'setup',
        template_id: templateId || null,
        setup_config: template?.setupConfig ?? {},
      });
      navigate(appRoutes.sessionInvite(row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create session');
      setSaving(false);
    }
  }

  const inputClass = 'w-full rounded border px-3 py-2.5 text-sm outline-none focus:ring-2';
  const inputStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };
  const labelClass = 'mb-1.5 block text-xs font-medium';
  const labelStyle = { color: 'var(--color-text-secondary)' };

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            New session
          </p>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Configure session
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Set eligibility criteria and session parameters before inviting participants.
          </p>
        </div>

        <div className="mb-8">
          <p className={labelClass} style={labelStyle}>
            Session template
          </p>
          <p className="mb-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Pilot default: NGO internal deliberation with a private anchored decision memo. Public
            ledger publish is optional.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {SESSION_TEMPLATES.map((template) => {
              const deferred = template.pilotFocus === 'deferred';
              const selected = templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={deferred}
                  onClick={() => applyTemplate(template.id)}
                  aria-disabled={deferred}
                  title={
                    deferred
                      ? 'Not pilot focus — available after first private releases'
                      : undefined
                  }
                  className="rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {template.label}
                    </p>
                    {template.pilotFocus === 'primary' ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        Pilot default
                      </span>
                    ) : null}
                    {deferred ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-secondary">
                        Later
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {deferred
                      ? 'Not pilot focus. Use NGO deliberation or community mediation for first runs.'
                      : template.audience}
                  </p>
                  {!deferred && !template.outcomePublic ? (
                    <p className="mt-2 text-xs text-brand">Private anchored outcome by default</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className={labelClass} style={labelStyle}>
              Session title <span aria-hidden>*</span>
            </label>
            <input
              required
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. Q1 community safety coordination — March 2026"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Conflict type */}
          <div>
            <label className={labelClass} style={labelStyle}>
              Conflict type <span aria-hidden>*</span>
            </label>
            <select
              required
              className={inputClass}
              style={inputStyle}
              value={form.conflictType}
              onChange={(e) => set('conflictType', e.target.value)}
            >
              <option value="">Select…</option>
              {CONFLICT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className={labelClass} style={labelStyle}>
              Primary language
            </label>
            <select
              className={inputClass}
              style={inputStyle}
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Max participants */}
          <div>
            <label className={labelClass} style={labelStyle}>
              Maximum participants
            </label>
            <input
              type="number"
              min={2}
              max={10}
              className={inputClass}
              style={inputStyle}
              value={form.maxParticipants}
              onChange={(e) => set('maxParticipants', e.target.value)}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Recommended: 2–4 for structured dialogue.
            </p>
          </div>

          {/* Eligibility notes */}
          <div>
            <label className={labelClass} style={labelStyle}>
              Eligibility notes (internal)
            </label>
            <textarea
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder="Any screening criteria or context notes for this session…"
              value={form.eligibilityNotes}
              onChange={(e) => set('eligibilityNotes', e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Session policies
            </p>
            <div className="flex flex-col gap-4">
              {/* Identity verification */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
                  checked={form.identityVerification}
                  onChange={(e) => set('identityVerification', e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Require identity verification
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Participants must complete document upload before entering the room.
                  </p>
                </div>
              </label>

              {/* Outcome public — off by default for NGO pilot */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
                  checked={form.outcomePublic}
                  onChange={(e) => set('outcomePublic', e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Also publish to the public ledger
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Leave unchecked for a private partner-shared anchored record (recommended for
                    first pilots). When checked, approved outcome text appears at /ledger —
                    identities stay private either way.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error ? (
            <p className="text-sm" style={{ color: 'var(--color-danger)' }} role="alert">
              {error}
            </p>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(appRoutes.sessions)}
              className="flex-1 rounded border py-3 text-sm font-medium transition-opacity hover:opacity-70"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {saving ? 'Creating…' : 'Create session'}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedShell>
  );
}
