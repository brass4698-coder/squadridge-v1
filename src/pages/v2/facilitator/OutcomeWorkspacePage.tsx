import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { appRoutes } from '../../../lib/appRoutes';

export function OutcomeWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    summary: '',
    agreedTerms: '',
    pendingItems: '',
    facilitatorNotes: '',
  });
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
  }

  async function handleSubmitForRelease() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    navigate(appRoutes.sessionRelease(sessionId ?? ''));
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
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Session {sessionId}
          </p>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Outcome workspace
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Draft the outcome document. Once submitted for release, all parties will be notified to
            review and approve.
          </p>
        </div>

        {/* Confidentiality notice */}
        <div
          className="mb-6 rounded border-l-4 px-4 py-3 text-xs"
          style={{
            borderColor: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent-light)',
            color: 'var(--color-accent)',
          }}
        >
          This document is private until all parties approve release. Session room content will
          never be published.
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label className={labelClass} style={labelStyle}>
              Outcome summary <span aria-hidden>*</span>
            </label>
            <textarea
              required
              rows={4}
              className={inputClass}
              style={inputStyle}
              placeholder="Summarise the outcome reached in plain language…"
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>
              Agreed terms
            </label>
            <textarea
              rows={5}
              className={inputClass}
              style={inputStyle}
              placeholder="List the specific terms, commitments, or agreements reached…"
              value={form.agreedTerms}
              onChange={(e) => set('agreedTerms', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>
              Pending or unresolved items
            </label>
            <textarea
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder="Any items deferred or not resolved in this session…"
              value={form.pendingItems}
              onChange={(e) => set('pendingItems', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>
              Facilitator notes (internal only)
            </label>
            <textarea
              rows={3}
              className={inputClass}
              style={inputStyle}
              placeholder="Notes for the facilitation record. Not visible to participants or the public ledger."
              value={form.facilitatorNotes}
              onChange={(e) => set('facilitatorNotes', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 rounded border py-3 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmitForRelease}
              disabled={!form.summary || saving}
              className="flex-1 rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Submit for release
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  );
}
