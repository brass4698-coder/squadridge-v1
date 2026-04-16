import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { captureBoundaryError, setSentrySquadContext } from '../../lib/sentry';

interface Props {
  children: ReactNode;
  squadId?: string;
  userId?: string | null;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Isolates chat/message UI failures so the rest of the shell can stay usable.
 */
export class SessionFeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const { squadId, userId } = this.props;
    if (squadId) setSentrySquadContext(squadId);
    captureBoundaryError(error, info, { squadId, userId, boundary: 'session' });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { error, hasError } = this.state;

    if (hasError && error) {
      return (
        <div
          className="rounded-[10px] border border-amber/40 bg-[#1a1408] px-6 py-8 font-sans text-[0.9rem] leading-relaxed text-[#f5d7a3]"
          role="alert"
          aria-labelledby="session-feature-error-title"
        >
          <h2 id="session-feature-error-title" className="font-heading text-[1.1rem] font-semibold text-[#f5d7a3]">
            Chat could not load
          </h2>
          <p className="mt-3 text-[#c4a574]">
            Something broke while showing messages or the composer. Your squad is still there — try again, or return to
            the session hub.
          </p>
          {import.meta.env.DEV ? (
            <pre className="mt-4 max-h-28 overflow-auto rounded-md border border-[#2d3f55] bg-[#0b0f1a] p-3 font-mono text-[0.75rem] text-amber">
              {error.message}
            </pre>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center border-0 bg-teal px-6 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-90"
              style={{ borderRadius: 8 }}
              onClick={this.handleRetry}
            >
              Try again
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-6 font-heading text-[0.95rem] font-medium text-[#a8b2c1] hover:border-[#3d4f63]"
              style={{ borderRadius: 8 }}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
            <Link
              to="/session"
              className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-[0.95rem] font-medium text-teal underline-offset-4 hover:underline"
            >
              Session hub
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
