import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-secondary">404</p>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-ink-secondary">
        The page you are looking for does not exist, has been moved, or is no longer available.
      </p>
      <Link
        to="/"
        className="text-sm font-medium text-brand underline transition-opacity hover:opacity-70"
      >
        Return to home
      </Link>
    </div>
  );
}
