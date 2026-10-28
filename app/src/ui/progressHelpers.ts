import { moduleLicense, modulesOfIsland, sortedIslands } from '../core/content/bundle';
import { Area, Island, LearningModule, License, PromptTemplate } from '../core/content/types';
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
export function nextStage(game: Game, excludeModuleId?: string): NextStage | undefined {
  const filter = { showDrafts: game.showDrafts };
  const candidates: NextStage[] = [];
  sortedIslands(game.content).forEach((island) => {
    if (isPreview(game, island)) return;
    modulesOfIsland(game.content, island.id, filter).forEach((module) => {
      const status = moduleStatus(game.player, module);
      if (status !== 'completed' && module.id !== excludeModuleId && !isModulePreview(game, module)) candidates.push({ island, module, resume: status === 'inProgress' });
    });
  });
  return candidates.filter((c) => c.resume)[0] || candidates[0];
}

/** First island on the route that still has open stages and is not a preview. */
export function nextStop(game: Game): Island | undefined {
  const stage = nextStage(game);
  return stage ? stage.island : undefined;
}

/** The player's field of work, if chosen and still part of the content. */
export function playerArea(game: Game): Area | undefined {
  const id = game.player.profile.area;
  return (game.content.areas || []).filter((a) => a.id === id)[0];
}

/**
 * Prompt templates for an area plus the general ones (all templates when no
 * area is given). Those the player's Copilot covers come first, and within
 * them the ones made for the area.
 */
export function templatesFor(game: Game, areaId: string | undefined): PromptTemplate[] {
  const rank = (p: PromptTemplate): number => (licenseCovers(game, p.license) ? 0 : 2) + (areaId && p.areas ? 0 : 1);
  return (game.content.prompts || [])
    .filter((p) => !areaId || !p.areas || p.areas.indexOf(areaId) >= 0)
    .map((p, index) => ({ p, index }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.index - b.index)
    .map((x) => x.p);
}
