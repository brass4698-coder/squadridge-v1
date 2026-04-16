/** ~20 common languages: ISO 639-1 code → native name (for UI labels). */
export const COMMON_LANGUAGES: readonly { code: string; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'es', nativeName: 'Español' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'zh', nativeName: '中文' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'id', nativeName: 'Bahasa Indonesia' },
  { code: 'th', nativeName: 'ไทย' },
  { code: 'uk', nativeName: 'Українська' },
  { code: 'he', nativeName: 'עברית' },
] as const;

export function nativeNameForCode(code: string): string {
  const c = code.trim().toLowerCase().slice(0, 2);
  const row = COMMON_LANGUAGES.find((l) => l.code === c);
  return row?.nativeName ?? code;
}
