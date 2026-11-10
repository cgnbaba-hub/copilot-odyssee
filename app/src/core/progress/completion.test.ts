import bundle from '../../content/bundle.generated';
import { ContentBundle, LearningModule, License } from '../content/types';
import { courseCompletion } from './completion';
import { initialState } from './state';
import { playedState } from './testState';

function island(id: string, license: License): ContentBundle['islands'][number] {
  const text = { de: id, en: id };
  return { id, order: 0, license, name: text, tool: text, summary: text, motif: text, map: { x: 0, y: 0 }, color: '#000000' };
}

function module(id: string, islandId: string, status: LearningModule['status'] = 'active'): LearningModule {
  const text = { de: id, en: id };
  return {
    id,
    island: islandId,
    order: 1,
    version: '1.0.0',
    owner: 'test',
    status,
    title: text,
    summary: text,
    estimatedMinutes: 1,
    blocks: [{ type: 'briefing', id: 'b', title: text, body: text }]
  };
}

const content: ContentBundle = {
  islands: [island('a', 'basic'), island('b', 'basic'), island('empty', 'basic'), island('p', 'premium'), island('d', 'premium')],
  modules: [module('a1', 'a'), module('a2', 'a'), module('b1', 'b'), module('p1', 'p'), module('d1', 'd', 'draft')],
  exams: [
    {
      island: 'b',
      questions: [{ type: 'quiz', id: 'e1', difficulty: 'beginner', question: { de: 'e1', en: 'e1' }, options: [{ id: 'a', text: { de: 'a', en: 'a' }, correct: true }] }]
    }
  ]
};
const filter = { showDrafts: false };

describe('courseCompletion', () => {
  it('counts nothing done at the start and skips islands without visible stages', () => {
    expect(courseCompletion(content, initialState('de'), filter)).toEqual({
      basic: { done: 0, total: 2, complete: false },
      premium: { done: 0, total: 3, complete: false },
      percentBasic: 0
    });
    expect(courseCompletion(content, initialState('de'), { showDrafts: true }).premium.total).toBe(4);
  });

  it('counts an island once its stages are done and its exam is passed', () => {
    const state = playedState(content, filter, ['a', 'b']);
    const result = courseCompletion(content, state, filter);
    expect(result.basic).toEqual({ done: 2, total: 2, complete: true });
    expect(result.premium).toEqual({ done: 2, total: 3, complete: false });
    expect(result.percentBasic).toBe(100);

    // Without the passed exam island b has no stamp yet.
    const noExam = { ...state, exams: {} };
    expect(courseCompletion(content, noExam, filter).basic).toEqual({ done: 1, total: 2, complete: false });
    expect(courseCompletion(content, noExam, filter).percentBasic).toBe(50);
  });

  it('is complete for both tiers once every island is done', () => {
    const result = courseCompletion(content, playedState(content, filter), filter);
    expect(result.basic.complete).toBe(true);
    expect(result.premium).toEqual({ done: 3, total: 3, complete: true });
  });

  it('never counts a tier without islands as complete', () => {
    const none: ContentBundle = { islands: [island('empty', 'basic')], modules: [] };
    expect(courseCompletion(none, initialState('de'), filter)).toEqual({
      basic: { done: 0, total: 0, complete: false },
      premium: { done: 0, total: 0, complete: false },
      percentBasic: 0
    });
  });

  it('covers the real content: 7 basic and 12 islands in all', () => {
    const shown = { showDrafts: true };
    const result = courseCompletion(bundle, playedState(bundle, shown), shown);
    expect(result.basic).toEqual({ done: 7, total: 7, complete: true });
    expect(result.premium).toEqual({ done: 12, total: 12, complete: true });
  });
});
