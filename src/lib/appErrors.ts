/**
 * Stable codes for client-side classification (Sentry tags, support, UI copy).
 * Not every path sets every field; use `classifyClientError` for a normalized view.
 */
export type AppErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'AUTH_SESSION'
  | 'RLS_OR_POLICY'
  | 'NOT_FOUND'
  | 'RPC_UNEXPECTED'
  | 'MATCHMAKING_UNAVAILABLE'
  | 'UNKNOWN';

export type AppErrorKind = 'network' | 'auth' | 'permission' | 'server' | 'unknown';

export interface ClassifiedClientError {
  code: AppErrorCode;
  kind: AppErrorKind;
  /** Safe to show in UI */
  userMessage: string;
  /** Optional: Postgres / PostgREST / HTTP detail for logs only */
  technicalMessage?: string;
  retryable: boolean;
  /** Original when useful for Sentry */
  cause?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isPostgrestLike(e: unknown): e is { code: string; message: string; hint?: string; details?: string } {
  if (!isRecord(e)) return false;
  return typeof e.code === 'string' && typeof e.message === 'string';
}

function isAuthLike(e: unknown): e is { message: string; status?: number; name?: string } {
  if (!isRecord(e)) return false;
  return typeof e.message === 'string' && (e.name === 'AuthApiError' || e.name === 'AuthError' || 'status' in e);
}

function networkishMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes('failed to fetch') ||
    m.includes('network') ||
    m.includes('load failed') ||
    m.includes('networkerror') ||
    m.includes('ecconnrefused') ||
    m.includes('econnreset')
  );
}

/**
 * Maps Postgres / PostgREST codes and messages to user-facing copy.
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export function classifyClientError(error: unknown): ClassifiedClientError {
  if (error instanceof TypeError && typeof error.message === 'string') {
    if (networkishMessage(error.message)) {
      return {
        code: 'NETWORK',
        kind: 'network',
        userMessage:
          'We could not reach the server. Check your connection, then try again.',
        technicalMessage: error.message,
        retryable: true,
        cause: error,
      };
    }
  }

  if (error instanceof Error && networkishMessage(error.message)) {
    return {
      code: 'NETWORK',
      kind: 'network',
      userMessage:
        'We could not reach the server. Check your connection, then try again.',
      technicalMessage: error.message,
      retryable: true,
      cause: error,
    };
  }

  if (isAuthLike(error)) {
    const msg = error.message;
    const sessionLikely =
      /jwt|session|refresh|token|expired|invalid/i.test(msg) ||
      error.status === 401 ||
      error.status === 403;
    if (sessionLikely) {
      return {
        code: 'AUTH_SESSION',
        kind: 'auth',
        userMessage:
          'Your session could not be verified. Try reloading the page or signing in again.',
        technicalMessage: msg,
        retryable: true,
        cause: error,
      };
    }
  }

  if (isPostgrestLike(error)) {
    const { code, message, hint } = error;
    // Permission / RLS
    if (code === '42501' || code === 'PGRST301' || /permission denied|rls|policy/i.test(message)) {
      const rls = code === '42501' || /permission denied|rls|policy/i.test(message);
      return {
        code: rls ? 'RLS_OR_POLICY' : 'AUTH_SESSION',
        kind: rls ? 'permission' : 'auth',
        userMessage: rls
          ? 'This action is not allowed for your account. If you just joined, try again in a moment or reload the page.'
          : 'Your session could not be verified. Try reloading the page or signing in again.',
        technicalMessage: hint ? `${message} (${hint})` : message,
        retryable: true,
        cause: error,
      };
    }
    if (code === 'PGRST116' || code === '42P01') {
      return {
        code: 'NOT_FOUND',
        kind: 'server',
        userMessage: 'The requested data was not found. Try again or go back.',
        technicalMessage: message,
        retryable: true,
        cause: error,
      };
    }
    return {
      code: 'RPC_UNEXPECTED',
      kind: 'server',
      userMessage:
        'Something went wrong talking to the service. Try again in a moment.',
      technicalMessage: message,
      retryable: true,
      cause: error,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      kind: 'unknown',
      userMessage: error.message || 'Something went wrong. You can try again.',
      technicalMessage: error.message,
      retryable: true,
      cause: error,
    };
  }

  return {
    code: 'UNKNOWN',
    kind: 'unknown',
    userMessage: 'Something went wrong. You can try again.',
    retryable: true,
    cause: error,
  };
}

export function matchmakingUnavailableClassified(): ClassifiedClientError {
  return {
    code: 'MATCHMAKING_UNAVAILABLE',
    kind: 'server',
    userMessage:
      'Matching is not responding right now. Wait a moment and try again.',
    retryable: true,
  };
}
