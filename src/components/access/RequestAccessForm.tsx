// ============================================================
// RequestAccessForm — compact public intake form (no auth created)
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitAccessRequest } from '../../lib/accessRequests';
import { FormAlert } from '../ui/FormAlert';
import { FormField } from '../ui/FormField';
import { FormPanel } from '../ui/FormPanel';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export function RequestAccessForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [roleRequested, setRoleRequested] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      return;
    }

    setLoading(true);
    const result = await submitAccessRequest({
      full_name: fullName.trim(),
      email: email.trim(),
      organization: organization.trim() || undefined,
      role_requested: roleRequested || undefined,
      use_case: useCase.trim() || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Submission did not go through. Please try again in a moment.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <FormPanel
        eyebrow="Intake"
        title="Request received"
        description="A human reviews every application. We aim to reply within about one week — not an automated approval."
        footer="We reduce exposure by design. We do not claim full platform zero-knowledge or Signal-grade E2E today."
      >
        <FormAlert variant="success" title="Thank you">
          We will review your request and aim to reach out to{' '}
          <span className="font-medium text-ink">{email}</span> within about one week.
        </FormAlert>
        <div className="sr-form-actions mt-6">
          <Link to="/" className="btn-institutional btn-institutional--ghost">
            Return home
          </Link>
          <Link to="/briefings" className="btn-institutional btn-institutional--primary">
            Briefing overview
          </Link>
        </div>
      </FormPanel>
    );
  }

  return (
    <FormPanel
      eyebrow="Intake"
      title="Request access"
      description="Share contact details and intended use. Manual review only — no open signup."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
        {error ? <FormAlert variant="error">{error}</FormAlert> : null}

        <FormField
          id="full-name"
          label="Full name"
          error={attempted && !fullName.trim() ? 'Enter your name.' : undefined}
        >
          <Input
            id="full-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </FormField>

        <FormField
          id="access-email"
          label="Work email"
          hint="Used only for intake review."
          error={attempted && !email.trim() ? 'Enter a work email.' : undefined}
        >
          <Input
            id="access-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organization.org"
          />
        </FormField>

        <FormField id="organization" label="Organization" hint="Optional">
          <Input
            id="organization"
            type="text"
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </FormField>

        <FormField id="role-requested" label="Role requested" hint="Optional">
          <Select
            id="role-requested"
            value={roleRequested}
            onChange={(e) => setRoleRequested(e.target.value)}
          >
            <option value="">Select a role…</option>
            <option value="facilitator">Facilitator</option>
            <option value="mediator">Mediator</option>
            <option value="analyst">Analyst</option>
            <option value="participant">Participant</option>
            <option value="observer">Observer</option>
            <option value="institution_admin">Institution Admin</option>
          </Select>
        </FormField>

        <FormField
          id="use-case"
          label="How do you plan to use SquadRidge?"
          hint="Optional — matter class and facilitation context help review."
        >
          <Textarea
            id="use-case"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            rows={4}
            placeholder="Describe your intended use…"
          />
        </FormField>

        <div className="sr-form-actions pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-institutional btn-institutional--primary btn-institutional--block"
          >
            {loading ? 'Submitting…' : 'Request access'}
          </button>
          <Link
            to="/request-access"
            className="btn-institutional btn-institutional--ghost btn-institutional--block text-center"
          >
            Full pilot intake
          </Link>
        </div>
      </form>
    </FormPanel>
  );
}
