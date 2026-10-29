import { modulesOfIsland, sortedIslands } from '../content/bundle';
import { ContentBundle, Localized } from '../content/types';
import { getModule, LicenseChoice, minutesPerMonth, PlayerState } from '../progress/state';

/**
 * Figures for the evaluation view. Everything is counted over all players;
 * no figure points to a single person, and breakdowns with fewer than
 * MIN_GROUP people are hidden.
 */

/** Smallest group that is shown on its own. */
export const MIN_GROUP = 5;

export interface PlayerRecord {
  state: PlayerState;
  /** When the saved state last changed (ISO date). */
  modified?: string;
}

export interface FeedbackRecord {
  /** Kind as stored in the list, e.g. "Idee oder Wunsch". */
  kind: string;
  message: string;
  context?: string;
  profile?: string;
  created: string;
}

export interface AdminData {
  players: PlayerRecord[];
  feedback: FeedbackRecord[];
}

export interface CountRow {
  id: string;
  count: number;
}

export interface IslandStats {
  islandId: string;
  name: Localized;
  /** Players with at least one stage of the island started. */
  started: number;
  /** Players who completed every stage of the island. */
  completed: number;
}

export interface ModuleStats {
  moduleId: string;
  islandId: string;
  title: Localized;
  started: number;
  completed: number;
  /** Started but never completed. */
  open: number;
  /** Average mission rating (1–5), only with at least MIN_GROUP ratings. */
  rating?: number;
  ratingCount: number;
}

export interface Stats {
  /** Players who finished the onboarding. */
  participants: number;
  /** Players whose state changed in the last 30 days. */
  active30: number;
  stagesCompleted: number;
  useCases: number;
  /** Minutes per month that the collected use cases take today. */
  useCaseMinutesPerMonth: number;
  feedback: number;
  licenses: Record<LicenseChoice, number>;
  /** By area; areas with fewer than MIN_GROUP players are folded into "small". */
  areas: CountRow[];
  /** Players in areas too small to show on their own. */
  smallAreas: number;
  islands: IslandStats[];
  modules: ModuleStats[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStats(content: ContentBundle, data: AdminData, now: Date, options: { showDrafts: boolean } = { showDrafts: false }): Stats {
  const players = data.players.filter((p) => p.state && p.state.profile && p.state.profile.onboarded);
  const states = players.map((p) => p.state);

  const licenses: Record<LicenseChoice, number> = { basic: 0, premium: 0, unknown: 0 };
  states.forEach((s) => {
    const license = s.profile.license;
    licenses[license in licenses ? license : 'unknown'] += 1;
  });

  const areaCounts: { [id: string]: number } = {};
  states.forEach((s) => {
    const id = s.profile.area || 'none';
    areaCounts[id] = (areaCounts[id] || 0) + 1;
  });
  const areas: CountRow[] = [];
  let smallAreas = 0;
  Object.keys(areaCounts).forEach((id) => {
    if (areaCounts[id] >= MIN_GROUP) areas.push({ id, count: areaCounts[id] });
    else smallAreas += areaCounts[id];
  });
  areas.sort((a, b) => b.count - a.count);

  const islands: IslandStats[] = [];
  const modules: ModuleStats[] = [];
  sortedIslands(content).forEach((island) => {
    const islandModules = modulesOfIsland(content, island.id, options);
    islandModules.forEach((module) => {
      let started = 0;
      let completed = 0;
      const ratings: number[] = [];
      states.forEach((s) => {
        const progress = getModule(s, module.id);
        if (progress.started > 0 || progress.completed > 0) started += 1;
        if (progress.completed > 0) completed += 1;
        module.blocks
          .filter((b) => b.type === 'mission')
          .forEach((b) => {
            const block = s.blocks[`${module.id}/${b.id}`];
            if (block && typeof block.rating === 'number') ratings.push(block.rating);
          });
      });
      const rating = ratings.length >= MIN_GROUP ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : undefined;
      modules.push({ moduleId: module.id, islandId: island.id, title: module.title, started, completed, open: started - completed, rating, ratingCount: ratings.length });
    });
    islands.push({
      islandId: island.id,
      name: island.name,
      started: states.filter((s) => islandModules.some((m) => getModule(s, m.id).started > 0 || getModule(s, m.id).completed > 0)).length,
      completed: islandModules.length === 0 ? 0 : states.filter((s) => islandModules.every((m) => getModule(s, m.id).completed > 0)).length
    });
  });

  const cutoff = now.getTime() - 30 * DAY_MS;
  return {
    participants: states.length,
    active30: players.filter((p) => p.modified && new Date(p.modified).getTime() >= cutoff).length,
    stagesCompleted: modules.reduce((sum, m) => sum + m.completed, 0),
    useCases: states.reduce((sum, s) => sum + s.useCases.length, 0),
    useCaseMinutesPerMonth: states.reduce((sum, s) => sum + s.useCases.reduce((m, card) => m + minutesPerMonth(card), 0), 0),
    feedback: data.feedback.length,
    licenses,
    areas,
    smallAreas,
    islands,
    modules
  };
}

function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? '' : String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Semicolon-separated, as Excel expects it in Switzerland. */
export function toCsv(header: string[], rows: (string | number | undefined)[][]): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n');
}
