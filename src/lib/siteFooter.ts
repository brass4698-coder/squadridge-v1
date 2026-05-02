export type FooterLink = {
  label: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: ReadonlyArray<FooterLink>;
};

export const pilotAccessHref = '/#waitlist';

/** Footer IA for public and fallback surfaces. */
export const footerLinkGroups: ReadonlyArray<FooterLinkGroup> = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '/' },
      { label: 'Dialogues', href: '/dialogues' },
      { label: 'Ledger', href: '/ledger' },
      { label: 'How it works', href: '/#how-it-works' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Trust & Safety', href: '/trust' },
      { label: 'Security Disclosure', href: '/security' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Acceptable Use', href: '/acceptable-use' },
    ],
  },
  {
    title: 'Pilot',
    links: [
      { label: 'Apply for pilot access', href: pilotAccessHref },
      { label: 'Pilot process', href: '/partners#pilot-process' },
      { label: 'Pilot scope', href: '/partners#pilot-scope' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights', href: '/insights' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];
