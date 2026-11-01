import { ContentBundle, LearningModule, QuizBlock } from '../content/types';
import { REVIEW_XP } from './rewards';
import { blockKey, Outcome, PlayerState } from './state';

/**
 * Brushing up ("Auffrischen"): a quiz question answered wrong comes back
 * after a few days, and once more after a longer pause when it was right.
 * Two right answers in a row and it is learned. Days are local calendar days.
 */

/** Days until the first and the second review. */
export const REVIEW_INTERVALS = [3, 10];
/** Questions per round, so brushing up stays a matter of minutes. */
export const REVIEW_ROUND_SIZE = 5;

export interface DueReview {
  key: string;
  module: LearningModule;
  quiz: QuizBlock;
  due: string;
}

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const pad = (n: number): string => `0${n}`.slice(-2);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function inDays(now: Date, days: number): string {
  const date = new Date(now.getTime());
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/** Remembers a question that was answered wrong; one already waiting keeps its date. */
export function scheduleReview(state: PlayerState, moduleId: string, quizId: string, now: Date, intervals: number[] = REVIEW_INTERVALS): PlayerState {
  const key = blockKey(moduleId, quizId);
  const reviews = state.reviews || {};
  if (reviews[key]) return state;
  return { ...state, reviews: { ...reviews, [key]: { due: inDays(now, intervals[0]), step: 0 } } };
}

/**
 * Records the first answer to a question while brushing up. Right moves it
 * to the next, longer pause or retires it; wrong starts over.
 */
export function answerReview(state: PlayerState, key: string, correct: boolean, now: Date, intervals: number[] = REVIEW_INTERVALS): Outcome {
  const reviews = { ...(state.reviews || {}) };
  const entry = reviews[key];
  if (!entry) return { state, xpGained: 0 };
  if (!correct) {
    // At least until tomorrow, so the same question is not offered again right after the round.
    reviews[key] = { due: inDays(now, Math.max(1, intervals[0])), step: 0 };
    return { state: { ...state, reviews }, xpGained: 0 };
  }
  const step = entry.step + 1;
  if (step >= intervals.length) delete reviews[key];
  else reviews[key] = { due: inDays(now, intervals[step]), step };
  return { state: { ...state, reviews, xp: state.xp + REVIEW_XP }, xpGained: REVIEW_XP };
}

/** Questions still in the content, oldest due date first; `onlyDue` leaves out those not due yet. */
function waiting(state: PlayerState, content: ContentBundle, now: Date, onlyDue: boolean): DueReview[] {
  const today = dayKey(now);
  const result: DueReview[] = [];
  const reviews = state.reviews || {};
  Object.keys(reviews).forEach((key) => {
    const entry = reviews[key];
    if (onlyDue && entry.due > today) return;
    const slash = key.indexOf('/');
    const module = content.modules.filter((m) => m.id === key.slice(0, slash))[0];
    const quiz = module && module.blocks.filter((b) => b.id === key.slice(slash + 1))[0];
    if (module && quiz && quiz.type === 'quiz') result.push({ key, module, quiz, due: entry.due });
  });
  return result.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.key < b.key ? -1 : 1));
}

export function dueReviews(state: PlayerState, content: ContentBundle, now: Date): DueReview[] {
  return waiting(state, content, now, true);
}

/** Day the next question becomes due, when none is due yet. */
export function nextReviewDay(state: PlayerState, content: ContentBundle, now: Date): string | undefined {
  const all = waiting(state, content, now, false);
  return all.length > 0 ? all[0].due : undefined;
}

/** Whether the companion offers brushing up right now. */
export function reviewOffered(state: PlayerState, content: ContentBundle, now: Date): boolean {
  return state.reviewSnoozed !== dayKey(now) && dueReviews(state, content, now).length > 0;
}

/** «Not today»: the offer comes back tomorrow. */
export function snoozeReview(state: PlayerState, now: Date): PlayerState {
  return { ...state, reviewSnoozed: dayKey(now) };
}
