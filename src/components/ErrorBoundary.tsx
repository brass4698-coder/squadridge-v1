import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-xl overflow-auto rounded border p-4 text-left text-xs">
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
