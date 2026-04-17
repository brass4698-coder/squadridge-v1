import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { clearDemoPersistedStateOnReload } from './demo/clearDemoPersistedStateOnReload';
import { initSentry } from './lib/sentry';
import { createAppQueryClient } from './lib/queryClient';
import './styles/globals.css';

clearDemoPersistedStateOnReload();
initSentry();

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
