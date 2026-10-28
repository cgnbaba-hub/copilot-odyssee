import { ContentFilter, findIsland, modulesOfIsland, sortedIslands } from '../content/bundle';
import { ContentBundle } from '../content/types';
import { QUIZ_XP } from './rewards';
import { getBlock, getModule, PlayerState } from './state';

/**
 * Travel rewards derived from the player state, so nothing extra is stored:
 * a passport stamp per island and souvenirs for special moments.
 */

export interface Stamp {
  islandId: string;
  /** ISO date when the last open stage of the island was completed. */
  date: string;
}

/** An island earns its stamp once every visible stage on it is completed. */
export function passportStamps(content: ContentBundle, state: PlayerState, filter: ContentFilter): Stamp[] {
  const stamps: Stamp[] = [];
  sortedIslands(content).forEach((island) => {
    const modules = modulesOfIsland(content, island.id, filter);
    if (modules.length === 0) return;
    const dates = modules.map((m) => getModule(state, m.id).firstCompletedAt);
    if (dates.every((d) => !!d)) {
      stamps.push({ islandId: island.id, date: (dates as string[]).sort()[dates.length - 1] });
    }
  });
  return stamps;
}

export type SouvenirId = 'first-postcard' | 'aeolus-bag' | 'siren-proof' | 'island-hopper' | 'homecoming' | 'second-voyage';

export const SOUVENIR_IDS: SouvenirId[] = ['first-postcard', 'island-hopper', 'aeolus-bag', 'siren-proof', 'homecoming', 'second-voyage'];

function completedModules(content: ContentBundle, state: PlayerState): ContentBundle['modules'] {
  return content.modules.filter((m) => getModule(state, m.id).completed > 0);
}

const CHECKS: Record<SouvenirId, (content: ContentBundle, state: PlayerState) => boolean> = {
  'first-postcard': (content, state) => state.useCases.length > 0,

  'aeolus-bag': (content, state) =>
    Object.keys(state.blocks).some((key) => state.blocks[key].bestScore === 100),

  // Every quiz of a completed stage paid full XP, i.e. it was right on the first try.
  'siren-proof': (content, state) =>
    completedModules(content, state).some((m) => {
      const quizzes = m.blocks.filter((b) => b.type === 'quiz');
      return quizzes.length > 0 && quizzes.every((q) => q.type === 'quiz' && getBlock(state, m.id, q.id).xp === QUIZ_XP[q.difficulty]);
    }),

  'island-hopper': (content, state) => {
    const islands: string[] = [];
    content.modules.forEach((m) => {
      if (getModule(state, m.id).started > 0 && islands.indexOf(m.island) < 0) islands.push(m.island);
    });
    return islands.length >= 3;
  },

  homecoming: (content, state) =>
    completedModules(content, state).some((m) => {
      const island = findIsland(content, m.island);
      return !!island && !!island.home;
    }),

  'second-voyage': (content, state) => Object.keys(state.modules).some((id) => state.modules[id].completed > 1)
};

export function earnedSouvenirs(content: ContentBundle, state: PlayerState): SouvenirId[] {
  return SOUVENIR_IDS.filter((id) => CHECKS[id](content, state));
}
