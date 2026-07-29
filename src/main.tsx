import './lib/env-bootstrap';
import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App.v2';
import { ErrorBoundary } from './components/ErrorBoundary';
import { clearDemoPersistedStateOnReload } from './demo/clearDemoPersistedStateOnReload';
import { clearEphemeralStateOnBootstrap } from './lib/clearEphemeralStateOnBootstrap';
import { createAppQueryClient } from './lib/queryClient';
import './styles/tokens.css';
import './styles/globals.css';

clearEphemeralStateOnBootstrap();
clearDemoPersistedStateOnReload();

/** Defer Sentry so first paint is not blocked by the observability SDK. */
function scheduleSentryBootstrap(): void {
  const boot = () => {
    void import('./lib/sentry').then(({ initSentry, captureZkStubMisdeploySentinel }) => {
      initSentry();
      captureZkStubMisdeploySentinel();
    });
  };
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 2500 });
  } else {
    window.setTimeout(boot, 1);
  }
}
scheduleSentryBootstrap();

const queryClient = createAppQueryClient();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
