import { ContentFilter, modulesOfIsland } from '../content/bundle';
import { ContentBundle } from '../content/types';
import { passportStamps } from './achievements';
import { PlayerState } from './state';

/**
 * How far the player is through the course, by licence tier. Derived from
 * the passport stamps, so an island counts once all its stages are done and
 * its exam is passed. Used for the LMS status and later for badges.
 */

export interface TierCompletion {
  /** Islands of the tier with a passport stamp. */
  done: number;
  /** Islands of the tier with at least one visible stage. */
  total: number;
  complete: boolean;
}

export interface CourseCompletion {
  /** Islands for everyone. */
  basic: TierCompletion;
  /** Every island: premium includes the basic ones. */
  premium: TierCompletion;
  /** Rounded share of basic islands done, 0–100. */
  percentBasic: number;
}

function tier(islandIds: string[], stamped: string[]): TierCompletion {
  const done = islandIds.filter((id) => stamped.indexOf(id) >= 0).length;
  return { done, total: islandIds.length, complete: islandIds.length > 0 && done === islandIds.length };
}

export function courseCompletion(content: ContentBundle, state: PlayerState, filter: ContentFilter): CourseCompletion {
  const stamped = passportStamps(content, state, filter).map((s) => s.islandId);
  // An island without visible stages cannot be finished, so it does not count.
  const playable = content.islands.filter((i) => modulesOfIsland(content, i.id, filter).length > 0);
  const basic = tier(
    playable.filter((i) => i.license === 'basic').map((i) => i.id),
    stamped
  );
  const premium = tier(
    playable.map((i) => i.id),
    stamped
  );
  return { basic, premium, percentBasic: basic.total > 0 ? Math.round((basic.done / basic.total) * 100) : 0 };
}
