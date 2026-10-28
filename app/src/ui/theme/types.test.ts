import { xpRequiredForLevel } from '../../core/progress/levels';
import { odysseeTheme } from './odyssee';
import { rankProgress } from './types';

describe('rankProgress', () => {
  it('starts as the first rank with progress towards the second', () => {
    const progress = rankProgress(odysseeTheme, 0);
    expect(progress.rank.de).toBe('Reisende:r');
    expect(progress.next && progress.next.de).toBe('Entdecker:in');
    expect(progress.xpToNext).toBe(xpRequiredForLevel(3));
    expect(progress.percent).toBe(0);
  });

  it('reaches the next rank exactly at its threshold', () => {
    expect(rankProgress(odysseeTheme, xpRequiredForLevel(3)).rank.de).toBe('Entdecker:in');
    expect(rankProgress(odysseeTheme, xpRequiredForLevel(3) - 1).rank.de).toBe('Reisende:r');
  });

  it('is complete at the last rank', () => {
    const progress = rankProgress(odysseeTheme, xpRequiredForLevel(30));
    expect(progress.rank.de).toBe('Legende von Ithaka');
    expect(progress.next).toBeUndefined();
    expect(progress.percent).toBe(100);
  });
});
