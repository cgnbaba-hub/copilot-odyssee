import { modulesOfIsland, sortedIslands } from '../core/content/bundle';
import { Island } from '../core/content/types';
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

/** Premium islands are a preview for everyone without the add-on licence. */
export function isPreview(game: Game, island: Island): boolean {
  return island.license === 'premium' && game.player.profile.license !== 'premium';
}

/** First island on the route that still has open stages and is not a preview. */
export function nextStop(game: Game): Island | undefined {
  return sortedIslands(game.content).filter((island) => {
    const progress = islandProgress(game, island.id);
    return !isPreview(game, island) && progress.total > progress.completed;
  })[0];
}
