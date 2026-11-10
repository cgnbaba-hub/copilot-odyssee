import bundle from '../../content/bundle.generated';
import { initialState, PlayerState, updateProfile } from '../../core/progress/state';
import { MemoryProgressStore } from '../../core/progress/store';
import { playedState } from '../../core/progress/testState';
import { fakeApi } from './fakeApi';
import { ScormConnection } from './ScormApi';
import { scormTimespan, ScormProgressStore } from './ScormProgressStore';
import { decodeState, encodeState } from './suspendData';

const filter = { showDrafts: true };
const basicIslands = bundle.islands.filter((i) => i.license === 'basic').map((i) => i.id);

function setup(values: { [element: string]: string } = {}): { api: ReturnType<typeof fakeApi>; local: MemoryProgressStore; store: ScormProgressStore; clock: { now: number } } {
  const api = fakeApi({ 'cmi.core.lesson_status': 'not attempted', ...values });
  const local = new MemoryProgressStore();
  const clock = { now: 1000 };
  const store = new ScormProgressStore(new ScormConnection(api), bundle, filter, { local, now: () => clock.now });
  return { api, local, store, clock };
}

const onboarded: PlayerState = updateProfile(initialState('de'), { license: 'basic', onboarded: true, area: 'sales' });

describe('ScormProgressStore', () => {
  it('loads the state from suspend_data', async () => {
    const { store, local } = setup({ 'cmi.suspend_data': encodeState({ ...onboarded, xp: 77 }) });
    await local.save({ ...onboarded, xp: 1 });
    expect((await store.load())!.xp).toBe(77);
  });

  it('falls back to the browser copy when suspend_data is empty or unreadable', async () => {
    const empty = setup();
    await empty.local.save({ ...onboarded, xp: 5 });
    expect((await empty.store.load())!.xp).toBe(5);

    const broken = setup({ 'cmi.suspend_data': 'garbage' });
    expect(await broken.store.load()).toBeUndefined();
  });

  it('reads the learner name', () => {
    expect(setup({ 'cmi.core.student_name': 'Muster, Anna' }).store.learnerName).toBe('Anna Muster');
    expect(setup({ 'cmi.core.student_name': 'Anna Muster' }).store.learnerName).toBe('Anna Muster');
    expect(setup().store.learnerName).toBeUndefined();
  });

  it('saves the state, status incomplete and the score, then commits', async () => {
    const { api, local, store } = setup();
    const state = playedState(bundle, filter, basicIslands.slice(0, 2));
    await store.save(state);

    expect(await local.load()).toBe(state);
    expect(decodeState(api.values['cmi.suspend_data'])!.xp).toBe(state.xp);
    expect(api.values['cmi.core.lesson_status']).toBe('incomplete');
    expect(api.values['cmi.core.score.raw']).toBe(String(Math.round((2 / basicIslands.length) * 100)));
    expect(api.values['cmi.core.score.min']).toBe('0');
    expect(api.values['cmi.core.score.max']).toBe('100');
    expect(api.calls[api.calls.length - 1]).toBe('commit');
  });

  it('reports completed with score 100 once every basic island is done', async () => {
    const { api, store } = setup();
    await store.save(playedState(bundle, filter, basicIslands));
    expect(api.values['cmi.core.lesson_status']).toBe('completed');
    expect(api.values['cmi.core.score.raw']).toBe('100');
  });

  it('reports a journey finished elsewhere as soon as it is loaded', async () => {
    const { api, store } = setup({ 'cmi.suspend_data': encodeState(playedState(bundle, filter, basicIslands)) });
    await store.load();
    expect(api.values['cmi.core.lesson_status']).toBe('completed');
    expect(api.values['cmi.core.score.raw']).toBe('100');
    expect(api.calls[api.calls.length - 1]).toBe('commit');
  });

  it('names the stage being played as the location', async () => {
    const { api, store } = setup();
    await store.save({ ...onboarded, modules: { 'aiolos-gute-prompts': { started: 1, completed: 0, inProgress: true } } });
    expect(api.values['cmi.core.lesson_location']).toBe('aiolos-gute-prompts');
  });

  it('never downgrades a status the LMS already counts as done', async () => {
    for (const done of ['completed', 'passed']) {
      const { api, store } = setup({ 'cmi.core.lesson_status': done });
      await store.save(onboarded);
      expect(api.values['cmi.core.lesson_status']).toBe(done);
    }
    const { api, store } = setup();
    await store.save(playedState(bundle, filter, basicIslands));
    await store.save(onboarded);
    expect(api.values['cmi.core.lesson_status']).toBe('completed');
  });

  it('clears the saved state but keeps a completed status', async () => {
    const { api, local, store } = setup({ 'cmi.core.lesson_status': 'completed' });
    await store.save(onboarded);
    await store.clear();
    expect(await local.load()).toBeUndefined();
    expect(api.values['cmi.suspend_data']).toBe('');
    expect(api.values['cmi.core.lesson_status']).toBe('completed');
  });

  it('reports the session time and finishes only once', async () => {
    const { api, store, clock } = setup();
    clock.now += (2 * 3600 + 5 * 60 + 9) * 1000;
    store.finish();
    store.finish();
    expect(api.values['cmi.core.session_time']).toBe('0002:05:09');
    expect(api.values['cmi.core.exit']).toBe('suspend');
    expect(api.calls.filter((c) => c === 'finish')).toHaveLength(1);
    expect(api.calls.slice(-2)).toEqual(['commit', 'finish']);

    // A save that comes in after the end stays in the browser and is not sent.
    const sets = api.calls.length;
    await store.save(onboarded);
    expect(api.calls).toHaveLength(sets);
  });

  it('works without an LMS, in the browser only', async () => {
    const local = new MemoryProgressStore();
    const store = new ScormProgressStore(undefined, bundle, filter, { local });
    await store.save(onboarded);
    expect(await store.load()).toBe(onboarded);
    expect(store.learnerName).toBeUndefined();
    store.finish();
    await store.clear();
    expect(await store.load()).toBeUndefined();
  });

  it('formats session times', () => {
    expect(scormTimespan(0)).toBe('0000:00:00');
    expect(scormTimespan(59999)).toBe('0000:00:59');
    expect(scormTimespan((125 * 3600 + 1) * 1000)).toBe('0125:00:01');
  });
});
