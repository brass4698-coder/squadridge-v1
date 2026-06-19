import './lib/env-bootstrap';
import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App.v2'; // redesign/v2 active
import { ErrorBoundary } from './components';
import { clearDemoPersistedStateOnReload } from './demo/clearDemoPersistedStateOnReload';
import { clearEphemeralStateOnBootstrap } from './lib/clearEphemeralStateOnBootstrap';
import { captureZkStubMisdeploySentinel, createAppQueryClient, initSentry } from './lib';
import './styles/tokens.css';
import './styles/globals.css';

clearEphemeralStateOnBootstrap();
clearDemoPersistedStateOnReload();
initSentry();
captureZkStubMisdeploySentinel();

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
