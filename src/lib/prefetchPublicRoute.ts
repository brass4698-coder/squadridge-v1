/**
 * Warm marketing route chunks on intent (hover / focus).
 * Safe to call repeatedly — module graph is cached after the first import.
 */
const prefetchers: Record<string, () => Promise<unknown>> = {
  '/how-it-works': () => import('../pages/v2/HowItWorksPage'),
  '/use-cases': () => import('../pages/v2/UseCasesPage'),
  '/ledger': () => import('../pages/v2/LedgerIndexPage'),
  '/security': () => import('../pages/v2/SecurityPage'),
  '/about': () => import('../pages/v2/AboutPage'),
  '/faq': () => import('../pages/v2/FaqPage'),
  '/pricing': () => import('../pages/v2/PricingPage'),
  '/roadmap': () => import('../pages/v2/RoadmapPage'),
  '/pipeline': () => import('../pages/v2/PipelinePage'),
  '/privacy': () => import('../pages/v2/PrivacyPage'),
  '/terms': () => import('../pages/v2/TermsPage'),
  '/contact': () => import('../pages/v2/ContactPage'),
  '/briefings': () => import('../pages/v2/BriefingsPage'),
  '/request-access': () => import('../pages/v2/RequestAccessPage'),
  '/pilot-guide': () => import('../pages/v2/PilotGuidePage'),
};

const warmed = new Set<string>();

export function prefetchPublicRoute(href: string): void {
  const path = href.split('#')[0]?.split('?')[0] ?? href;
  if (!path || warmed.has(path)) return;
  const load = prefetchers[path];
  if (!load) return;
  warmed.add(path);
  void load().catch(() => {
    warmed.delete(path);
  });
}
