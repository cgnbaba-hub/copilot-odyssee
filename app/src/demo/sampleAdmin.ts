import { modulesOfIsland, sortedIslands } from '../core/content/bundle';
import { AdminSource } from '../core/admin/source';
import { AdminData, FeedbackRecord, PlayerRecord } from '../core/admin/stats';
import { ContentBundle } from '../core/content/types';
import { Frequency, initialState, LicenseChoice, PlayerState } from '../core/progress/state';

/** Small deterministic random generator, so the sample looks the same on every load. */
function random(seed: number): () => number {
  let h = seed;
  return () => {
    h = (h * 1664525 + 1013904223) % 4294967296;
    return h / 4294967296;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];

/** Invented players and feedback, so the evaluation can be tried in the demo. */
export function sampleAdminData(content: ContentBundle, now: Date): AdminData {
  const next = random(42);
  const islands = sortedIslands(content);
  const areas = content.areas || [];
  const players: PlayerRecord[] = [];

  for (let i = 0; i < 64; i++) {
    const roll = next();
    const license: LicenseChoice = roll < 0.55 ? 'basic' : roll < 0.9 ? 'premium' : 'unknown';
    const area = areas.length ? areas[Math.floor(Math.pow(next(), 1.6) * areas.length)].id : undefined;
    const state: PlayerState = { ...initialState('de'), profile: { lang: 'de', license, onboarded: true, area } };
    // Players get less far the further an island lies on the route.
    let keepGoing = true;
    islands.forEach((island, index) => {
      if (island.license === 'premium' && license !== 'premium') return;
      // Premium users often jump to the island of the app they use most.
      if (island.license === 'premium' && next() < 0.45) keepGoing = true;
      modulesOfIsland(content, island.id, { showDrafts: true }).forEach((module) => {
        if (!keepGoing) return;
        const chance = 0.9 - index * 0.05;
        if (next() > chance) {
          keepGoing = false;
          if (next() < 0.85) state.modules[module.id] = { started: 1, completed: 0, inProgress: true };
          return;
        }
        state.modules[module.id] = { started: 1, completed: 1, inProgress: false, firstCompletedAt: new Date(now.getTime() - next() * 40 * DAY_MS).toISOString() };
        module.blocks
          .filter((b) => b.type === 'mission')
          .forEach((b) => {
            state.blocks[`${module.id}/${b.id}`] = { done: true, attempts: 1, xp: 30, rating: 3 + Math.round(next() * 2) };
          });
      });
    });
    const areaDef = areas.filter((a) => a.id === area)[0];
    const cards = Math.floor(next() * 3);
    for (let c = 0; c < cards; c++) {
      const idea = areaDef ? areaDef.useCaseIdeas[c % areaDef.useCaseIdeas.length].de : 'Mails zusammenfassen';
      state.useCases.push({
        id: `u${i}-${c}`,
        moduleId: 'ithaka-erste-karte',
        createdAt: now.toISOString(),
        task: idea,
        frequency: FREQUENCIES[Math.floor(next() * FREQUENCIES.length)],
        minutesPerTime: 10 + Math.round(next() * 50),
        prompt: ''
      });
    }
    players.push({ state, modified: new Date(now.getTime() - Math.pow(next(), 2) * 70 * DAY_MS).toISOString() });
  }

  const ago = (days: number): string => new Date(now.getTime() - days * DAY_MS).toISOString();
  const feedback: FeedbackRecord[] = [
    { kind: 'Idee oder Wunsch', message: 'Eine Etappe zu Copilot in OneNote wäre toll.', context: 'Startseite', profile: 'de · premium · beratung', created: ago(1) },
    {
      kind: 'Inhalt falsch oder unklar',
      message: 'In meinem Outlook heisst der Knopf anders als beschrieben.',
      context: 'Etappe «Mails verstehen und beantworten»',
      profile: 'de · basic · kundendienst',
      created: ago(2)
    },
    { kind: 'Lob', message: 'Die Prompt-Werkstatt hat mir sehr geholfen. Danke!', context: 'Insel Insel des Aiolos', profile: 'de · basic · produkt', created: ago(4) },
    {
      kind: 'Etwas funktioniert nicht',
      message: 'Auf dem Handy war der Knopf «Prüfen» kurz verdeckt.',
      context: 'Etappe «Gute Prompts schreiben»',
      profile: 'de · basic · marketing',
      created: ago(6)
    },
    { kind: 'Idee oder Wunsch', message: 'Mehr Beispiele für Offerten an Firmenkunden, bitte.', context: 'Spickzettel', profile: 'de · premium · beratung', created: ago(9) }
  ];
  return { players, feedback };
}

export function sampleAdminSource(content: ContentBundle): AdminSource {
  return { sample: true, load: () => Promise.resolve(sampleAdminData(content, new Date())) };
}
