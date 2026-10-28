import { levelFromXp, levelProgress, xpRequiredForLevel } from './levels';

describe('level curve', () => {
  it('grows exponentially', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(100);
    expect(xpRequiredForLevel(3)).toBe(215);
    expect(xpRequiredForLevel(5)).toBe(499);
    expect(xpRequiredForLevel(10)).toBe(1679);
  });

  it('derives the level from XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(1679)).toBe(10);
  });

  it('reports progress within the current level', () => {
    expect(levelProgress(150)).toEqual({ level: 2, current: 50, required: 115 });
  });
});
