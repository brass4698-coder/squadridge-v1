// ============================================================
// RequestAccessForm — public intake form (no auth created)
// ============================================================
import React, { useState } from 'react';
import { submitAccessRequest } from '../../lib/accessRequests';

export function RequestAccessForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [roleRequested, setRoleRequested] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await submitAccessRequest({
      full_name: fullName,
      email,
      organization: organization || undefined,
      role_requested: roleRequested || undefined,
      use_case: useCase || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Submission failed. Please try again.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-sq-border bg-sq-surface p-6 text-center space-y-3">
        <div className="text-3xl" aria-hidden>&#10003;</div>
        <h2 className="text-lg font-semibold text-sq-text">Request Received</h2>
        <p className="text-sq-muted text-sm">
          Thank you, {fullName}. Our team will review your request and reach out
          to <strong>{email}</strong> within 2–4 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full-name" className="block text-sm font-medium text-sq-text mb-1">Full Name *</label>
        <input
          id="full-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="input-field w-full"
        />
      </div>

      <div>
        <label htmlFor="access-email" className="block text-sm font-medium text-sq-text mb-1">Email *</label>
        <input
          id="access-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field w-full"
        />
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-sq-text mb-1">Organization</label>
        <input
          id="organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="input-field w-full"
        />
      </div>

      <div>
        <label htmlFor="role-requested" className="block text-sm font-medium text-sq-text mb-1">Role Requested</label>
        <select
          id="role-requested"
          value={roleRequested}
          onChange={(e) => setRoleRequested(e.target.value)}
          className="input-field w-full"
        >
          <option value="">Select a role…</option>
          <option value="facilitator">Facilitator</option>
          <option value="mediator">Mediator</option>
          <option value="analyst">Analyst</option>
          <option value="participant">Participant</option>
          <option value="observer">Observer</option>
          <option value="institution_admin">Institution Admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="use-case" className="block text-sm font-medium text-sq-text mb-1">How do you plan to use SquadRidge?</label>
        <textarea
          id="use-case"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          rows={4}
          className="input-field w-full"
          placeholder="Describe your intended use case…"
        />
      </div>

      {error && <p role="alert" className="text-sq-error text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Submitting…' : 'Request Access'}
      </button>
    </form>
  );
}
