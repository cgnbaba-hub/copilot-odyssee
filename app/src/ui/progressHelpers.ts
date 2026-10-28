import { moduleLicense, modulesOfIsland, sortedIslands } from '../core/content/bundle';
import { Island, LearningModule, License } from '../core/content/types';
import { moduleStatus } from '../core/progress/state';
import { Game } from './GameContext';

export interface IslandProgress {
  completed: number;
  total: number;
}

export function islandProgress(game: Game, islandId: string): IslandProgress {
  const modules = modulesOfIsland(game.content, islandId, { showDrafts: game.showDrafts });
  return {
    completed: modules.filter((m) => moduleStatus(game.player, m) === 'completed').length,
    total: modules.length
  };
}

/** Whether the player's licence covers content of the given licence tier. */
export function licenseCovers(game: Game, license: License): boolean {
  return license === 'basic' || game.player.profile.license === 'premium';
}

/** Premium islands are a preview for everyone without the add-on licence. */
export function isPreview(game: Game, island: Island): boolean {
  return !licenseCovers(game, island.license);
}

export function isModulePreview(game: Game, module: LearningModule): boolean {
  return !licenseCovers(game, moduleLicense(game.content, module));
}

export interface NextStage {
  island: Island;
  module: LearningModule;
  /** The player already started this stage. */
  resume: boolean;
}

/**
 * The stage the start screen offers: one already started, otherwise the
 * first open stage along the route that the player's licence covers.
 */
export function nextStage(game: Game): NextStage | undefined {
  const filter = { showDrafts: game.showDrafts };
  const candidates: NextStage[] = [];
  sortedIslands(game.content).forEach((island) => {
    if (isPreview(game, island)) return;
    modulesOfIsland(game.content, island.id, filter).forEach((module) => {
      const status = moduleStatus(game.player, module);
      if (status !== 'completed' && !isModulePreview(game, module)) candidates.push({ island, module, resume: status === 'inProgress' });
    });
  });
  return candidates.filter((c) => c.resume)[0] || candidates[0];
}

/** First island on the route that still has open stages and is not a preview. */
export function nextStop(game: Game): Island | undefined {
  const stage = nextStage(game);
  return stage ? stage.island : undefined;
}
