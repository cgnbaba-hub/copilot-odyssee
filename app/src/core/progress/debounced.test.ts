import { DebouncedProgressStore } from './debounced';
import { initialState, PlayerState } from './state';
import { ProgressStore } from './store';

class RecordingStore implements ProgressStore {
  public saved: number[] = [];
  public load(): Promise<PlayerState | undefined> {
    return Promise.resolve(undefined);
  }
  public save(state: PlayerState): Promise<void> {
    this.saved.push(state.xp);
    return Promise.resolve();
  }
  public clear(): Promise<void> {
    return Promise.resolve();
  }
}

describe('DebouncedProgressStore', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('writes only the latest of quick successive saves', async () => {
    const inner = new RecordingStore();
    const store = new DebouncedProgressStore(inner, 1000);
    await store.save({ ...initialState('de'), xp: 1 });
    await store.save({ ...initialState('de'), xp: 2 });
    await store.save({ ...initialState('de'), xp: 3 });
    expect(inner.saved).toEqual([]);

    jest.advanceTimersByTime(1000);
    await store.flush();
    expect(inner.saved).toEqual([3]);
  });

  it('writes immediately on flush', async () => {
    const inner = new RecordingStore();
    const store = new DebouncedProgressStore(inner, 1000);
    await store.save({ ...initialState('de'), xp: 7 });
    await store.flush();
    expect(inner.saved).toEqual([7]);
    jest.advanceTimersByTime(1000);
    await store.flush();
    expect(inner.saved).toEqual([7]);
  });

  it('reports pending, saving and saved', async () => {
    const store = new DebouncedProgressStore(new RecordingStore(), 1000);
    const seen: string[] = [];
    store.subscribe((status) => seen.push(status));
    await store.save({ ...initialState('de'), xp: 1 });
    await store.flush();
    await Promise.resolve();
    expect(seen).toEqual(['pending', 'saving', 'saved']);
  });
});
