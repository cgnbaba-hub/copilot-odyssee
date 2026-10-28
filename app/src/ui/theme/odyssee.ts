import { Theme } from './types';

/**
 * Bright Aegean palette (turquoise sea, white houses, sun) with a rounded,
 * friendly display face for headings and buttons; the wordmark keeps the
 * Greek inscription style. Progress reads like a travel loyalty programme:
 * miles, status levels, passport stamps and souvenirs. The guide is Athene,
 * the little owl of the goddess who accompanies Odysseus.
 */
export const odysseeTheme: Theme = {
  id: 'odyssee',
  colors: {
    background: '#F2F8FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF5F9',
    text: '#16324A',
    textMuted: '#55708A',
    line: '#D5E4EE',
    ink: '#0F2C47',
    primary: '#1167C9',
    primaryShade: '#0A4A94',
    onPrimary: '#FFFFFF',
    accent: '#FFC23D',
    sand: '#F4E3C1',
    success: '#23884C',
    successSoft: '#E2F4E8',
    danger: '#C93C2A',
    dangerSoft: '#FCE7E3',
    premium: '#6A4BC4',
    premiumSoft: '#EEE9FB',
    sea: '#1FA9C9',
    seaDeep: '#0B5C8B'
  },
  fonts: {
    logo: "'Odyssee Marcellus', 'Palatino Linotype', Palatino, Georgia, serif",
    display: "'Odyssee Nunito', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    body: "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
  },
  terms: {
    appTitle: { de: 'Odyssee', en: 'Odyssey' },
    tagline: { de: 'Deine Reise mit Copilot', en: 'Your journey with Copilot' },
    xp: { de: 'Seemeilen', en: 'nautical miles' },
    mapTitle: { de: 'Seekarte', en: 'Sea chart' },
    preview: { de: 'Ausblick', en: 'Preview' },
    passport: { de: 'Reisepass', en: 'Passport' },
    stamps: { de: 'Stempel', en: 'Stamps' },
    souvenirs: { de: 'Souvenirs', en: 'Souvenirs' },
    guide: { de: 'Athene', en: 'Athene' }
  },
  ranks: [
    { minLevel: 1, name: { de: 'Reisende:r', en: 'Traveller' } },
    { minLevel: 3, name: { de: 'Entdecker:in', en: 'Explorer' } },
    { minLevel: 5, name: { de: 'Weltenbummler:in', en: 'Globetrotter' } },
    { minLevel: 8, name: { de: 'Reiseleiter:in', en: 'Tour guide' } },
    { minLevel: 12, name: { de: 'Kapitän:in', en: 'Captain' } },
    { minLevel: 18, name: { de: 'Legende von Ithaka', en: 'Legend of Ithaca' } }
  ],
  souvenirs: {
    'first-postcard': {
      name: { de: 'Erste Postkarte', en: 'First postcard' },
      hint: { de: 'Halte deinen ersten eigenen Use Case fest.', en: 'Capture your first own use case.' }
    },
    'island-hopper': {
      name: { de: 'Inselhüpfer:in', en: 'Island hopper' },
      hint: { de: 'Lege auf drei verschiedenen Inseln an.', en: 'Land on three different islands.' }
    },
    'aeolus-bag': {
      name: { de: 'Windschlauch des Aiolos', en: 'Bag of the winds' },
      hint: { de: 'Erreiche 100 Punkte in einer Prompt-Werkstatt.', en: 'Score 100 points in a prompt workshop.' }
    },
    'siren-proof': {
      name: { de: 'Wachs in den Ohren', en: 'Wax in your ears' },
      hint: {
        de: 'Beantworte alle Quizfragen einer Etappe beim ersten Versuch richtig.',
        en: 'Answer every quiz question of a stage correctly on the first try.'
      }
    },
    homecoming: {
      name: { de: 'Heimkehr nach Ithaka', en: 'Homecoming' },
      hint: { de: 'Schliesse eine Etappe in Ithaka ab.', en: 'Complete a stage in Ithaca.' }
    },
    'second-voyage': {
      name: { de: 'Zweite Fahrt', en: 'Second voyage' },
      hint: { de: 'Wiederhole eine abgeschlossene Etappe.', en: 'Repeat a completed stage.' }
    }
  }
};
