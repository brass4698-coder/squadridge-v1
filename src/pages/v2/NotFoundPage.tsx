import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <p
        className="mb-4 font-mono text-xs uppercase tracking-widest"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        404
      </p>
      <h1
        className="mb-4 text-4xl font-medium tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        This page doesn't exist.
      </h1>
      <p
        className="mb-10 max-w-sm text-base"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        The address you followed may have changed or the content may have been removed.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/"
          className="rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Return to Home →
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
