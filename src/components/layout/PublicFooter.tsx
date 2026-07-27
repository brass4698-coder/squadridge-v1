import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SquadRidgeLockup } from '../SquadRidgeWordmark';
import { SectionLabel } from '../SectionLabel';
import { CTA } from '../../data/siteMessaging';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import { prefetchPublicRoute } from '../../lib/prefetchPublicRoute';
import { publicShellInnerClass, shellListResetClass } from './publicShellTokens';

const productLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'FAQ', href: '/faq' },
] as const;

const trustLinks = [
  { label: 'Security', href: '/security' },
  { label: 'Security technical', href: '/security/technical' },
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const;

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Security', href: '/security' },
] as const;

/**
 * Public marketing footer — brand column, nav clusters, and a quiet meta bar.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();
  const accessLinks = [
    { label: CTA.primaryLabel, href: CTA.primaryHref },
    { label: 'Briefings', href: '/briefings' },
    { label: 'Contact', href: '/contact' },
    { label: 'Sign in', href: '/sign-in' },
    ...(isDemoLoginEnabled() ? [{ label: 'Demo hub', href: '/demo' }] : []),
  ];
  const footerColumns = [
    { title: 'Product', links: [...productLinks] },
    { title: 'Trust', links: [...trustLinks] },
    { title: 'Access', links: accessLinks },
  ];

  return (
    <footer className="sr-public-footer relative z-10" data-scroll-section>
      <div className={publicShellInnerClass}>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] md:gap-10 lg:gap-14">
          <div className="max-w-[16.5rem]">
            <Link to="/" className="inline-flex text-ink no-underline" aria-label="SquadRidge home">
              <SquadRidgeLockup size="sm" showTagline className="text-ink" />
            </Link>
            <p className="mt-3 text-[0.8125rem] leading-snug text-ink-secondary">
              Private rooms. Approved outcomes only.
            </p>
            <p className="mt-2 font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em] text-ink-faint">
              Enclosed → Release gate → Published
            </p>
            <Link
              to={CTA.primaryHref}
              className="btn-institutional btn-institutional--primary sr-press sr-public-footer__cta mt-4 inline-flex items-center gap-1.5"
              onMouseEnter={() => prefetchPublicRoute(CTA.primaryHref)}
              onFocus={() => prefetchPublicRoute(CTA.primaryHref)}
            >
              {CTA.primaryLabel}
              <ArrowRight className="size-3 opacity-80" aria-hidden />
            </Link>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-0"
            aria-label="Footer"
          >
            {footerColumns.map((col) => (
              <div key={col.title} className="min-w-0">
                <SectionLabel className="mb-2.5 whitespace-nowrap">{col.title}</SectionLabel>
                <ul className={`${shellListResetClass} mt-0 flex flex-col gap-1.5`}>
                  {col.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="sr-public-footer__link"
                        onMouseEnter={() => prefetchPublicRoute(item.href)}
                        onFocus={() => prefetchPublicRoute(item.href)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="sr-public-footer__meta mt-8 flex flex-col gap-3 pt-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[0.6875rem] leading-none text-ink-faint sm:text-xs">
            &copy; {year} SquadRidge. Invite-only private pilots.
          </p>
          <ul className={`${shellListResetClass} flex flex-wrap items-center gap-x-4 gap-y-1.5`}>
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="sr-public-footer__meta-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
