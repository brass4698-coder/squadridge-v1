import { Link } from 'react-router-dom';

const footerSections = [
  {
    heading: 'Platform',
    links: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Use Cases', href: '/use-cases' },
      { label: 'Security', href: '/security' },
      { label: 'Public Ledger', href: '/ledger' },
    ],
  },
  {
    heading: 'For You',
    links: [
      { label: 'For Facilitators', href: '/for-facilitators' },
      { label: 'For Institutions', href: '/for-institutions' },
      { label: 'For Partners', href: '/for-partners' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'Request Access', href: '/request-access' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
    ],
  },
];

export function FooterNav() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.heading}>
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {section.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:opacity-70"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 flex flex-col items-start justify-between gap-4 border-t pt-8 text-xs sm:flex-row sm:items-center"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <span>© {new Date().getFullYear()} SquadRidge. All rights reserved.</span>
          <span>Small squads. Big bridges.</span>
        </div>
      </div>
    </footer>
  );
}
