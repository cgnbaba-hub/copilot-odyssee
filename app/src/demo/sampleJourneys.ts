import { sortedIslands } from '../core/content/bundle';
import { ContentBundle, Localized } from '../core/content/types';
import { PlayerState } from '../core/progress/state';
import { playedState } from '../core/progress/testState';

/**
 * Journeys to load in the demo, so the app can be shown in a few minutes
 * without playing for hours: the passport half full, the Basic badge just
 * earned, or everything done. They are played through the real game rules.
 */
export interface SampleJourney {
  id: string;
  label: Localized;
  build: () => PlayerState;
}

/** Use cases as colleagues might write them; the test helper's texts are made long on purpose. */
const USE_CASES = [
  [
    'Wochenbericht fürs Team aus Notizen und Mails zusammenstellen',
    'Fasse meine Notizen und die Mails dieser Woche zu einem Wochenbericht mit drei Abschnitten zusammen: Erreicht, Offen, Nächste Woche.'
  ],
  ['Lange Partner-Mails vor dem Lesen zusammenfassen', 'Fasse diese Mail in drei Stichpunkten zusammen und nenne, was ich bis wann tun muss.'],
  ['Angebotstexte für Gäste freundlicher formulieren', 'Überarbeite diesen Angebotstext: klarer, kürzer und herzlich. Behalte alle Fakten. In Schweizer Hochdeutsch.'],
  ['Protokoll aus Stichworten der Teamsitzung schreiben', 'Mach aus diesen Stichworten ein Protokoll mit Beschlüssen und Aufgaben samt verantwortlicher Person.'],
  ['Reiseprogramm aus Notizen der Inforeise entwerfen', 'Entwirf aus meinen Notizen ein Reiseprogramm für fünf Tage mit Highlights pro Tag.'],
  ['Häufige Kundenfragen einheitlich beantworten', 'Erstelle Antworten auf diese zehn häufigen Fragen, je höchstens drei Sätze, freundlich und klar.']
];

function tidy(state: PlayerState): PlayerState {
  return {
    ...state,
    useCases: state.useCases.map((card, i) => ({
      ...card,
      task: USE_CASES[i % USE_CASES.length][0],
      prompt: USE_CASES[i % USE_CASES.length][1],
      minutesPerTime: 20 + (i % 3) * 10
    }))
  };
}

export function sampleJourneys(content: ContentBundle): SampleJourney[] {
  const filter = { showDrafts: true };
  const islands = sortedIslands(content);
  const basic = islands.filter((i) => i.license === 'basic').map((i) => i.id);
  return [
    { id: 'underway', label: { de: 'Unterwegs: drei Inseln geschafft', en: 'Under way: three islands done' }, build: () => tidy(playedState(content, filter, basic.slice(0, 3))) },
    { id: 'basic', label: { de: 'Basic-Abzeichen frisch verdient', en: 'Basic badge just earned' }, build: () => tidy(playedState(content, filter, basic)) },
    { id: 'all', label: { de: 'Alles geschafft: beide Abzeichen', en: 'All done: both badges' }, build: () => tidy(playedState(content, filter)) }
  ];
}
