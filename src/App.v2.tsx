/**
 * App.v2.tsx — Redesign router (redesign/v2 branch)
 * Phases 1-6 complete. Phase 7 (Supabase) wires real data.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
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
import { PublicShell } from './components/layout/PublicShell';
import { AuthenticatedShell } from './components/layout/AuthenticatedShell';
import { isDemoSquadShortcutsEnabled } from './lib';
import { DemoWalkthroughProvider } from './demo/DemoWalkthroughContext';

// ── Existing pages ──────────────────────────────────────────────────
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SignInPage } from './pages/SignInPage';
import { SupabaseHealthPage } from './pages/SupabaseHealthPage';
import { VerificationPage } from './pages/VerificationPage';
import { InvitePage } from './pages/InvitePage';
import { SettingsIndexPage } from './pages/SettingsIndexPage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { NotificationsSettingsPage } from './pages/NotificationsSettingsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminDemoPage } from './pages/admin/AdminDemoPage';
import { AdminCsiPage } from './pages/admin/AdminCsiPage';
import { DemoSessionPage } from './pages/DemoSessionPage';

// ── V2 Phase 1 ──────────────────────────────────────────────────────────
import { LandingPage } from './pages/v2/LandingPage';
import { HowItWorksPage } from './pages/v2/HowItWorksPage';
import { RequestAccessPage } from './pages/v2/RequestAccessPage';

// ── V2 Phase 2 ──────────────────────────────────────────────────────────
import { FacilitatorDashboardPage } from './pages/v2/FacilitatorDashboardPage';
import { SessionsListPage } from './pages/v2/SessionsListPage';
import { ParticipantInvitePage } from './pages/v2/ParticipantInvitePage';
import { LiveRoomPage } from './pages/v2/LiveRoomPage';
import { OutcomeDraftingPage } from './pages/v2/OutcomeDraftingPage';

// ── V2 Phase 3 — participant flow ────────────────────────────────────────
import { InviteAcceptancePage } from './pages/v2/participant/InviteAcceptancePage';
import { VerificationStepPage } from './pages/v2/participant/VerificationStepPage';
import { ConsentPage } from './pages/v2/participant/ConsentPage';
import { SessionBriefingPage } from './pages/v2/participant/SessionBriefingPage';
import { WaitingRoomPage } from './pages/v2/participant/WaitingRoomPage';
import { ParticipantRoomPage } from './pages/v2/participant/ParticipantRoomPage';
import { SessionEndPage } from './pages/v2/participant/SessionEndPage';

// ── V2 Phase 3 — ledger v2 ──────────────────────────────────────────────
import { LedgerIndexPage } from './pages/v2/LedgerIndexPage';
import { LedgerRecordPage } from './pages/v2/LedgerRecordPage';

// ── V2 Phase 3 — public site pages ─────────────────────────────────────────
import { UseCasesPage } from './pages/v2/UseCasesPage';
import { SecurityPage } from './pages/v2/SecurityPage';
import { AboutPage } from './pages/v2/AboutPage';
import { FaqPage } from './pages/v2/FaqPage';
import { PrivacyPage } from './pages/v2/PrivacyPage';
import { TermsPage } from './pages/v2/TermsPage';

// ── V2 Phase 4 — error pages ───────────────────────────────────────────────
import { NotFoundPage } from './pages/v2/NotFoundPage';
import { AccessDeniedPage } from './pages/v2/AccessDeniedPage';

// ── V2 Phase 6 — facilitator session control ───────────────────────────────────
import { SessionNewPage } from './pages/v2/facilitator/SessionNewPage';
import { ParticipantsReviewPage } from './pages/v2/facilitator/ParticipantsReviewPage';
import { SessionControlPage } from './pages/v2/facilitator/SessionControlPage';
import { OutcomeWorkspacePage } from './pages/v2/facilitator/OutcomeWorkspacePage';
import { OutcomeReleasePage } from './pages/v2/facilitator/OutcomeReleasePage';

const OnboardingApp = lazy(() =>
  import('./onboarding/app/components/onboarding/Onboarding').then((m) => ({
    default: m.Onboarding,
  })),
);

const routeChunkFallback = (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className="flex min-h-dvh items-center justify-center text-sm"
    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
  >
    <span className="sr-only">Loading page content.</span>
    <span aria-hidden="true">Loading…</span>
  </div>
);

export default function AppV2() {
  return (
    <BrowserRouter>
      <GrainOverlay />
      <SentryNavigationListener />
      <ScrollToTop />
      <DemoWalkthroughProvider>
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton className="font-sans" />
          <Routes>

            {/* ── Onboarding ────────────────────────────────────────── */}
            <Route path="/onboarding" element={<Navigate to="/onboarding/mission" replace />} />
            <Route
              path="/onboarding/:stepId"
              element={
                <Suspense fallback={routeChunkFallback}>
                  <OnboardingApp />
                </Suspense>
              }
            />

            {/* ── Participant flow (token-gated, no auth required) ──────── */}
            <Route path="/p/invite" element={<InviteAcceptancePage />} />
            <Route path="/p/verify" element={<VerificationStepPage />} />
            <Route path="/p/consent" element={<ConsentPage />} />
            <Route path="/p/briefing" element={<SessionBriefingPage />} />
            <Route path="/p/waiting" element={<WaitingRoomPage />} />
            <Route path="/p/room" element={<ParticipantRoomPage />} />
            <Route path="/p/session-end" element={<SessionEndPage />} />

            {/* ── Authenticated Shell (facilitator) ────────────────────── */}
            <Route
              element={
                <RequireAuth>
                  <AuthenticatedShell />
                </RequireAuth>
              }
            >
              {/* Dashboard */}
              <Route path="/f/dashboard" element={<FacilitatorDashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/f/dashboard" replace />} />

              {/* Sessions list */}
              <Route path="/f/sessions" element={<SessionsListPage />} />
              <Route path="/sessions" element={<Navigate to="/f/sessions" replace />} />

              {/* Session lifecycle */}
              <Route path="/f/sessions/new" element={<SessionNewPage />} />
              <Route path="/sessions/new" element={<Navigate to="/f/sessions/new" replace />} />
              <Route path="/f/sessions/:sessionId/participants" element={<ParticipantsReviewPage />} />
              <Route path="/f/sessions/:sessionId/invite" element={<ParticipantInvitePage />} />
              <Route path="/f/sessions/:sessionId/control" element={<SessionControlPage />} />
              <Route path="/f/sessions/:sessionId/room" element={<LiveRoomPage />} />
              <Route path="/f/sessions/:sessionId/outcome" element={<OutcomeWorkspacePage />} />
              <Route path="/f/sessions/:sessionId/release" element={<OutcomeReleasePage />} />

              {/* Outcomes (legacy paths) */}
              <Route path="/f/outcomes/new" element={<OutcomeDraftingPage />} />
              <Route path="/f/outcomes/:outcomeId" element={<OutcomeDraftingPage />} />
              <Route path="/outcomes/new" element={<Navigate to="/f/outcomes/new" replace />} />

              {/* Settings */}
              <Route path="/f/settings" element={<SettingsLayout />}>
                <Route index element={<SettingsIndexPage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
                <Route path="safety" element={<SafetyCenterPage />} />
                <Route path="notifications" element={<NotificationsSettingsPage />} />
              </Route>
              <Route path="/settings" element={<Navigate to="/f/settings" replace />} />
            </Route>

            {/* ── Admin ─────────────────────────────────────────────── */}
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
              <Route index element={<Navigate to="rooms" replace />} />
            </Route>

            {/* ── Public Shell ──────────────────────────────────────────── */}
            <Route element={<PublicShell />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/use-cases" element={<UseCasesPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />
              <Route path="/request-access/confirmed" element={<Navigate to="/request-access" replace />} />

              <Route path="/ledger" element={<LedgerIndexPage />} />
              <Route path="/ledger/:proposalId" element={<LedgerRecordPage />} />

              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/invite" element={<InvitePage />} />

              {/* Legacy redirects */}
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/sign-in?reason=link" replace />} />

              {isDemoSquadShortcutsEnabled() ? (
                <>
                  <Route path="/session/demo-session-001" element={<DemoSessionPage />} />
                  <Route path="/session/demo" element={<Navigate to="/session/demo-session-001" replace />} />
                </>
              ) : (
                <>
                  <Route path="/session/demo-session-001" element={<Navigate to="/" replace />} />
                  <Route path="/session/demo" element={<Navigate to="/" replace />} />
                </>
              )}

              <Route path="/session/:squadId?" element={<SessionAccess />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

          </Routes>
        </AuthProvider>
      </DemoWalkthroughProvider>
    </BrowserRouter>
  );
}
