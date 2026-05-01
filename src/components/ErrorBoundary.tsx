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
 * Outermost boundary (see `main.tsx`). Uses SquadRidge tokens — not shadcn CSS variables (`text-muted-foreground`, etc.).
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
          className="flex min-h-screen flex-col items-center justify-center bg-navy p-8 text-center"
          role="alert"
          aria-labelledby="root-error-title"
          aria-describedby="root-error-desc"
        >
          <div className="w-full max-w-lg rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <h1
              id="root-error-title"
              ref={this.titleRef}
              tabIndex={-1}
              className="font-heading text-fluid-h2 text-gray-light outline-none focus-visible:ring-2 focus-visible:ring-teal/60"
            >
              {copy?.title ?? 'Something went wrong'}
            </h1>
            <p
              id="root-error-desc"
              className="mt-3 max-w-md font-sans text-[0.95rem] leading-relaxed text-[#8892a4]"
            >
              {copy?.description ??
                'The app hit an unexpected error. Try again to remount the UI, or reload the page if the problem persists.'}
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
            <nav
              aria-label="Fallback trust links"
              className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-sans text-[0.86rem]"
            >
              <a className="text-teal underline-offset-4 hover:underline" href="/">
                Home
              </a>
              <a className="text-teal underline-offset-4 hover:underline" href="/trust">
                Trust &amp; Safety
              </a>
              <a className="text-teal underline-offset-4 hover:underline" href="/security">
                Security Disclosure
              </a>
            </nav>
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
