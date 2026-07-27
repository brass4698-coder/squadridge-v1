import { Component, createRef, type ErrorInfo, type ReactNode } from 'react';
import { captureBoundaryError, getErrorBoundaryCopy } from '../lib';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Outermost boundary (see `main.tsx`). Uses SquadRidge `--sr-*` tokens via Tailwind aliases.
 * Reports to Sentry via {@link captureBoundaryError} when Sentry initialized successfully.
 */
export class ErrorBoundary extends Component<Props, State> {
  private titleRef = createRef<HTMLHeadingElement>();

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    captureBoundaryError(error, info, { boundary: 'root' });
  }

  componentDidUpdate(_prevProps: Props, prevState: State): void {
    if (this.state.hasError && !prevState.hasError) {
      queueMicrotask(() => this.titleRef.current?.focus());
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const { error } = this.state;
      const copy = error ? getErrorBoundaryCopy(error) : null;
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center bg-surface p-8 text-center"
          role="alert"
          aria-labelledby="root-error-title"
          aria-describedby="root-error-desc"
        >
          <div className="w-full max-w-lg rounded-lg bg-surface-elevated p-8 shadow-sr-card">
            <p className="mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
              500
            </p>
            <h1
              id="root-error-title"
              ref={this.titleRef}
              tabIndex={-1}
              className="font-heading text-h2 font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {copy?.title ?? 'Something went wrong'}
            </h1>
            <p
              id="root-error-desc"
              className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-secondary"
            >
              {copy?.description ??
                'The app hit an unexpected error. Try again to remount the UI, or reload the page if the problem persists.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand px-6 font-heading text-sm font-semibold text-brand-on transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                onClick={this.handleRetry}
              >
                Try again
              </button>
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-line bg-transparent px-6 font-heading text-sm font-medium text-ink-secondary transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                Back to home
              </a>
            </div>
            {import.meta.env.DEV && error ? (
              <pre className="mt-6 max-h-48 overflow-auto rounded-md border border-line bg-surface-sunken p-4 text-left font-mono text-xs text-sem-warning">
                {error.stack ?? error.message}
              </pre>
            ) : null}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
