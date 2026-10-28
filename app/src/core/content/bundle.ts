import { ContentBundle, Island, LearningModule, License } from './types';

export interface ContentFilter {
  /** Show modules with status "draft" (pilot and demo). */
  showDrafts: boolean;
}

/** Islands in route order. */
export function sortedIslands(content: ContentBundle): Island[] {
  return content.islands.slice().sort((a, b) => a.order - b.order);
}

export function findIsland(content: ContentBundle, islandId: string): Island | undefined {
  return content.islands.filter((i) => i.id === islandId)[0];
}

export function findModule(content: ContentBundle, moduleId: string): LearningModule | undefined {
  return content.modules.filter((m) => m.id === moduleId)[0];
}

export function isModuleVisible(module: LearningModule, filter: ContentFilter): boolean {
  if (module.status === 'deprecated') return false;
  if (module.status === 'draft') return filter.showDrafts;
  return true;
}

/** Visible modules of an island in order. */
export function modulesOfIsland(content: ContentBundle, islandId: string, filter: ContentFilter): LearningModule[] {
  return content.modules
    .filter((m) => m.island === islandId && isModuleVisible(m, filter))
    .sort((a, b) => a.order - b.order);
}

/** A module's own licence wins over its island's. */
export function moduleLicense(content: ContentBundle, module: LearningModule): License {
  if (module.license) return module.license;
  const island = findIsland(content, module.island);
  return island ? island.license : 'basic';
}
