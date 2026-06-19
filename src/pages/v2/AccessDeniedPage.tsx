import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <p
        className="mb-4 font-mono text-xs uppercase tracking-widest"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Access denied
      </p>
      <h1
        className="mb-4 text-4xl font-medium tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        You don't have access to this page.
      </h1>
      <p
        className="mb-10 max-w-md text-base leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        You may need to sign in, or your invitation may have expired. If you believe
        this is an error, contact the person who invited you or reach out to support.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/sign-in"
          className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Sign In →
        </Link>
        <Link
          to="/contact"
          className="text-sm underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Contact Support →
        </Link>
      </div>
    </div>
  );
}
