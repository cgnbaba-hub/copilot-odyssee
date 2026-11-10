import bundle from '../../content/bundle.generated';
import { passportStamps } from '../../core/progress/achievements';
import { initialState, PlayerState } from '../../core/progress/state';
import { playedState } from '../../core/progress/testState';
import { decodeState, encodeState, reduceState, SUSPEND_DATA_LIMIT } from './suspendData';

const filter = { showDrafts: true };

/** The real course played to the end, with brushing-up dates, pinned prompts and challenges on top. */
function fullJourney(): PlayerState {
  const state = playedState(bundle, filter);
  const reviews: PlayerState['reviews'] = {};
  Object.keys(state.blocks).forEach((key, i) => {
    if (i % 3 === 0) reviews[key] = { due: '2026-11-20', step: 1 };
  });
  return { ...state, reviews, savedPrompts: (bundle.prompts || []).map((p) => p.id), challenges: { '2026-10-26': 'a', '2026-11-02': 'b' }, pinsShared: 2 };
}

describe('suspend data', () => {
  it('round-trips a small state without any loss', () => {
    const state: PlayerState = {
      ...initialState('en'),
      xp: 120,
      blocks: { 'm/q': { done: true, attempts: 2, xp: 10, bestScore: 80, rating: 4 } },
      modules: { m: { started: 2, completed: 1, inProgress: true, firstCompletedAt: '2026-10-01T12:30:00.123Z' } },
      useCases: [{ id: 'custom-id', moduleId: 'm', createdAt: '2026-10-01T12:30:00.123Z', task: 'Mails', frequency: 'daily', minutesPerTime: 10, prompt: 'Fasse zusammen' }],
      exams: { a: { passed: false, best: 2, attempts: 1 } },
      reviews: { 'm/q': { due: '2026-10-04', step: 0 } },
      reviewSnoozed: '2026-10-02'
    };
    const encoded = encodeState(state);
    expect(encoded.indexOf('o1:')).toBe(0);
    expect(decodeState(encoded)).toEqual(state);
  });

  it('keeps fields it does not know yet', () => {
    const state = { ...initialState('de'), future: { a: 1 } } as PlayerState;
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it('ignores empty, foreign and broken values', () => {
    expect(decodeState('')).toBeUndefined();
    expect(decodeState('{"version":1}')).toBeUndefined();
    expect(decodeState('o1:not-lz-data')).toBeUndefined();
  });

  it('fits a completed journey through the real course into 4096 characters', () => {
    const state = fullJourney();
    const encoded = encodeState(state);
    expect(encoded.length).toBeLessThanOrEqual(SUSPEND_DATA_LIMIT);

    const restored = decodeState(encoded)!;
    expect(restored.xp).toBe(state.xp);
    expect(passportStamps(bundle, restored, filter)).toEqual(passportStamps(bundle, state, filter));
    expect(passportStamps(bundle, restored, filter)).toHaveLength(bundle.islands.length);
    expect(restored.modules).toEqual(state.modules);
    expect(restored.exams).toEqual(state.exams);
    expect(restored.useCases).toHaveLength(state.useCases.length);
  });

  it('reduces only as far as needed, in order', () => {
    const small = initialState('de');
    expect(reduceState(small)).toBe(small);

    const reduced = reduceState(fullJourney());
    expect(reduced.reviews).toBeUndefined();
    // Every stage is completed, so no step details are left.
    expect(Object.keys(reduced.blocks)).toEqual([]);
    reduced.useCases.forEach((c) => expect(c.prompt.length).toBeLessThanOrEqual(200));
  });

  it('keeps the step details of a stage that is being repeated', () => {
    const state = playedState(bundle, filter);
    const repeated = Object.keys(state.modules)[0];
    const replaying = { ...state, reviews: undefined, modules: { ...state.modules, [repeated]: { ...state.modules[repeated], inProgress: true } } };
    const kept = Object.keys(reduceState(replaying).blocks);
    expect(kept.length).toBeGreaterThan(0);
    kept.forEach((key) => expect(key.indexOf(`${repeated}/`)).toBe(0));
  });
});
