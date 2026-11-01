import { ContentBundle, LearningModule, QuizBlock } from '../content/types';
import { answerReview, dayKey, dueReviews, nextReviewDay, reviewOffered, scheduleReview, snoozeReview } from './review';
import { REVIEW_XP } from './rewards';
import { initialState } from './state';

const text = { de: 'x', en: 'x' };
const quiz: QuizBlock = {
  type: 'quiz',
  id: 'q1',
  difficulty: 'beginner',
  question: text,
  options: [
    { id: 'a', text, correct: true },
    { id: 'b', text, correct: false }
  ]
};
const module: LearningModule = {
  id: 'm1',
  island: 'i1',
  order: 1,
  version: '1',
  owner: 'x',
  status: 'active',
  title: text,
  summary: text,
  estimatedMinutes: 5,
  blocks: [quiz]
} as LearningModule;
const content: ContentBundle = { islands: [], modules: [module] };

const monday = new Date(2026, 10, 2, 9, 0);
const later = (days: number): Date => new Date(2026, 10, 2 + days, 9, 0);

describe('brushing up', () => {
  it('brings a wrong answer back after three days', () => {
    const state = scheduleReview(initialState('de'), 'm1', 'q1', monday);
    expect(dueReviews(state, content, later(2))).toHaveLength(0);
    expect(nextReviewDay(state, content, later(2))).toBe(dayKey(later(3)));
    expect(dueReviews(state, content, later(3)).map((r) => r.key)).toEqual(['m1/q1']);
  });

  it('keeps the date of a question already waiting', () => {
    const first = scheduleReview(initialState('de'), 'm1', 'q1', monday);
    const again = scheduleReview(first, 'm1', 'q1', later(2));
    expect(again).toBe(first);
  });

  it('retires a question after two right answers in a row and pays for each', () => {
    let state = scheduleReview(initialState('de'), 'm1', 'q1', monday);
    const one = answerReview(state, 'm1/q1', true, later(3));
    expect(one.xpGained).toBe(REVIEW_XP);
    state = one.state;
    expect(state.reviews && state.reviews['m1/q1']).toEqual({ due: dayKey(later(13)), step: 1 });
    state = answerReview(state, 'm1/q1', true, later(13)).state;
    expect(state.reviews).toEqual({});
  });

  it('starts over after a wrong answer, without miles', () => {
    let state = scheduleReview(initialState('de'), 'm1', 'q1', monday);
    state = answerReview(state, 'm1/q1', true, later(3)).state;
    const wrong = answerReview(state, 'm1/q1', false, later(13));
    expect(wrong.xpGained).toBe(0);
    expect(wrong.state.reviews && wrong.state.reviews['m1/q1']).toEqual({ due: dayKey(later(16)), step: 0 });
  });

  it('leaves out questions that are no longer in the content', () => {
    const state = scheduleReview(initialState('de'), 'm1', 'weg', monday);
    expect(dueReviews(state, content, later(5))).toHaveLength(0);
  });

  it('is offered when something is due, unless the player said not today', () => {
    const state = scheduleReview(initialState('de'), 'm1', 'q1', monday);
    expect(reviewOffered(state, content, later(3))).toBe(true);
    const snoozed = snoozeReview(state, later(3));
    expect(reviewOffered(snoozed, content, later(3))).toBe(false);
    expect(reviewOffered(snoozed, content, later(4))).toBe(true);
  });

  it('can be due at once, as in the demo, but a wrong review waits until tomorrow', () => {
    const state = scheduleReview(initialState('de'), 'm1', 'q1', monday, [0, 3]);
    expect(dueReviews(state, content, monday)).toHaveLength(1);
    const wrong = answerReview(state, 'm1/q1', false, monday, [0, 3]).state;
    expect(dueReviews(wrong, content, monday)).toHaveLength(0);
    expect(dueReviews(wrong, content, later(1))).toHaveLength(1);
  });
});
