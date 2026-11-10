import { sortedIslands } from '../../core/content/bundle';
import { BadgeId } from '../../core/progress/badges';
import { useGame } from '../GameContext';
import { Strings } from '../i18n/strings';

export function badgeName(strings: Strings, id: BadgeId): string {
  return id === 'basic' ? strings.badgeBasicName : strings.badgePremiumName;
}

/** Names of the islands a badge covers: the Basic islands, or all of them for Premium. */
export function useCoveredIslands(id: BadgeId): string[] {
  const { content, t } = useGame();
  return sortedIslands(content)
    .filter((i) => id === 'premium' || i.license === 'basic')
    .map((i) => t(i.name));
}
