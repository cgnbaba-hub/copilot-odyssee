import { initialState } from './state';
import { LocalStorageProgressStore } from './store';

describe('LocalStorageProgressStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips the player state', async () => {
    const store = new LocalStorageProgressStore('test');
    const state = { ...initialState('en'), xp: 42 };
    await store.save(state);
    expect(await store.load()).toEqual(state);
  });

  it('ignores unreadable or foreign data', async () => {
    window.localStorage.setItem('broken', '{not json');
    window.localStorage.setItem('foreign', JSON.stringify({ version: 99 }));
    expect(await new LocalStorageProgressStore('broken').load()).toBeUndefined();
    expect(await new LocalStorageProgressStore('foreign').load()).toBeUndefined();
  });
});
