/**
 * SquadRidge UI string registry — Phase 3 foundation.
 *
 * Strategy: a typed, hand-curated catalog of strings used by the new
 * investor-facing surfaces (Insights / Partners / Trust & Safety / Ledger / nav
 * labels). The entry shape is `Record<key, Record<locale, string>>`, which
 * keeps a single source of truth, makes missing translations a type error,
 * and is mechanically convertible to ICU/i18next once we pick a runtime
 * library in the full Phase 3 i18n cut.
 *
 * Today this only powers the language switcher's UI labels. Pages still
 * read English literals directly. Phase 3 (real i18n) will replace those
 * literals with `t('insights.title')` calls and grow the catalog.
 */

import { useLocale } from '../../components/layout/LanguageSwitcher';

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'ar', 'uk'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

type StringMap = Record<Locale, string>;

const STRINGS = {
  'nav.mission': {
    en: 'Overview',
    es: 'Resumen',
    fr: 'Aperçu',
    ar: 'نظرة عامة',
    uk: 'Огляд',
  },
  'nav.dialogues': {
    en: 'Dialogues',
    es: 'Diálogos',
    fr: 'Dialogues',
    ar: 'الحوارات',
    uk: 'Діалоги',
  },
  'nav.trust': {
    en: 'Trust & Safety',
    es: 'Confianza y seguridad',
    fr: 'Confiance et sécurité',
    ar: 'الثقة والأمان',
    uk: 'Довіра та безпека',
  },
  'nav.ledger': {
    en: 'Ledger',
    es: 'Registro',
    fr: 'Registre',
    ar: 'السجل',
    uk: 'Реєстр',
  },
  'nav.insights': {
    en: 'Insights',
    es: 'Métricas',
    fr: 'Indicateurs',
    ar: 'المؤشرات',
    uk: 'Аналітика',
  },
  'nav.partners': {
    en: 'Partners',
    es: 'Socios',
    fr: 'Partenaires',
    ar: 'الشركاء',
    uk: 'Партнери',
  },
  'nav.apply': {
    en: 'Apply for pilot access',
    es: 'Solicitar acceso al piloto',
    fr: 'Candidater au pilote',
    ar: 'التقدم للوصول التجريبي',
    uk: 'Подати заявку на пілот',
  },
  'status.live': {
    en: 'Live',
    es: 'Activo',
    fr: 'En direct',
    ar: 'مباشر',
    uk: 'Активно',
  },
  'status.stale': {
    en: 'Stale',
    es: 'Obsoleto',
    fr: 'Périmé',
    ar: 'قديم',
    uk: 'Застаріле',
  },
  'status.empty': {
    en: 'Idle',
    es: 'Inactivo',
    fr: 'Inactif',
    ar: 'خامل',
    uk: 'Простоює',
  },
  'status.error': {
    en: 'Error',
    es: 'Error',
    fr: 'Erreur',
    ar: 'خطأ',
    uk: 'Помилка',
  },
} as const satisfies Record<string, StringMap>;

export type StringKey = keyof typeof STRINGS;

export function lookupString(key: StringKey, locale: Locale): string {
  /* Fall back to English if a translation is missing — never an empty
   * string at the call site, which would produce ghost UI. */
  return STRINGS[key][locale] ?? STRINGS[key].en;
}

/**
 * useStrings — the eventual t() shape. Today it only resolves the curated
 * set of keys above, but call sites that adopt it survive the Phase 3
 * library swap unchanged.
 */
export function useStrings(): {
  locale: Locale;
  t: (key: StringKey) => string;
} {
  const [rawLocale] = useLocale();
  /* `useLocale` returns the wider runtime locale; coerce to our supported set. */
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : 'en';
  return {
    locale,
    t: (key) => lookupString(key, locale),
  };
}
