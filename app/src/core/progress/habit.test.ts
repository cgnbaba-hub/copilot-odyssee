import { activeWeeks, buildIcs, nextSlotStart, weekStreak } from './habit';
import { initialState, PlayerState } from './state';

describe('nextSlotStart', () => {
  // Wednesday, 11 November 2026, 10:00
  const now = new Date(2026, 10, 11, 10, 0);

  it('finds the next time the weekday and time come up', () => {
    expect(nextSlotStart({ weekday: 3, time: '14:30', minutes: 15 }, now)).toEqual(new Date(2026, 10, 12, 14, 30));
    expect(nextSlotStart({ weekday: 0, time: '08:00', minutes: 15 }, now)).toEqual(new Date(2026, 10, 16, 8, 0));
  });

  it('uses today when the time is still ahead, next week when it has passed', () => {
    expect(nextSlotStart({ weekday: 2, time: '16:00', minutes: 15 }, now)).toEqual(new Date(2026, 10, 11, 16, 0));
    expect(nextSlotStart({ weekday: 2, time: '09:00', minutes: 15 }, now)).toEqual(new Date(2026, 10, 18, 9, 0));
  });
});

describe('buildIcs', () => {
  const ics = buildIcs({
    slot: { weekday: 1, time: '09:00', minutes: 15 },
    now: new Date(2026, 10, 11, 10, 0),
    title: 'Copilot Odyssee: 15 Minuten',
    description: 'Eine Etappe, dann weiter; mit Komma, und Zeile\nzwei',
    url: 'https://contoso.sharepoint.com/sites/odyssee/SitePages/Odyssee.aspx'
  });

  it('describes a weekly series in local time', () => {
    expect(ics).toContain('DTSTART:20261117T090000\r\n');
    expect(ics).toContain('DTEND:20261117T091500\r\n');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=12\r\n');
    expect(ics).toContain('SUMMARY:Copilot Odyssee: 15 Minuten\r\n');
    expect(ics.indexOf('BEGIN:VCALENDAR\r\n')).toBe(0);
    expect(ics.slice(-15)).toBe('END:VCALENDAR\r\n');
  });

  it('escapes text and folds long lines', () => {
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain('DESCRIPTION:Eine Etappe\\, dann weiter\; mit Komma\\, und Zeile\\nzwei\\n\\nhttps://contoso.sharepoint.com/sites/odyssee/SitePages/Odyssee.aspx');
    ics.split('\r\n').forEach((line) => expect(line.length).toBeLessThanOrEqual(75));
  });

  it('leaves the link out where there is none', () => {
    const plain = buildIcs({ slot: { weekday: 4, time: '07:45', minutes: 30 }, now: new Date(2026, 10, 11, 10, 0), title: 'T', description: 'D' });
    expect(plain).not.toContain('URL:');
    expect(plain).toContain('DTSTART:20261113T074500');
    expect(plain).toContain('DTEND:20261113T081500');
  });
});

describe('weekStreak', () => {
  // Wednesday, 11 November 2026; the week began on Monday the 9th.
  const now = new Date(2026, 10, 11, 10, 0);
  const player = (dates: string[], challenges: string[] = []): PlayerState => {
    const state = initialState('de');
    dates.forEach((date, i) => (state.modules[`m${i}`] = { started: 1, completed: 1, inProgress: false, firstCompletedAt: `${date}T12:00:00` }));
    challenges.forEach((week) => (state.challenges = { ...(state.challenges || {}), [week]: 'c' }));
    return state;
  };

  it('counts nothing for a new player', () => {
    expect(weekStreak(initialState('de'), now)).toEqual({ weeks: 0, thisWeek: false });
  });

  it('counts weeks in a row up to this week', () => {
    expect(weekStreak(player(['2026-10-28', '2026-11-03', '2026-11-10']), now)).toEqual({ weeks: 3, thisWeek: true });
  });

  it('keeps the series alive while this week is still open', () => {
    expect(weekStreak(player(['2026-10-28', '2026-11-03']), now)).toEqual({ weeks: 2, thisWeek: false });
  });

  it('ends after a week with nothing done', () => {
    expect(weekStreak(player(['2026-10-20', '2026-11-10']), now)).toEqual({ weeks: 1, thisWeek: true });
    expect(weekStreak(player(['2026-10-20']), now)).toEqual({ weeks: 0, thisWeek: false });
  });

  it('counts the challenge of the week and passed exams too', () => {
    const state = player(['2026-11-10'], ['2026-11-02']);
    state.exams = { a: { passed: true, best: 5, attempts: 1, passedAt: '2026-10-27T09:00:00' } };
    expect(activeWeeks(state)).toEqual(['2026-10-26', '2026-11-02', '2026-11-09']);
    expect(weekStreak(state, now).weeks).toBe(3);
  });
});
