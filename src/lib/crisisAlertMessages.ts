/**
 * Minimal i18n catalog for crisis-alert and crisis-resource UI copy.
 *
 * v1 ships `en` (default) and `es` only. The catalog structure deliberately
 * mirrors what a future i18n framework (react-intl, lingui, etc.) would
 * produce so swapping the resolver out is a contained refactor. The
 * preference source is `useUserPreferences().preferredLanguage`, which itself
 * defaults to the user's `navigator.language`.
 *
 * Adding a locale: add a new top-level key with the same shape as `en`.
 * Missing keys fall back to `en` automatically via {@link selectLocale}.
 */

import type { CrisisAlertResult } from './crisisAlert';

export type CrisisAlertResultKey =
  | 'ok'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'invalid'
  | 'server_error';

export interface CrisisAlertCatalog {
  describeResult: Record<CrisisAlertResultKey, string>;
  resourcesLead: string;
  resourcesFooter: string;
}

const EN: CrisisAlertCatalog = {
  describeResult: {
    ok: 'Facilitator alerted. Help is on the way.',
    unauthorized: 'Please sign in again before alerting a facilitator.',
    forbidden: 'You can only alert from a session you are part of.',
    rate_limited: 'Too many alerts in a short time — try again in a minute.',
    invalid: 'Could not send the alert. Reload and try once more.',
    server_error:
      'We could not record the alert. Use your local emergency number if this is urgent.',
  },
  resourcesLead:
    'If you or someone here is in immediate physical danger, contact your local emergency number first. SquadRidge cannot reach emergency services for you.',
  resourcesFooter:
    'The list is a starting point and not exhaustive — see your local crisis directory or your facilitator for region-specific contacts.',
};

const ES: CrisisAlertCatalog = {
  describeResult: {
    ok: 'Facilitador avisado. La ayuda está en camino.',
    unauthorized: 'Inicia sesión de nuevo antes de avisar a un facilitador.',
    forbidden: 'Solo puedes avisar desde una sesión a la que pertenezcas.',
    rate_limited: 'Demasiadas alertas en poco tiempo — vuelve a intentarlo en un minuto.',
    invalid: 'No se pudo enviar la alerta. Recarga e intenta de nuevo.',
    server_error:
      'No pudimos registrar la alerta. Usa tu número local de emergencias si es urgente.',
  },
  resourcesLead:
    'Si tú o alguien aquí está en peligro físico inmediato, contacta primero a tu número local de emergencias. SquadRidge no puede llamar a los servicios de emergencia por ti.',
  resourcesFooter:
    'Esta lista es un punto de partida y no es exhaustiva — consulta tu directorio local de crisis o tu facilitador.',
};

const CATALOG: Record<string, CrisisAlertCatalog> = { en: EN, es: ES };

function selectLocale(localeHint: string | undefined | null): CrisisAlertCatalog {
  const code = (localeHint ?? 'en').slice(0, 2).toLowerCase();
  return CATALOG[code] ?? EN;
}

/** Plain copy for the alert button + result toasts, localized when possible. */
export function describeCrisisAlertResultIn(
  r: CrisisAlertResult,
  localeHint: string | undefined | null,
): string {
  const cat = selectLocale(localeHint);
  if (r.ok) return cat.describeResult.ok;
  return cat.describeResult[r.error_code] ?? cat.describeResult.server_error;
}

/** Lead-in copy shown above crisis resource links. */
export function getCrisisResourcesLead(localeHint: string | undefined | null): string {
  return selectLocale(localeHint).resourcesLead;
}

/** Footer copy under crisis resource links. */
export function getCrisisResourcesFooter(localeHint: string | undefined | null): string {
  return selectLocale(localeHint).resourcesFooter;
}
