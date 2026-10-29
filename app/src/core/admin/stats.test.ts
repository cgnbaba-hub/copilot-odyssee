import { ContentBundle } from '../content/types';
import { initialState, PlayerState } from '../progress/state';
import { computeStats, MIN_GROUP, toCsv } from './stats';

const text = { de: 'x', en: 'x' };
const content: ContentBundle = {
  islands: [{ id: 'a', order: 0, license: 'basic', name: text, tool: text, summary: text, motif: text, map: { x: 1, y: 1 }, color: '#000000' }],
  modules: [
    {
      id: 'm1',
      island: 'a',
      order: 1,
      version: '1.0.0',
      owner: 'team',
      status: 'active',
      title: text,
      summary: text,
      estimatedMinutes: 5,
      blocks: [{ type: 'mission', id: 'mi', title: text, task: text }]
    },
    { id: 'm2', island: 'a', order: 2, version: '1.0.0', owner: 'team', status: 'active', title: text, summary: text, estimatedMinutes: 5, blocks: [] }
  ]
} as ContentBundle;

function player(area: string, done: string[], rating?: number): PlayerState {
  const state: PlayerState = { ...initialState('de'), profile: { lang: 'de', license: 'basic', onboarded: true, area } };
  done.forEach((id) => (state.modules[id] = { started: 1, completed: 1, inProgress: false }));
  if (rating !== undefined) state.blocks['m1/mi'] = { done: true, attempts: 1, xp: 0, rating };
  return state;
}

describe('computeStats', () => {
  const now = new Date('2026-10-29T12:00:00Z');

  it('counts progress over all players and hides small groups', () => {
    const players = [
      ...Array.from({ length: MIN_GROUP }, () => ({ state: player('verkauf', ['m1', 'm2'], 4), modified: '2026-10-28T00:00:00Z' })),
      { state: player('einkauf', ['m1'], 2), modified: '2026-08-01T00:00:00Z' },
      { state: { ...initialState('de') } }
    ];
    const stats = computeStats(content, { players, feedback: [] }, now);
    expect(stats.participants).toBe(MIN_GROUP + 1);
    expect(stats.active30).toBe(MIN_GROUP);
    expect(stats.areas).toEqual([{ id: 'verkauf', count: MIN_GROUP }]);
    expect(stats.smallAreas).toBe(1);
    expect(stats.islands[0]).toMatchObject({ started: MIN_GROUP + 1, completed: MIN_GROUP });
    expect(stats.modules[0]).toMatchObject({ started: MIN_GROUP + 1, completed: MIN_GROUP + 1, open: 0, ratingCount: MIN_GROUP + 1 });
    expect(stats.modules[0].rating).toBeCloseTo((4 * MIN_GROUP + 2) / (MIN_GROUP + 1), 1);
    expect(stats.stagesCompleted).toBe(2 * MIN_GROUP + 1);
  });

  it('shows no average for too few ratings', () => {
    const stats = computeStats(content, { players: [{ state: player('verkauf', ['m1'], 5) }], feedback: [] }, now);
    expect(stats.modules[0].rating).toBeUndefined();
  });
});

describe('toCsv', () => {
  it('quotes cells with separators and quotes', () => {
    expect(toCsv(['A', 'B'], [['x;y', 'sagt "hallo"'], [1, undefined]])).toBe('A;B\r\n"x;y";"sagt ""hallo"""\r\n1;');
  });
});
