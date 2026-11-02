import { ContentFilter, modulesOfIsland } from '../content/bundle';
import { ContentBundle, IslandExam } from '../content/types';
import { EXAM_XP } from './rewards';
import { getModule, Outcome, PlayerState } from './state';

/**
 * The island exam: after all stages of an island, a few new questions.
 * Enough of them right the first time and the island is complete, which
 * earns its passport stamp. It can be repeated as often as needed.
 */

/** Share of questions that must be right the first time. */
export const EXAM_PASS_SHARE = 0.75;

export interface ExamResult {
  passed: boolean;
  /** Most questions right in one attempt. */
  best: number;
  attempts: number;
  /** ISO date and time of the first pass. */
  passedAt?: string;
}

export function examFor(content: ContentBundle, islandId: string): IslandExam | undefined {
  return (content.exams || []).filter((e) => e.island === islandId)[0];
}

/** Questions needed to pass, e.g. 3 of 4. */
export function examPassMark(total: number): number {
  return Math.ceil(total * EXAM_PASS_SHARE);
}

export function examResult(state: PlayerState, islandId: string): ExamResult | undefined {
  return (state.exams || {})[islandId];
}

export function examPassed(state: PlayerState, islandId: string): boolean {
  const result = examResult(state, islandId);
  return !!result && result.passed;
}

/** The exam opens once every stage of the island is completed. */
export function examOpen(content: ContentBundle, state: PlayerState, islandId: string, filter: ContentFilter): boolean {
  const modules = modulesOfIsland(content, islandId, filter);
  return !!examFor(content, islandId) && modules.length > 0 && modules.every((m) => getModule(state, m.id).completed > 0);
}

/** Records an attempt; the first pass earns the miles. */
export function recordExam(state: PlayerState, islandId: string, right: number, total: number, now: Date): Outcome & { passed: boolean } {
  const before = examResult(state, islandId);
  const passed = total > 0 && right >= examPassMark(total);
  const firstPass = passed && !(before && before.passed);
  const result: ExamResult = {
    passed: passed || (!!before && before.passed),
    best: Math.max(right, before ? before.best : 0),
    attempts: (before ? before.attempts : 0) + 1,
    passedAt: firstPass ? now.toISOString() : before ? before.passedAt : undefined
  };
  const xpGained = firstPass ? EXAM_XP : 0;
  return { state: { ...state, xp: state.xp + xpGained, exams: { ...(state.exams || {}), [islandId]: result } }, xpGained, passed };
}
