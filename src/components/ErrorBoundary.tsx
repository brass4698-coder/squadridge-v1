import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureBoundaryError } from '../lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Outermost boundary (see `main.tsx`). Uses SquadRidge tokens — not shadcn CSS variables (`text-muted-foreground`, etc.).
 * Reports to Sentry via {@link captureBoundaryError} when `VITE_SENTRY_DSN` is set.
 */
export class ErrorBoundary extends Component<Props, State> {
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

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const { error } = this.state;
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center bg-navy p-8 text-center"
          role="alert"
          aria-labelledby="root-error-title"
        >
          <div className="w-full max-w-lg rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <h1 id="root-error-title" className="font-heading text-fluid-h2 text-gray-light">
              Something went wrong
            </h1>
            <p className="mt-3 max-w-md font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
              The app hit an unexpected error. Try again to remount the UI, or reload the page if the problem persists.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center border-0 bg-teal px-6 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity duration-150 hover:opacity-[0.88]"
                style={{ borderRadius: 8 }}
                onClick={this.handleRetry}
              >
                Try again
              </button>
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-6 font-heading text-[0.95rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63]"
                style={{ borderRadius: 8 }}
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
            {import.meta.env.DEV && error ? (
              <pre className="mt-6 max-h-48 overflow-auto rounded-md border border-[#1a2236] bg-[#0b0f1a] p-4 text-left font-mono text-[0.75rem] text-amber">
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
