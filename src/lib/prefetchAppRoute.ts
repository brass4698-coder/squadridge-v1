/**
 * Warm authenticated app route chunks on intent (sidebar hover / focus).
 * Safe to call repeatedly — module graph is cached after the first import.
 */
const prefetchers: Record<string, () => Promise<unknown>> = {
  '/app': () => import('../pages/v2/FacilitatorDashboardPage'),
  '/app/facilitator': () => import('../pages/v2/FacilitatorDashboardPage'),
  '/app/sessions': () => import('../pages/v2/SessionsListPage'),
  '/app/sessions/new/setup': () => import('../pages/v2/facilitator/SessionNewPage'),
  '/app/participants': () => import('../pages/v2/ParticipantsIndexPage'),
  '/app/insights': () => import('../pages/v2/InsightsPage'),
  '/app/release-gate': () => import('../pages/v2/ReleaseGatePage'),
  '/app/ledger': () => import('../pages/dashboards/AppLedgerDashboardPage'),
  '/app/executive': () => import('../pages/dashboards/ExecutiveGovernancePage'),
  '/app/pilot-guide': () => import('../pages/v2/PilotGuidePage'),
  '/app/settings': () => import('../pages/SettingsIndexPage'),
  '/app/participant': () => import('../pages/dashboards/ParticipantDashboardPage'),
  '/app/admin/invites': () => import('../pages/admin/AdminInvitesPage'),
};

const warmed = new Set<string>();

export function prefetchAppRoute(href: string): void {
  const path = href.split('#')[0]?.split('?')[0] ?? href;
  if (!path || warmed.has(path)) return;
  const load = prefetchers[path];
  if (!load) return;
  warmed.add(path);
  void load().catch(() => {
    warmed.delete(path);
  });
}
