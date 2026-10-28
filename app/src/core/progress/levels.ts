/**
 * Level curve taken over from the prototype's XPService: exponential growth
 * up to level 50, linear up to 100, constant beyond. Rounds instead of the
 * prototype's floor, which turned 99.99… into 99 for level 2.
 */

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 50) return Math.round(100 * ((Math.pow(1.15, level - 1) - 1) / 0.15));
  if (level <= 100) return xpRequiredForLevel(50) + (level - 50) * 3000;
  return xpRequiredForLevel(100) + (level - 100) * 5000;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (level < 200 && xpRequiredForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  /** XP collected within the current level. */
  current: number;
  /** XP the current level needs in total. */
  required: number;
}

export function levelProgress(totalXp: number): LevelProgress {
  const level = levelFromXp(totalXp);
  return {
    level,
    current: totalXp - xpRequiredForLevel(level),
    required: xpRequiredForLevel(level + 1) - xpRequiredForLevel(level)
  };
}
