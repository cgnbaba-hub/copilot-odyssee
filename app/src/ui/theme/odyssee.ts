import { Theme } from './types';

/**
 * Aegean palette (whitewashed walls, deep sea, sun) with a display face in
 * the spirit of Greek inscriptions. Progress reads like a travel loyalty
 * programme: miles, status levels, passport stamps and souvenirs.
 */
export const odysseeTheme: Theme = {
  id: 'odyssee',
  colors: {
    background: '#EAF1F6',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F7FA',
    text: '#13263A',
    textMuted: '#556779',
    line: '#D3E0EA',
    ink: '#0B2540',
    primary: '#0D5EAF',
    onPrimary: '#FFFFFF',
    accent: '#F2B43A',
    sand: '#F1E4C6',
    success: '#4F7F2A',
    danger: '#B8412F',
    sea: '#1E86B8',
    seaDeep: '#0A3760'
  },
  fonts: {
    display: "'Odyssee Marcellus', 'Palatino Linotype', Palatino, Georgia, serif",
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
    souvenirs: { de: 'Souvenirs', en: 'Souvenirs' }
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
