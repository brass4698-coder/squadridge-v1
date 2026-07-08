import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { useSessions } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';
import {
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

export function SessionNewPage() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const [templateId, setTemplateId] = useState<SessionTemplateId | ''>('');
  const [form, setForm] = useState({
    title: '',
    conflictType: '',
    language: 'English',
    maxParticipants: '2',
    eligibilityNotes: '',
    outcomePublic: false,
    identityVerification: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: SessionTemplateId) {
    const template = getSessionTemplate(id);
    if (!template) return;
    setTemplateId(id);
    setForm({
      title: '',
      conflictType: template.conflictType,
      language: template.language,
      maxParticipants: String(template.maxParticipants),
      eligibilityNotes: template.eligibilityNotes,
      outcomePublic: template.outcomePublic,
      identityVerification: template.identityVerification,
    });
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
            Start from a template (optional)
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {SESSION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="rounded-lg border p-4 text-left transition-colors"
                style={{
                  borderColor:
                    templateId === template.id ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {template.label}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {template.audience}
                </p>
              </button>
            ))}
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
              placeholder="e.g. Land boundary dispute — March 2026"
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

              {/* Outcome public */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
                  checked={form.outcomePublic}
                  onChange={(e) => set('outcomePublic', e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Publish outcome to public ledger
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    The approved outcome text will be visible at /ledger. Participant identities
                    remain private.
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
