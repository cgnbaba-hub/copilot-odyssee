import { NewPinPost, PinboardData, PinboardSource, PinPost } from '../core/pinboard/pinboard';

const STORAGE_KEY = 'odyssee-demo-pinboard';

/** Example posts, so the board is not empty in the demo. */
const SAMPLES: PinPost[] = [
  {
    id: 'beispiel-1',
    title: 'Angebotsmail freundlich kürzen',
    prompt:
      'Kürze diese Angebotsmail auf höchstens 120 Wörter. Behalte Reisedaten, Preis und die Frist für die Buchung, streich Wiederholungen. Ton: herzlich, aber professionell. Hier der Text: [Text einfügen]',
    tool: 'outlook',
    area: 'beratung',
    author: 'Beispiel',
    created: '2026-10-21T09:12:00Z',
    status: 'approved',
    mine: false,
    likes: 12,
    liked: false
  },
  {
    id: 'beispiel-2',
    title: 'Reiseideen nach Kundenwunsch',
    prompt:
      'Ich berate eine Familie mit zwei Kindern ([Alter]), die im [Monat] eine Woche Badeferien am Mittelmeer sucht. Budget [Betrag] CHF, möglichst kurze Flugzeit ab Zürich. Schlage fünf Ziele vor, je mit zwei Sätzen zu Kinderfreundlichkeit und Wetter, als Tabelle.',
    tool: 'chat',
    area: 'beratung',
    created: '2026-10-24T14:30:00Z',
    status: 'approved',
    mine: false,
    likes: 9,
    liked: false
  },
  {
    id: 'beispiel-3',
    title: 'Besprechung nachbereiten',
    prompt:
      'Fasse die Besprechung zusammen: Entscheidungen, offene Fragen und Aufgaben mit verantwortlicher Person und Termin, als Tabelle. Schreib danach einen Entwurf für eine kurze Nachricht an alle Teilnehmenden.',
    tool: 'teams',
    created: '2026-10-27T08:05:00Z',
    status: 'approved',
    mine: false,
    likes: 7,
    liked: false
  },
  {
    id: 'beispiel-4',
    title: 'Social-Media-Post zu einem Angebot',
    prompt:
      'Schreib drei Varianten für einen Instagram-Post zu unserem Angebot [Angebot]. Zielgruppe: Paare ab 50, die Kultur und gutes Essen mögen. Höchstens 60 Wörter, zwei passende Emojis, ein klarer Aufruf zum Buchen.',
    tool: 'chat',
    area: 'marketing',
    author: 'Beispiel',
    created: '2026-10-29T16:40:00Z',
    status: 'approved',
    mine: false,
    likes: 4,
    liked: false
  },
  {
    id: 'beispiel-5',
    title: 'Auffälligkeiten in einer Tabelle finden',
    prompt: 'Welche drei Auffälligkeiten siehst du in dieser Tabelle zu [Thema]? Erkläre jede in einem Satz und schlage ein passendes Diagramm vor.',
    tool: 'excel',
    area: 'produkt',
    created: '2026-10-30T10:20:00Z',
    status: 'approved',
    mine: false,
    likes: 3,
    liked: false
  },
  {
    id: 'beispiel-6',
    title: 'Absage freundlich formulieren',
    prompt: 'Formuliere eine freundliche Absage auf diese Anfrage. Bedanke dich, nenne kurz den Grund und biete eine Alternative an: [Anfrage einfügen]',
    tool: 'outlook',
    area: 'kundendienst',
    created: '2026-10-31T11:00:00Z',
    status: 'pending',
    mine: false,
    likes: 0,
    liked: false
  }
];

function read(): PinPost[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const posts = JSON.parse(saved) as PinPost[];
      if (Array.isArray(posts)) return posts;
    }
  } catch {
    // Falls back to the examples.
  }
  return SAMPLES.map((p) => ({ ...p }));
}

function write(posts: PinPost[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // The demo simply forgets changes on reload.
  }
}

const wait = <T>(value: T): Promise<T> => new Promise((resolve) => window.setTimeout(() => resolve(value), 300));

/** The demo board: example posts, kept in this browser; the visitor is also the editorial team. */
export function samplePinboard(): PinboardSource {
  let posts = read();
  const save = (next: PinPost[]): void => {
    posts = next;
    write(posts);
  };
  return {
    sample: true,
    load: (): Promise<PinboardData> => wait({ posts: posts.map((p) => ({ ...p })), canModerate: true }),
    add: (post: NewPinPost): Promise<void> => {
      const created: PinPost = {
        id: `eigen-${Date.now()}`,
        title: post.title,
        prompt: post.prompt,
        tool: post.tool,
        area: post.area,
        created: new Date().toISOString(),
        status: 'pending',
        mine: true,
        likes: 0,
        liked: false
      };
      save(posts.concat([created]));
      return wait(undefined);
    },
    setLike: (postId: string, liked: boolean): Promise<void> => {
      save(posts.map((p) => (p.id === postId && p.liked !== liked ? { ...p, liked, likes: p.likes + (liked ? 1 : -1) } : p)));
      return wait(undefined);
    },
    moderate: (postId: string, approve: boolean): Promise<void> => {
      save(posts.map((p) => (p.id === postId ? { ...p, status: approve ? 'approved' : 'rejected' } : p)));
      return wait(undefined);
    }
  };
}
