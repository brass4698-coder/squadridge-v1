import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        404
      </p>
      <h1
        className="mb-3 text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Page not found
      </h1>
      <p
        className="mb-8 max-w-sm text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        The page you are looking for does not exist, has been moved, or is no longer available.
      </p>
      <Link
        to="/"
        className="text-sm font-medium underline transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-accent)' }}
      >
        Return to home
      </Link>
    </div>
  );
}
