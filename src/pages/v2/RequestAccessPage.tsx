import { useState } from 'react';

const USE_CASE_OPTIONS = [
  'Mediator / dispute resolution professional',
  'Government or public institution',
  'NGO / civil society organisation',
  'Peace-tech or conflict-tech researcher',
  'Academic institution',
  'Legal professional',
  'Journalist / documentarian',
  'Other',
];

export function RequestAccessPage() {
  const [form, setForm] = useState({
    name: '',
    organisation: '',
    email: '',
    useCase: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: Supabase insert in Phase 7
    await new Promise((r) => setTimeout(r, 700));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Request received</h1>
        <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          We review all pilot applications manually. You will hear from us within 5–7 business days.
        </p>
      </div>
    );
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
    <div
      className="mx-auto max-w-xl px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Pilot access</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Request access</h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          MENDguild is currently in a closed pilot. Tell us about your use case and we will be in touch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={labelStyle}>Full name <span aria-hidden>*</span></label>
            <input required className={inputClass} style={inputStyle} placeholder="Jane Smith" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Organisation</label>
            <input className={inputClass} style={inputStyle} placeholder="Optional" value={form.organisation} onChange={(e) => set('organisation', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Work email <span aria-hidden>*</span></label>
          <input required type="email" className={inputClass} style={inputStyle} placeholder="jane@organisation.org" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Primary use case <span aria-hidden>*</span></label>
          <select required className={inputClass} style={inputStyle} value={form.useCase} onChange={(e) => set('useCase', e.target.value)}>
            <option value="">Select…</option>
            {USE_CASE_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Brief description <span aria-hidden>*</span></label>
          <textarea
            required
            rows={4}
            className={inputClass}
            style={inputStyle}
            placeholder="Describe the conflict context you work in and how you would use MENDguild…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {saving ? 'Submitting…' : 'Submit request'}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          We review all applications manually. Your information is kept confidential.
        </p>
      </form>
    </div>
  );
}
