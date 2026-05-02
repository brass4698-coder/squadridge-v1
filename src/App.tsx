import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  AppLayout,
  GrainOverlay,
  RequireAuth,
  RequireModerator,
  ScrollToTop,
  SentryNavigationListener,
  SessionAccess,
  Toaster,
} from './components';
import { AdminLayout } from './components/admin/AdminLayout';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { IntentPage } from './pages/IntentPage';
import { LandingPage } from './pages/LandingPage';
import { DialoguesPage } from './pages/DialoguesPage';
import { TrustSafetyPage } from './pages/TrustSafetyPage';
import { InsightsDashboardPage, InsightsPage } from './pages/InsightsPage';
import { PartnersPage } from './pages/PartnersPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { SecurityDisclosurePage } from './pages/SecurityDisclosurePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AcceptableUsePage, PrivacyPolicyPage, TermsOfUsePage } from './pages/LegalPages';
import { ContactPage } from './pages/ContactPage';
import { Match } from './pages/Match';
import { DemoSessionPage } from './pages/DemoSessionPage';
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';
import { InvitePage } from './pages/InvitePage';
import { SettingsIndexPage } from './pages/SettingsIndexPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { NotificationsSettingsPage } from './pages/NotificationsSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminDemoPage } from './pages/admin/AdminDemoPage';
import { AdminCsiPage } from './pages/admin/AdminCsiPage';
import { AdminMetricsPage } from './pages/admin/AdminMetricsPage';
import { DeckViewerRedirectPage } from './pages/admin/DeckViewerRedirectPage';

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const LedgerPage = lazy(() =>
  import('./pages/LedgerPage').then((m) => ({ default: m.LedgerPage })),
);

const PitchDeckHubPage = lazy(() =>
  import('./pages/PitchDeckHubPage').then((m) => ({ default: m.PitchDeckHubPage })),
);

const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-dvh items-center justify-center bg-[#0a0f1a] font-sans text-sm text-slate-500"
  >
    <span className="sr-only">Loading page content.</span>
    <span aria-hidden="true">Loading…</span>
  </div>
);

export default function App() {
  return (
    <>
      <div className="relative z-10">
        <BrowserRouter>
          <SentryNavigationListener />
          <ScrollToTop />
          <DemoWalkthroughProvider>
            <AuthProvider>
              <Toaster position="top-center" richColors closeButton className="font-sans" />
              <Routes>
                <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
                <Route
                  path="/onboarding/:stepId"
                  element={
                    <Suspense fallback={routeChunkFallback}>
                      <OnboardingApp />
                    </Suspense>
                  }
                />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dialogues" element={<DialoguesPage />} />
                  <Route path="/trust" element={<TrustSafetyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfUsePage />} />
                  <Route path="/acceptable-use" element={<AcceptableUsePage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route
                    path="/insights/dashboard"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <InsightsDashboardPage />
                        </RequireModerator>
                      </RequireAuth>
                    }
                  />
                  <Route path="/partners" element={<PartnersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<Navigate to="/sign-in" replace />} />
                  <Route path="/invite" element={<InvitePage />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/find-squad" element={<IntentPage />} />
                  <Route path="/intent" element={<Navigate to="/find-squad" replace />} />
                  <Route
                    path="/ledger"
                    element={
                      <Suspense fallback={routeChunkFallback}>
                        <LedgerPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/ledger/:proposalSlug"
                    element={
                      <Suspense fallback={routeChunkFallback}>
                        <LedgerPage />
                      </Suspense>
                    }
                  />
                  {/* Trust & Safety is the top-level public IA; Security Disclosure remains a technical subpage. */}
                  <Route path="/security" element={<SecurityDisclosurePage />} />
                  {/*
                    Pitch deck hub is internal pitch-prep tooling, not a product surface.
                    Gated behind moderator role and accessed via the /admin sidebar so it
                    stays out of public discovery and the main demo path.
                  */}
                  <Route
                    path="/pitch-deck-hub"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <Suspense fallback={routeChunkFallback}>
                            <PitchDeckHubPage />
                          </Suspense>
                        </RequireModerator>
                      </RequireAuth>
                    }
                  />
                  {/*
                    Transparent moderator-side viewer for gated decks: mints
                    a 30s self-token via the `mint-deck-share` Edge Function
                    then redirects to the gated `serve-pitch-deck` URL. Stays
                    behind the same RequireAuth+RequireModerator gate; the
                    Edge Function is the actual security boundary.
                  */}
                  <Route
                    path="/admin/decks/view/:deckId"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <DeckViewerRedirectPage />
                        </RequireModerator>
                      </RequireAuth>
                    }
                  />
                  <Route path="/match" element={<Match />} />
                  <Route path="/match-setup" element={<Navigate to="/find-squad" replace />} />
                  <Route
                    path="/settings"
                    element={
                      <RequireAuth>
                        <SettingsLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<SettingsIndexPage />} />
                    <Route path="profile" element={<ProfileSettingsPage />} />
                    <Route path="safety" element={<SafetyCenterPage />} />
                    <Route path="notifications" element={<NotificationsSettingsPage />} />
                  </Route>
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth>
                        <RequireModerator>
                          <AdminLayout />
                        </RequireModerator>
                      </RequireAuth>
                    }
                  >
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="verification" element={<AdminVerificationPage />} />
                    <Route path="rooms" element={<AdminRoomsPage />} />
                    <Route path="logs" element={<AdminLogsPage />} />
                    <Route path="demo" element={<AdminDemoPage />} />
                    <Route path="health" element={<SupabaseHealthPage />} />
                    <Route path="csi" element={<AdminCsiPage />} />
                    <Route path="metrics" element={<AdminMetricsPage />} />
                    <Route index element={<Navigate to="rooms" replace />} />
                  </Route>
                  <Route path="/mod" element={<Navigate to="/admin/rooms" replace />} />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
                  <Route
                    path="/forgot-password"
                    element={<Navigate to="/sign-in?reason=link" replace />}
                  />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  {/*
                  The `/session/demo-session-001` route is a browser-only marketing
                  walkthrough. We only mount it in dev/test or when
                  `VITE_ENABLE_DEMO_SQUAD=true`; otherwise the URL redirects home
                  so a stray link cannot land users in the no-privacy mock.
                */}
                  {isDemoSquadShortcutsEnabled() ? (
                    <>
                      <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                      <Route
                        path="/session/demo"
                        element={<Navigate to="/session/demo-session-001" replace />}
                      />
                    </>
                  ) : (
                    <>
                      <Route
                        path="/session/demo-session-001"
                        element={<Navigate to="/" replace />}
                      />
                      <Route path="/session/demo" element={<Navigate to="/" replace />} />
                    </>
                  )}
                  <Route path="/session/:squadId?" element={<SessionAccess />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AuthProvider>
          </DemoWalkthroughProvider>
        </BrowserRouter>
      </div>
      <GrainOverlay />
    </>
  );
}
