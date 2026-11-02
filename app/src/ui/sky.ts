/**
 * The mood of the sky on the start screen: it follows the local time of
 * day, and every calendar day brings its own weather, so the view from the
 * ship looks a little different each time someone comes back.
 */

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'clouds' | 'rainbow' | 'breeze';

export interface SkyMood {
  phase: DayPhase;
  weather: Weather;
  /** Sky from top to horizon. */
  skyTop: string;
  skyLow: string;
  sun: string;
  rays: string;
  raysOpacity: number;
  cloud: string;
  sea: string;
  glint: string;
  /** Strokes of the waves. */
  wave: string;
  /** Darkening laid over islands and sea, 0 for none. */
  dusk: number;
}

const MOODS: Record<DayPhase, Omit<SkyMood, 'phase' | 'weather'>> = {
  dawn: {
    skyTop: '#f6c9a8',
    skyLow: '#fbe3b8',
    sun: '#f08a4b',
    rays: '#fde7cf',
    raysOpacity: 0.6,
    cloud: '#fde9de',
    sea: '#2a6a95',
    glint: '#f8b27a',
    wave: '#4a8bbb',
    dusk: 0.05
  },
  day: { skyTop: '#f3dca8', skyLow: '#f5e0b0', sun: '#f0a537', rays: '#f9ebc9', raysOpacity: 0.75, cloud: '#fbf4e4', sea: '#1f5f8b', glint: '#f8cf72', wave: '#3a82b4', dusk: 0 },
  dusk: {
    skyTop: '#c4577a',
    skyLow: '#f4a261',
    sun: '#e4572e',
    rays: '#fbd1a2',
    raysOpacity: 0.45,
    cloud: '#f6c1b0',
    sea: '#1d4f7a',
    glint: '#f28c5b',
    wave: '#3f78a8',
    dusk: 0.12
  },
  night: {
    skyTop: '#0d1b33',
    skyLow: '#23395d',
    sun: '#f4ecd2',
    rays: '#c9d6ee',
    raysOpacity: 0.08,
    cloud: '#3b4f72',
    sea: '#0f2f52',
    glint: '#e8e2c8',
    wave: '#24527e',
    dusk: 0.32
  }
};

const WEATHERS: Weather[] = ['clear', 'clouds', 'rainbow', 'breeze', 'clear', 'clouds', 'breeze'];

/** Morning glow 5 to 8, day until 17, evening glow until 20, then night. */
export function dayPhase(date: Date): DayPhase {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

/** The same weather all day long, a new one the next day. */
export function weatherOf(date: Date): Weather {
  const key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  let h = key;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = ((h >>> 16) ^ h) * 0x45d9f3b;
  h = (h >>> 16) ^ h;
  return WEATHERS[Math.abs(h) % WEATHERS.length];
}

export function skyMood(date: Date): SkyMood {
  const phase = dayPhase(date);
  const weather = weatherOf(date);
  // A rainbow needs the sun; at night it is simply a clear sky.
  return { phase, weather: weather === 'rainbow' && phase === 'night' ? 'clear' : weather, ...MOODS[phase] };
}

/** Index of today among all days, to pick the daily message in a bottle. */
export function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
