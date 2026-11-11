import { initialState, PlayerState } from '../progress/state';
import { newsFor } from './news';
import { ContentBundle, ModuleChange } from './types';

const text = (de: string): { de: string; en: string } => ({ de, en: de });
const module = (id: string, changes?: ModuleChange[], status = 'active'): unknown => ({ id, island: 'a', order: 1, status, title: text(id), changes, blocks: [] });
const content = {
  islands: [{ id: 'a', order: 0, name: text('A') }],
  modules: [
    module('alt', [{ date: '2026-08-01', note: text('zu alt') }]),
    module('neu', [{ date: '2026-11-05', note: text('neue Etappe'), new: true }]),
    module('geaendert', [
      { date: '2026-10-20', note: text('erste Änderung') },
      { date: '2026-11-08', note: text('zweite Änderung') }
    ]),
    module('entwurf', [{ date: '2026-11-09', note: text('noch Entwurf') }], 'draft'),
    module('morgen', [{ date: '2026-11-12', note: text('erst morgen') }]),
    module('ohne')
  ]
} as unknown as ContentBundle;
const now = new Date(2026, 10, 11, 10, 0);

function player(done: { [id: string]: string }, newsSeen?: string): PlayerState {
  const state = initialState('de');
  state.profile = { ...state.profile, onboarded: true, newsSeen };
  Object.keys(done).forEach((id) => (state.modules[id] = { started: 1, completed: 1, inProgress: false, firstCompletedAt: `${done[id]}T12:00:00` }));
  return state;
}

describe('newsFor', () => {
  it('shows nothing to someone who has not completed a stage yet', () => {
    expect(newsFor(content, player({}), { showDrafts: false }, now)).toEqual([]);
  });

  it('shows changes since the first completed stage, newest first, one per stage', () => {
    const items = newsFor(content, player({ geaendert: '2026-10-01' }), { showDrafts: false }, now);
    expect(items.map((i) => [i.module.id, i.change.note.de, i.completedBefore])).toEqual([
      ['geaendert', 'zweite Änderung', true],
      ['neu', 'neue Etappe', false]
    ]);
  });

  it('shows only what came after the news was last put aside', () => {
    const items = newsFor(content, player({ geaendert: '2026-10-01' }, '2026-11-06'), { showDrafts: false }, now);
    expect(items.map((i) => i.module.id)).toEqual(['geaendert']);
    expect(newsFor(content, player({ geaendert: '2026-10-01' }, '2026-11-11'), { showDrafts: false }, now)).toEqual([]);
  });

  it('does not call a stage changed for someone who completed it afterwards', () => {
    const items = newsFor(content, player({ ohne: '2026-10-01', geaendert: '2026-11-09' }), { showDrafts: false }, now);
    expect(items.filter((i) => i.module.id === 'geaendert')[0].completedBefore).toBe(false);
  });

  it('includes drafts only where drafts are shown', () => {
    const ids = newsFor(content, player({ ohne: '2026-10-01' }), { showDrafts: true }, now).map((i) => i.module.id);
    expect(ids).toEqual(['entwurf', 'geaendert', 'neu']);
  });
});
