import { Lang } from '../core/i18n/locale';

const LOCALE: Record<Lang, string> = { de: 'de-CH', en: 'en-GB' };

/** 1234 → "1’234" in Swiss German, "1,234" in English. */
export function formatNumber(lang: Lang, value: number): string {
  return value.toLocaleString(LOCALE[lang]);
}

export function formatDate(lang: Lang, iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE[lang], { day: '2-digit', month: '2-digit', year: 'numeric' });
}
