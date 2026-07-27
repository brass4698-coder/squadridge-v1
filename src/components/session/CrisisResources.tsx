import { useState } from 'react';
import { getCrisisResourcesFooter, getCrisisResourcesLead } from '../../lib/crisisAlertMessages';
import { useUserPreferences } from '../../hooks';

/**
 * In-session crisis resources surface (Phase 2.4 of the audit remediation
 * plan). Rendered in `SessionStrategyRoomChrome`; collapsed by default so it
 * does not hijack attention, but always one click away.
 *
 * Lead-in and footer copy are driven by `crisisAlertMessages.ts` so they pick
 * up the user's `useUserPreferences().preferredLanguage` and stay in sync
 * with the toast strings shown by `describeCrisisAlertResult`. The link list
 * itself is regionally generic (Befrienders, IFRC PSC, OCHA) and localized
 * variants are added by extending the catalog.
 */
type Resource = {
  /** Short, one-line label for the link. No region-specific names — keep this generic. */
  label: string;
  /** Best-effort URL; may not be reachable from every region. */
  url: string;
  /** One-line context shown beneath the label. */
  hint: string;
};

const DEFAULT_RESOURCES: Resource[] = [
  {
    label: 'Befrienders Worldwide (suicide / emotional crisis lines by country)',
    url: 'https://befrienders.org/find-support-now',
    hint: 'Searchable directory of confidential lines in your country.',
  },
  {
    label: 'IFRC Psychosocial Support Centre — local Red Cross / Red Crescent',
    url: 'https://pscentre.org/',
    hint: 'Find your national Red Cross / Red Crescent support services.',
  },
  {
    label: 'UN OCHA Humanitarian Needs Overview & response coordination',
    url: 'https://www.unocha.org/',
    hint: 'For ongoing humanitarian crises — coordination contacts by region.',
  },
];

export function CrisisResources({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { preferredLanguage } = useUserPreferences();

  return (
    <details
      className={`group rounded-lg border border-amber/35 bg-amber/[0.06] px-3 py-2 ${className}`}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sans text-[0.82rem] font-medium text-amber [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-amber" />
          Crisis support &amp; emergency resources
        </span>
        <span className="font-mono text-[0.7rem] text-amber/80">{open ? '−' : '+'}</span>
      </summary>
      <div className="mt-3 border-t border-amber/20 pt-3 font-sans text-[0.82rem] leading-relaxed text-sem-warning">
        <p className="font-medium text-amber-100">{getCrisisResourcesLead(preferredLanguage)}</p>
        <ul className="mt-3 space-y-3">
          {DEFAULT_RESOURCES.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-amber-200 underline-offset-4 hover:underline"
              >
                {r.label}
              </a>
              <p className="text-[0.78rem] text-sem-warning">{r.hint}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.78rem] text-sem-warning">
          {getCrisisResourcesFooter(preferredLanguage)}
        </p>
      </div>
    </details>
  );
}
