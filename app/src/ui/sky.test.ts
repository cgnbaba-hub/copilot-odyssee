import { dayNumber, dayPhase, skyEvent, skyMood, weatherOf } from './sky';

const at = (h: number, m = 0, day = 2): Date => new Date(2026, 10, day, h, m);

describe('sky mood', () => {
  it('follows the time of day', () => {
    expect(dayPhase(at(6))).toBe('dawn');
    expect(dayPhase(at(12))).toBe('day');
    expect(dayPhase(at(18, 30))).toBe('dusk');
    expect(dayPhase(at(23))).toBe('night');
    expect(dayPhase(at(3))).toBe('night');
  });

  it('keeps one weather all day and varies over the days', () => {
    expect(weatherOf(at(7))).toBe(weatherOf(at(22)));
    const week = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((d) => weatherOf(at(12, 0, d)));
    expect(new Set(week).size).toBeGreaterThan(1);
  });

  it('shows no rainbow at night', () => {
    for (let d = 1; d <= 30; d++) expect(skyMood(at(23, 0, d)).weather).not.toBe('rainbow');
  });

  it('counts whole days', () => {
    expect(dayNumber(at(23, 0, 3)) - dayNumber(at(1, 0, 2))).toBe(1);
  });

  it('celebrates National Day, New Year and Advent', () => {
    expect(skyEvent(new Date(2026, 7, 1))).toBe('nationalday');
    expect(skyEvent(new Date(2026, 11, 31))).toBe('newyear');
    expect(skyEvent(new Date(2027, 0, 1))).toBe('newyear');
    expect(skyEvent(new Date(2026, 11, 6))).toBe('advent');
    expect(skyEvent(new Date(2026, 10, 2))).toBeUndefined();
  });

  it('turns clouds into snow in winter only', () => {
    const winter: string[] = [];
    const autumn: string[] = [];
    for (let d = 1; d <= 28; d++) {
      winter.push(skyMood(new Date(2027, 0, d, 12)).weather);
      autumn.push(skyMood(new Date(2026, 9, d, 12)).weather);
    }
    expect(winter).toContain('snow');
    expect(winter).not.toContain('clouds');
    expect(autumn).not.toContain('snow');
  });
});
