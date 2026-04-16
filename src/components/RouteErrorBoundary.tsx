import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { captureBoundaryError } from '../lib/sentry';

interface Props {
  children: ReactNode;
  /** e.g. TanStack Query `reset` so retried renders can refetch */
  onRetry?: () => void;
  /**
   * When true, render inside `AppLayout`’s `<main>` (single page landmark): no nested `<main>`,
   * slightly tighter vertical space so nav/footer stay visible.
   */
  embedded?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in the route tree so a failed route does not leave a blank screen.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
    captureBoundaryError(error, info, { boundary: 'route' });
  }

  private handleRetry = (): void => {
    this.props.onRetry?.();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { error, hasError } = this.state;
    const { embedded } = this.props;

    if (hasError && error) {
      const shellClassName = embedded
        ? 'mx-auto flex w-full max-w-lg flex-col justify-center gap-6 py-8'
        : 'mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center gap-6 px-6 py-16';

      const inner = (
          <div className="rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <h1 id="route-error-title" className="font-heading text-fluid-h2 text-gray-light">
              Something went wrong
            </h1>
            <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
              The app hit an unexpected error. Your session data is not shown here for safety. You can try again or
              return home.
            </p>
            {import.meta.env.DEV ? (
              <pre className="mt-4 max-h-32 overflow-auto rounded-md border border-[#1a2236] bg-[#0b0f1a] p-3 font-mono text-[0.75rem] text-amber">
                {error.message}
              </pre>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
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
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-[0.95rem] font-medium text-teal underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
      );

      if (embedded) {
        return (
          <section className={shellClassName} role="alert" aria-labelledby="route-error-title">
            {inner}
          </section>
        );
      }

      return (
        <main className={shellClassName} role="alert" aria-labelledby="route-error-title">
          {inner}
        </main>
      );
    }

    return this.props.children;
  }
}
