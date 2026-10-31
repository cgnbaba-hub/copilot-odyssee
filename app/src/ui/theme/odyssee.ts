import { Theme } from './types';

/**
 * Old travel poster: paper, ink outlines, a deep Aegean blue and a sun
 * yellow for the big calls to action. Titles use a condensed poster face,
 * everything else a typeface built for legibility. Progress reads like a
 * travel loyalty programme: miles, status levels, passport stamps and
 * souvenirs.
 */
export const odysseeTheme: Theme = {
  id: 'odyssee',
  colors: {
    background: '#EFE4C8',
    surface: '#FAF4E4',
    surfaceAlt: '#F3E9D0',
    text: '#1A2940',
    textMuted: '#4B566A',
    line: '#CDBE98',
    ink: '#1A2940',
    primary: '#1D5A85',
    primaryShade: '#1A2940',
    onPrimary: '#FFFFFF',
    // DERTOUR red (#E40028) for the main buttons; to be checked against the brand kit.
    brand: '#E40028',
    brandShade: '#A8001E',
    onBrand: '#FFFFFF',
    accent: '#F2B13A',
    sand: '#E3CF9F',
    success: '#2C7A4B',
    successSoft: '#DCEBD3',
    danger: '#B8432B',
    dangerSoft: '#F6DCD2',
    premium: '#5B4BA8',
    premiumSoft: '#E6E0F5',
    sea: '#2F7FB1',
    seaDeep: '#1F5F8B'
  },
  fonts: {
    logo: "'Odyssee League Gothic', 'Arial Narrow', Impact, sans-serif",
    display: "'Odyssee Atkinson', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    body: "'Odyssee Atkinson', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
  },
  terms: {
    appTitle: { de: 'Copilot Odyssee', en: 'Copilot Odyssey' },
    company: { de: 'DERTOUR Suisse', en: 'DERTOUR Suisse' },
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
