import { weekKey } from '../challenge/challenge';
import { PlayerState } from './state';

/**
 * Staying with it: a weekly slot in the person's own calendar, and a count
 * of the weeks in a row in which something was done. Both work without
 * SharePoint, so every edition has them.
 */

/** The slot a person picked for their weekly learning time. */
export interface PlanSlot {
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  /** Local time, HH:MM. */
  time: string;
  /** Length in minutes. */
  minutes: number;
}

export const DEFAULT_SLOT: PlanSlot = { weekday: 1, time: '09:00', minutes: 15 };
/** How many weeks the calendar series runs; long enough for the whole journey, not forever. */
export const PLAN_WEEKS = 12;

const DAY_MS = 24 * 60 * 60 * 1000;
const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function pad(n: number): string {
  return `0${n}`.slice(-2);
}

/** The next time the slot comes up, strictly after now. */
export function nextSlotStart(slot: PlanSlot, now: Date): Date {
  const [hour, minute] = slot.time.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour || 0, minute || 0, 0, 0);
  const today = (now.getDay() + 6) % 7;
  start.setDate(start.getDate() + ((slot.weekday - today + 7) % 7));
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 7);
  return start;
}

/** Local time without a time zone: the calendar shows it at this time wherever the person is. */
function localStamp(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function utcStamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/**
 * Long lines continue on the next line after a space, as the format asks. The
 * limit is 75 bytes, and umlauts take two, so the cut comes well before that.
 */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 60) {
    parts.push(rest.slice(0, 60));
    rest = rest.slice(60);
  }
  parts.push(rest);
  return parts.join('\r\n ');
}

export interface IcsOptions {
  slot: PlanSlot;
  now: Date;
  title: string;
  description: string;
  /** Address of the app, added to the description and as the place; left out where there is none to link to. */
  url?: string;
}

/** A weekly series as a calendar file (.ics) that Outlook and other calendars can import. */
export function buildIcs(options: IcsOptions): string {
  const start = nextSlotStart(options.slot, options.now);
  const end = new Date(start.getTime() + options.slot.minutes * 60 * 1000);
  const description = options.url ? `${options.description}\n\n${options.url}` : options.description;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Copilot Odyssee//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:odyssee-${options.now.getTime()}@copilot-odyssee`,
    `DTSTAMP:${utcStamp(options.now)}`,
    `DTSTART:${localStamp(start)}`,
    `DTEND:${localStamp(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[options.slot.weekday]};COUNT=${PLAN_WEEKS}`,
    `SUMMARY:${escapeText(options.title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    ...(options.url ? [`LOCATION:${escapeText(options.url)}`, `URL:${options.url}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(options.title)}`,
    'TRIGGER:-PT5M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export interface WeekStreak {
  /** Weeks in a row with something done, up to this week. */
  weeks: number;
  /** Whether this week already counts. */
  thisWeek: boolean;
}

/** Weeks (Monday, YYYY-MM-DD) in which a stage was completed for the first time, an exam passed or the challenge done. */
export function activeWeeks(state: PlayerState): string[] {
  const weeks: { [week: string]: true } = {};
  const add = (iso: string | undefined): void => {
    if (!iso) return;
    const date = new Date(iso);
    if (!isNaN(date.getTime())) weeks[weekKey(date)] = true;
  };
  Object.keys(state.modules).forEach((id) => add(state.modules[id].firstCompletedAt));
  Object.keys(state.exams || {}).forEach((id) => add((state.exams || {})[id].passedAt));
  Object.keys(state.challenges || {}).forEach((week) => (weeks[week] = true));
  return Object.keys(weeks).sort();
}

/**
 * The series stays alive while this week is still open: it only ends when a
 * whole week passed with nothing done.
 */
export function weekStreak(state: PlayerState, now: Date): WeekStreak {
  const active = activeWeeks(state);
  const has = (week: string): boolean => active.indexOf(week) >= 0;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7), 12);
  const thisWeek = has(weekKey(monday));
  let weeks = thisWeek ? 1 : 0;
  for (let back = 1; back < 520; back++) {
    if (!has(weekKey(new Date(monday.getTime() - back * 7 * DAY_MS)))) break;
    weeks += 1;
  }
  return { weeks, thisWeek };
}
