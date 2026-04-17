/**
 * App-specific errors for consistent handling in UI boundaries and TanStack Query retry logic.
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Missing or invalid environment / client setup (e.g. Supabase not configured). */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Heuristic: transport failures we can reasonably retry (offline-first, flaky links).
 * Does not treat HTTP 4xx/5xx from a reachable server as network errors.
 */
export function isRecoverableNetworkError(error: unknown): boolean {
  if (error == null) return false;
  if (error instanceof NetworkError) return true;
  if (typeof error !== 'object' && typeof error !== 'function') return false;
  const e = error as Error;
  if (e.name === 'AbortError') return false;
  const msg = String(e.message ?? '').toLowerCase();
  const name = String(e.name ?? '');
  if (
    name === 'TypeError' &&
    (msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('network'))
  ) {
    return true;
  }
  if (msg.includes('networkerror') || msg.includes('load failed') || msg.includes('connection'))
    return true;
  return false;
}

export type ErrorBoundaryCopy = {
  title: string;
  description: string;
};

export function getErrorBoundaryCopy(error: Error): ErrorBoundaryCopy {
  if (error instanceof ValidationError) {
    return {
      title: 'Invalid input',
      description: `There's a problem with ${error.field}: ${error.message}`,
    };
  }
  if (error instanceof NetworkError || isRecoverableNetworkError(error)) {
    return {
      title: 'Connection problem',
      description:
        "We couldn't reach the service. Check your connection and try again, or reload the page if this keeps happening.",
    };
  }
  if (error instanceof ConfigurationError) {
    return {
      title: 'Configuration problem',
      description: error.message,
    };
  }
  return {
    title: 'Something went wrong',
    description:
      'The app hit an unexpected error. Try again to remount the UI, or reload the page if the problem persists.',
  };
}
