import { Localized } from '../content/types';

/** Languages the app UI is translated into. Content may carry more. */
export type Lang = 'de' | 'en';

export const SUPPORTED_LANGS: Lang[] = ['de', 'en'];

/** Maps a culture name such as "de-CH" or "en-US" to a supported language. */
export function langFromCulture(culture: string | undefined): Lang {
  return culture && culture.toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
}

export function localize(text: Localized, lang: Lang): string {
  return text[lang] || text.de;
}
