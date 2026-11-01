import { Challenge } from '../content/types';
import { currentChallenge, daysUntilNextWeek, weekKey } from './challenge';

const challenge = (id: string, license: 'basic' | 'premium'): Challenge => ({
  id,
  license,
  title: { de: id, en: id },
  task: { de: id, en: id }
});
const list = [challenge('a', 'basic'), challenge('p', 'premium'), challenge('b', 'basic')];

describe('challenge of the week', () => {
  it('uses the Monday of the week as key', () => {
    expect(weekKey(new Date(2026, 10, 1))).toBe('2026-10-26'); // a Sunday
    expect(weekKey(new Date(2026, 10, 2))).toBe('2026-11-02'); // a Monday
  });

  it('stays the same within a week and changes with the next one', () => {
    const monday = currentChallenge(list, 'premium', new Date(2026, 10, 2));
    expect(currentChallenge(list, 'premium', new Date(2026, 10, 8))).toBe(monday);
    expect(currentChallenge(list, 'premium', new Date(2026, 10, 9))).not.toBe(monday);
  });

  it('shows Basic players only Basic challenges', () => {
    for (let day = 0; day < 60; day += 7) {
      const c = currentChallenge(list, 'basic', new Date(2026, 10, 2 + day));
      expect(c && c.license).toBe('basic');
    }
    expect(currentChallenge([challenge('p', 'premium')], 'basic', new Date())).toBeUndefined();
  });

  it('counts the days until the next challenge', () => {
    expect(daysUntilNextWeek(new Date(2026, 10, 2))).toBe(7);
    expect(daysUntilNextWeek(new Date(2026, 10, 8))).toBe(1);
  });
});
