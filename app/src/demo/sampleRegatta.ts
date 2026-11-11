import { weekKey } from '../core/challenge/challenge';
import { ContentBundle } from '../core/content/types';
import { RegattaEntry, RegattaReport, RegattaSource, weekStartFor } from '../core/regatta/regatta';

const STORAGE_KEY = 'odyssee-demo-regatta';

/** Small deterministic random generator, so the sample looks the same on every load. */
function random(seed: number): () => number {
  let h = seed;
  return () => {
    h = (h * 1664525 + 1013904223) % 4294967296;
    return h / 4294967296;
  };
}

/** Invented names for the crews that show theirs. */
const FIRST = [
  'Lena',
  'Jonas',
  'Mara',
  'Noah',
  'Elif',
  'Luca',
  'Sara',
  'Nico',
  'Aline',
  'Reto',
  'Mira',
  'Fabio',
  'Jana',
  'Timo',
  'Carla',
  'Samir',
  'Ronja',
  'Dario',
  'Livia',
  'Marco'
];
const LAST = ['B.', 'K.', 'M.', 'S.', 'W.', 'F.', 'G.', 'H.', 'R.', 'T.'];
/** How many invented crews each area gets, in the order of areas.json; the last ones stay too small to be shown. */
const CREWS = [19, 14, 11, 9, 7, 3, 2];

interface OwnLine {
  miles: number;
  week?: string;
  weekStart: number;
  area?: string;
  compass: boolean;
  showName: boolean;
}

function readOwn(): OwnLine | undefined {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as OwnLine) : undefined;
  } catch {
    return undefined;
  }
}

function writeOwn(own: OwnLine | undefined): void {
  try {
    if (own) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(own));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The demo simply forgets the line on reload.
  }
}

const wait = <T>(value: T): Promise<T> => new Promise((resolve) => window.setTimeout(() => resolve(value), 300));

/** The demo regatta: invented crews in every area, plus the visitor's own line, kept in this browser. */
export function sampleRegatta(content: ContentBundle): RegattaSource {
  const crews = (): RegattaEntry[] => {
    const next = random(7);
    const week = weekKey(new Date());
    const entries: RegattaEntry[] = [];
    (content.areas || []).forEach((area, index) => {
      // Each area sails at its own pace, so the comparison has something to show.
      const pace = 0.65 + next() * 0.7;
      for (let i = 0; i < (CREWS[index] || 2); i++) {
        const miles = Math.round(Math.pow(next(), 1.7) * 4800 * pace) + 40;
        const sailed = next() < 0.3 ? 0 : Math.round(Math.pow(next(), 1.5) * 460 * pace);
        entries.push({
          area: area.id,
          miles,
          week,
          weekStart: Math.max(0, miles - sailed),
          compass: miles > 900 && next() < 0.8,
          name: next() < 0.4 ? `${FIRST[Math.floor(next() * FIRST.length)]} ${LAST[Math.floor(next() * LAST.length)]}` : undefined,
          mine: false
        });
      }
    });
    return entries;
  };

  return {
    sample: true,
    load: () => {
      const own = readOwn();
      const entries = crews();
      // The visitor has no name in the demo; the view writes «Du» for the own line.
      if (own) entries.push({ area: own.area, miles: own.miles, week: own.week, weekStart: own.weekStart, compass: own.compass, name: undefined, mine: true });
      return wait(entries);
    },
    report: (report: RegattaReport) => {
      const weekStart = weekStartFor(readOwn(), report);
      writeOwn({ miles: report.miles, week: report.week, weekStart, area: report.area, compass: report.compass, showName: report.showName });
      return wait(undefined);
    },
    leave: () => {
      writeOwn(undefined);
      return wait(undefined);
    }
  };
}
