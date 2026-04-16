import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SentryNavigationListener } from './components/SentryNavigationListener';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './onboarding/app/components/ui/sonner';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { GrainOverlay } from './components/GrainOverlay';
import { ScrollToTop } from './components/ScrollToTop';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { SessionAccess } from './components/session/SessionAccess';
import { IntentPage } from './pages/IntentPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { LedgerPage } from './pages/LedgerPage';
import { Match } from './pages/Match';
import { DemoSessionPage } from './pages/DemoSessionPage';
import { ModDashboardPage } from './pages/ModDashboardPage';
import { RequireModerator } from './components/auth/RequireModerator';

export default function App() {
  return (
    <>
      {/* Stack above GrainOverlay (z-1) so routes/layout paint above the fixed grain texture */}
      <div className="relative z-10">
        <BrowserRouter>
          <SentryNavigationListener />
          <ScrollToTop />
          <AuthProvider>
            <Toaster position="top-center" richColors closeButton className="font-sans" />
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <RouteErrorBoundary onRetry={reset}>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/verify" element={<VerificationPage />} />
                      <Route path="/intent" element={<IntentPage />} />
                      <Route path="/ledger" element={<LedgerPage />} />
                      <Route path="/ledger/:proposalId" element={<LedgerPage />} />
                      <Route path="/match" element={<Match />} />
                      <Route path="/match-setup" element={<Navigate to="/intent" replace />} />
                      <Route path="/dev/supabase" element={<SupabaseHealthPage />} />
                      <Route path="/sign-in" element={<SignInPage />} />
                      <Route path="/auth/callback" element={<AuthCallbackPage />} />
                      <Route
                        path="/settings/profile"
                        element={
                          <RequireAuth>
                            <ProfileSettingsPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/mod"
                        element={
                          <RequireAuth>
                            <RequireModerator>
                              <ModDashboardPage />
                            </RequireModerator>
                          </RequireAuth>
                        }
                      />
                      {/* Static demo path must win over `/session/:squadId?` — dev/staging only (see isDemoSquadShortcutsEnabled). */}
                      {import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_SQUAD === 'true' ? (
                        <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                      ) : null}
                      <Route path="/session/:squadId?" element={<SessionAccess />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Routes>
                </RouteErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </AuthProvider>
        </BrowserRouter>
      </div>
      {/* Fixed grain (z-1); routes live in the z-10 wrapper above */}
      <GrainOverlay />
    </>
  );
}
