import { Component, createRef, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { captureBoundaryError } from '../lib';

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
 * Branded with `--sr-*` tokens (Tailwind aliases) — matches AccessDenied / NotFound.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  private titleRef = createRef<HTMLHeadingElement>();

  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
    captureBoundaryError(error, info, { boundary: 'route' });
  }

  componentDidUpdate(_prevProps: Props, prevState: State): void {
    if (this.state.hasError && !prevState.hasError) {
      queueMicrotask(() => this.titleRef.current?.focus());
    }
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

      const alertBlock = (
        <div role="alert" aria-labelledby="route-error-title" aria-describedby="route-error-desc">
          <div className="rounded-lg bg-surface-elevated p-8 shadow-sr-card">
            <p className="mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
              500
            </p>
            <h1
              id="route-error-title"
              ref={this.titleRef}
              tabIndex={-1}
              className="font-heading text-h2 font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Something went wrong
            </h1>
            <p
              id="route-error-desc"
              className="mt-3 font-sans text-sm leading-relaxed text-ink-secondary"
            >
              The app hit an unexpected error. Your session data is not shown here for safety. You
              can try again or return home.
            </p>
            {import.meta.env.DEV ? (
              <pre className="mt-4 max-h-32 overflow-auto rounded-md border border-line bg-surface-sunken p-3 font-mono text-xs text-sem-warning">
                {error.message}
              </pre>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
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
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      );

      if (embedded) {
        return <div className={shellClassName}>{alertBlock}</div>;
      }

      return <main className={shellClassName}>{alertBlock}</main>;
    }

    return this.props.children;
  }
}
