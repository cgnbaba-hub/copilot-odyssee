import { Challenge, License } from '../content/types';

const DAY_MS = 24 * 60 * 60 * 1000;
/** A Monday; weeks are counted from here so the order stays the same across years. */
const FIRST_MONDAY = Date.UTC(2026, 0, 5);

/** Monday of the week the date falls in, as YYYY-MM-DD in local time. */
export function weekKey(date: Date): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
  const pad = (n: number): string => `0${n}`.slice(-2);
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

/** Whole weeks since the first Monday; negative before it. */
function weekNumber(date: Date): number {
  const [y, m, d] = weekKey(date).split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - FIRST_MONDAY) / (7 * DAY_MS));
}

/** Days until the next challenge starts (1 on a Sunday, 7 on a Monday). */
export function daysUntilNextWeek(date: Date): number {
  return 7 - ((date.getDay() + 6) % 7);
}

/**
 * The challenge of the week for a licence: Basic sees only Basic challenges,
 * Premium sees all of them. The list repeats once every challenge was shown.
 */
export function currentChallenge(challenges: Challenge[] | undefined, license: License | 'unknown', date: Date): Challenge | undefined {
  const fitting = (challenges || []).filter((c) => c.license === 'basic' || license === 'premium');
  if (fitting.length === 0) return undefined;
  const n = weekNumber(date);
  return fitting[((n % fitting.length) + fitting.length) % fitting.length];
}
