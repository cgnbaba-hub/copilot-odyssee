import { Theme } from './types';

export const odysseeTheme: Theme = {
  id: 'odyssee',
  colors: {
    background: '#F4EBD9',
    surface: '#FFFDF7',
    surfaceAlt: '#EFE3C8',
    text: '#1F2A44',
    textMuted: '#5B6478',
    border: '#1F2A44',
    primary: '#1B4F8A',
    onPrimary: '#FFFFFF',
    accent: '#E0A526',
    success: '#2E7D4F',
    danger: '#B03A2E',
    sea: '#2C7DB8',
    seaDeep: '#164B7A'
  },
  terms: {
    appTitle: { de: 'Odyssee', en: 'Odyssey' },
    tagline: { de: 'Deine Reise mit Copilot', en: 'Your journey with Copilot' },
    xp: { de: 'Seemeilen', en: 'nautical miles' },
    mapTitle: { de: 'Seekarte', en: 'Sea chart' },
    preview: { de: 'Ausblick', en: 'Preview' }
  },
  ranks: [
    { minLevel: 1, name: { de: 'Deckshilfe', en: 'Deckhand' } },
    { minLevel: 3, name: { de: 'Crew-Mitglied', en: 'Crew member' } },
    { minLevel: 5, name: { de: 'Navigator:in', en: 'Navigator' } },
    { minLevel: 8, name: { de: 'Steuerfrau/-mann', en: 'Helmsperson' } },
    { minLevel: 12, name: { de: 'Kapitän:in', en: 'Captain' } },
    { minLevel: 18, name: { de: 'Held:in von Ithaka', en: 'Hero of Ithaca' } }
  ]
};
