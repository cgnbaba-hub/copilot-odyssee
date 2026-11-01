import { LearningModule, QuizBlock } from '../content/types';
import { Lang } from '../i18n/locale';
import { BRIEFING_XP, MISSION_XP, MODULE_BONUS_XP, PROMPT_MAX_XP, QUIZ_XP, USECASE_XP } from './rewards';

/**
 * The player's progress. All functions here are pure: they return a new
 * state and never change the one passed in.
 */

export type LicenseChoice = 'basic' | 'premium' | 'unknown';

export interface Profile {
  lang: Lang;
  license: LicenseChoice;
  onboarded: boolean;
  /** Field of work (id from areas.json); missing until chosen. */
  area?: string;
  /** Companion character; the theme's default when missing. */
  guide?: string;
  /** True once the guided tour of the menu was finished or skipped. */
  toured?: boolean;
  /** Larger text for easier reading; normal when missing. */
  textSize?: 'normal' | 'large';
  /** Fewer animations, in addition to the operating system setting. */
  motion?: 'full' | 'reduced';
}

export interface BlockProgress {
  done: boolean;
  attempts: number;
  /** XP already earned from this block; it is never paid twice. */
  xp: number;
  bestScore?: number;
  rating?: number;
}

export interface ModuleProgress {
  /** How often the module was started; more than once means it was repeated. */
  started: number;
  completed: number;
  inProgress: boolean;
  /** ISO date of the first completion. */
  firstCompletedAt?: string;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'rarely';

export interface UseCaseInput {
  task: string;
  frequency: Frequency;
  minutesPerTime: number;
  prompt: string;
}

export interface UseCaseCard extends UseCaseInput {
  id: string;
  moduleId: string;
  createdAt: string;
}

export interface PlayerState {
  version: 1;
  profile: Profile;
  xp: number;
  blocks: { [key: string]: BlockProgress };
  modules: { [moduleId: string]: ModuleProgress };
  useCases: UseCaseCard[];
  /** Prompt templates the player pinned to the cheat sheet; missing in older saves. */
  savedPrompts?: string[];
  /** Challenges of the week done, by week key (Monday, YYYY-MM-DD) to challenge id; missing in older saves. */
  challenges?: { [week: string]: string };
}

export interface Outcome {
  state: PlayerState;
  xpGained: number;
}

export function initialState(lang: Lang): PlayerState {
  return {
    version: 1,
    profile: { lang, license: 'unknown', onboarded: false },
    xp: 0,
    blocks: {},
    modules: {},
    useCases: []
  };
}

function blockKey(moduleId: string, blockId: string): string {
  return `${moduleId}/${blockId}`;
}

export function getBlock(state: PlayerState, moduleId: string, blockId: string): BlockProgress {
  return state.blocks[blockKey(moduleId, blockId)] || { done: false, attempts: 0, xp: 0 };
}

export function getModule(state: PlayerState, moduleId: string): ModuleProgress {
  return state.modules[moduleId] || { started: 0, completed: 0, inProgress: false };
}

function withBlock(state: PlayerState, moduleId: string, blockId: string, block: BlockProgress, xpGained: number): Outcome {
  const blocks = { ...state.blocks };
  blocks[blockKey(moduleId, blockId)] = block;
  return { state: { ...state, blocks, xp: state.xp + xpGained }, xpGained };
}

export function updateProfile(state: PlayerState, profile: Partial<Profile>): PlayerState {
  return { ...state, profile: { ...state.profile, ...profile } };
}

/**
 * Opens a module. Starting it again after it was completed counts as a
 * repetition and begins a fresh run; XP already earned stays earned.
 */
export function startModule(state: PlayerState, module: LearningModule): PlayerState {
  const progress = getModule(state, module.id);
  if (progress.inProgress) return state;

  const blocks = { ...state.blocks };
  module.blocks.forEach((b) => {
    const key = blockKey(module.id, b.id);
    if (blocks[key]) blocks[key] = { ...blocks[key], done: false, attempts: 0 };
  });
  const modules = { ...state.modules };
  modules[module.id] = { ...progress, started: progress.started + 1, inProgress: true };
  return { ...state, blocks, modules };
}

export function markBriefingRead(state: PlayerState, moduleId: string, blockId: string): Outcome {
  const block = getBlock(state, moduleId, blockId);
  const xpGained = block.xp > 0 ? 0 : BRIEFING_XP;
  return withBlock(state, moduleId, blockId, { ...block, done: true, attempts: block.attempts + 1, xp: block.xp + xpGained }, xpGained);
}

/** Whether the chosen options are exactly the correct ones; a question can have several. */
export function isQuizAnswerCorrect(quiz: QuizBlock, optionIds: string[]): boolean {
  const right = quiz.options.filter((o) => o.correct).map((o) => o.id);
  return optionIds.length === right.length && right.every((id) => optionIds.indexOf(id) >= 0);
}

/** Full XP for a correct first attempt, half for a later one. */
export function answerQuiz(state: PlayerState, moduleId: string, quiz: QuizBlock, answer: string | string[]): Outcome & { correct: boolean } {
  const block = getBlock(state, moduleId, quiz.id);
  const correct = isQuizAnswerCorrect(quiz, typeof answer === 'string' ? [answer] : answer);
  const attempts = block.attempts + 1;

  let xpGained = 0;
  if (correct && block.xp === 0) {
    xpGained = attempts === 1 ? QUIZ_XP[quiz.difficulty] : Math.ceil(QUIZ_XP[quiz.difficulty] / 2);
  }
  const next = { ...block, attempts, done: block.done || correct, xp: block.xp + xpGained };
  return { ...withBlock(state, moduleId, quiz.id, next, xpGained), correct };
}

/** XP follows the best score; a better attempt earns the difference. */
export function submitPrompt(state: PlayerState, moduleId: string, blockId: string, score: number): Outcome {
  const block = getBlock(state, moduleId, blockId);
  const earned = Math.round((Math.max(0, Math.min(100, score)) / 100) * PROMPT_MAX_XP);
  const xpGained = Math.max(0, earned - block.xp);
  const bestScore = Math.max(block.bestScore || 0, score);
  return withBlock(state, moduleId, blockId, { ...block, done: true, attempts: block.attempts + 1, bestScore, xp: block.xp + xpGained }, xpGained);
}

export function completeMission(state: PlayerState, moduleId: string, blockId: string, rating: number): Outcome {
  const block = getBlock(state, moduleId, blockId);
  const xpGained = block.xp > 0 ? 0 : MISSION_XP;
  return withBlock(state, moduleId, blockId, { ...block, done: true, attempts: block.attempts + 1, rating, xp: block.xp + xpGained }, xpGained);
}

export function saveUseCase(state: PlayerState, moduleId: string, blockId: string, input: UseCaseInput, now: Date): Outcome {
  const block = getBlock(state, moduleId, blockId);
  const xpGained = block.xp > 0 ? 0 : USECASE_XP;
  const card: UseCaseCard = { ...input, id: `${moduleId}-${now.getTime()}`, moduleId, createdAt: now.toISOString() };
  const outcome = withBlock(state, moduleId, blockId, { ...block, done: true, attempts: block.attempts + 1, xp: block.xp + xpGained }, xpGained);
  return { ...outcome, state: { ...outcome.state, useCases: outcome.state.useCases.concat([card]) } };
}

export function isModuleDone(state: PlayerState, module: LearningModule): boolean {
  return module.blocks.every((b) => getBlock(state, module.id, b.id).done);
}

/** Closes the current run once every block is done; the bonus is paid only the first time. */
export function finishModule(state: PlayerState, module: LearningModule, now: Date): Outcome {
  const progress = getModule(state, module.id);
  if (!progress.inProgress || !isModuleDone(state, module)) return { state, xpGained: 0 };

  const first = progress.completed === 0;
  const xpGained = first ? MODULE_BONUS_XP : 0;
  const modules = { ...state.modules };
  modules[module.id] = {
    ...progress,
    completed: progress.completed + 1,
    inProgress: false,
    firstCompletedAt: first ? now.toISOString() : progress.firstCompletedAt
  };
  return { state: { ...state, modules, xp: state.xp + xpGained }, xpGained };
}

/** Index of the first block not done yet in the current run. */
export function nextBlockIndex(state: PlayerState, module: LearningModule): number {
  for (let i = 0; i < module.blocks.length; i++) {
    if (!getBlock(state, module.id, module.blocks[i].id).done) return i;
  }
  return module.blocks.length;
}

export type ModuleStatusForPlayer = 'new' | 'inProgress' | 'completed';

export function moduleStatus(state: PlayerState, module: LearningModule): ModuleStatusForPlayer {
  const progress = getModule(state, module.id);
  if (progress.inProgress) return 'inProgress';
  return progress.completed > 0 ? 'completed' : 'new';
}

/** Working days are assumed for "daily". */
const TIMES_PER_MONTH: Record<Frequency, number> = { daily: 20, weekly: 4, monthly: 1, rarely: 0.5 };

/** Time a use case currently takes per month: the potential Copilot works on. */
export function minutesPerMonth(card: UseCaseInput): number {
  return Math.round(card.minutesPerTime * TIMES_PER_MONTH[card.frequency]);
}

export function isPromptSaved(state: PlayerState, promptId: string): boolean {
  return (state.savedPrompts || []).indexOf(promptId) >= 0;
}

/** Pins a prompt template to the cheat sheet, or removes it again. */
export function toggleSavedPrompt(state: PlayerState, promptId: string): PlayerState {
  const saved = state.savedPrompts || [];
  const next = isPromptSaved(state, promptId) ? saved.filter((id) => id !== promptId) : saved.concat([promptId]);
  return { ...state, savedPrompts: next };
}

/** Seemeilen for the challenge of the week, paid once per week. */
export const CHALLENGE_XP = 50;

export function completeChallenge(state: PlayerState, week: string, challengeId: string): Outcome {
  const done = state.challenges || {};
  if (done[week]) return { state, xpGained: 0 };
  return { state: { ...state, xp: state.xp + CHALLENGE_XP, challenges: { ...done, [week]: challengeId } }, xpGained: CHALLENGE_XP };
}
