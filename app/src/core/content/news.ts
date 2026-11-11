import { getModule, PlayerState } from '../progress/state';
import { ContentFilter, findIsland, isModuleVisible } from './bundle';
import { ContentBundle, Island, LearningModule, ModuleChange } from './types';

/**
 * News for a player: stages that were added or changed since they last
 * looked. Copilot changes every month, so the content does too; this is how
 * people who are already through hear about it.
 */

/** Changes older than this are no longer news. */
export const NEWS_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NewsItem {
  module: LearningModule;
  island?: Island;
  change: ModuleChange;
  /** The player completed the stage before it changed. */
  completedBefore: boolean;
}

function day(date: Date): string {
  const pad = (n: number): string => `0${n}`.slice(-2);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Day of the player's first completed stage; undefined for someone who has not finished one yet. */
function firstDay(state: PlayerState): string | undefined {
  const days = Object.keys(state.modules)
    .map((id) => state.modules[id].firstCompletedAt)
    .filter((iso): iso is string => !!iso)
    .map((iso) => day(new Date(iso)))
    .sort();
  return days[0];
}

/**
 * Newest first. A change is news when it came after the player last put the
 * news aside, or, for someone who never did, after their first completed
 * stage. People who have just started see none: for them everything is new.
 */
export function newsFor(content: ContentBundle, state: PlayerState, filter: ContentFilter, now: Date): NewsItem[] {
  const since = state.profile.newsSeen || firstDay(state);
  if (!since) return [];
  const oldest = day(new Date(now.getTime() - NEWS_DAYS * DAY_MS));
  const today = day(now);
  const items: NewsItem[] = [];
  content.modules.forEach((module) => {
    if (!isModuleVisible(module, filter)) return;
    // Only the latest change of a stage is shown.
    const latest = (module.changes || []).filter((c) => c.date > since && c.date >= oldest && c.date <= today).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!latest) return;
    const completedAt = getModule(state, module.id).firstCompletedAt;
    items.push({ module, island: findIsland(content, module.island), change: latest, completedBefore: !!completedAt && day(new Date(completedAt)) < latest.date });
  });
  return items.sort((a, b) => (a.change.date < b.change.date ? 1 : a.change.date > b.change.date ? -1 : a.module.order - b.module.order));
}

/** The day to store once the player has seen the news. */
export function newsSeenDay(now: Date): string {
  return day(now);
}
