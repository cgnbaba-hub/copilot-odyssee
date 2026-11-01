import { Lang } from '../core/i18n/locale';

const LOCALE: Record<Lang, string> = { de: 'de-CH', en: 'en-GB' };

/** 1234 → "1’234" in Swiss German, "1,234" in English. */
export function formatNumber(lang: Lang, value: number): string {
  return value.toLocaleString(LOCALE[lang]);
}

export function formatDate(lang: Lang, iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE[lang], { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "1. November 2026" / "1 November 2026", for the date a fact was checked. */
export function formatLongDate(lang: Lang, iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return isNaN(date.getTime()) ? iso : date.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' });
}
