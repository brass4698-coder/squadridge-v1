import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { pilotCriteria } from '../../data/builtForDialogue';
import { Input } from '../ui/Input';

export function PilotAccessTeaser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ email: trimmed });
    navigate(`/request-access?${params.toString()}`);
  }

  return (
    <section
      className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
      aria-labelledby="pilot-access-heading"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <h2 id="pilot-access-heading" className="text-h2 text-ink">
            Request a pilot intake call.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Pilots are limited and reviewed directly. Start with your email — we&apos;ll follow up
            for the details.
          </p>
          <ul className="mt-6 flex flex-col gap-2">
            {pilotCriteria.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
                <span className="mt-0.5 shrink-0 text-brand" aria-hidden>
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-line bg-surface-elevated p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="pilot-email" className="text-sm font-medium text-ink">
              Work email
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="pilot-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@organisation.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1"
              />
              <button type="submit" className="btn-pill btn-pill--primary shrink-0 text-sm">
                Request access
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-ink-faint">
              We do not add applicants to marketing lists — your details are used only to review
              pilot fit.{' '}
              <Link to="/request-access" className="text-brand underline-offset-4 hover:underline">
                Prefer the full form?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
