import { ContentBundle } from '../content/types';
import { initialState, PlayerState } from '../progress/state';
import { MIN_TEAM, RegattaEntry, RegattaReport, RegattaSource, RegattaSync, reportOf, scoreOf, standing, weekStartFor } from './regatta';

const WEEK = '2026-11-09';

const entry = (miles: number, extra: Partial<RegattaEntry> = {}): RegattaEntry => ({ miles, week: WEEK, weekStart: 0, compass: false, mine: false, ...extra });

const team = (area: string, miles: number[], extra: Partial<RegattaEntry> = {}): RegattaEntry[] => miles.map((m) => entry(m, { area, ...extra }));

describe('reportOf', () => {
  const content = {
    islands: [],
    modules: [
      { id: 'a', status: 'active', core: true },
      { id: 'b', status: 'active', core: true },
      { id: 'c', status: 'active' }
    ]
  } as unknown as ContentBundle;
  const player = (change: Partial<PlayerState['profile']>, modules: string[] = []): PlayerState => {
    const state = { ...initialState('de'), xp: 420 };
    state.profile = { ...state.profile, onboarded: true, area: 'marketing', ...change };
    modules.forEach((id) => (state.modules[id] = { started: 1, completed: 1, inProgress: false }));
    return state;
  };

  it('reports nothing until the person chose to take part', () => {
    expect(reportOf(content, player({}), { showDrafts: false }, WEEK)).toBeUndefined();
    expect(reportOf(content, player({ regatta: 'off' }), { showDrafts: false }, WEEK)).toBeUndefined();
    expect(reportOf(content, player({ regatta: 'team', onboarded: false }), { showDrafts: false }, WEEK)).toBeUndefined();
  });

  it('reports miles, area and the compass course, the name only when chosen', () => {
    expect(reportOf(content, player({ regatta: 'team' }, ['a']), { showDrafts: false }, WEEK)).toEqual({
      area: 'marketing',
      miles: 420,
      compass: false,
      showName: false,
      week: WEEK
    });
    expect(reportOf(content, player({ regatta: 'name' }, ['a', 'b']), { showDrafts: false }, WEEK)).toEqual({
      area: 'marketing',
      miles: 420,
      compass: true,
      showName: true,
      week: WEEK
    });
  });
});

describe('weekStartFor', () => {
  const report = (miles: number): RegattaReport => ({ miles, compass: false, showName: false, week: WEEK });

  it('starts a new line at its current miles', () => {
    expect(weekStartFor(undefined, report(900))).toBe(900);
  });

  it('keeps the start within a week and moves it when a new week begins', () => {
    expect(weekStartFor({ miles: 500, week: WEEK, weekStart: 300 }, report(560))).toBe(300);
    expect(weekStartFor({ miles: 500, week: '2026-11-02', weekStart: 300 }, report(560))).toBe(500);
  });

  it('never starts above the current miles, e.g. after deleting all progress', () => {
    expect(weekStartFor({ miles: 500, week: WEEK, weekStart: 300 }, report(40))).toBe(40);
  });
});

describe('scoreOf', () => {
  it('counts only this week for the weekly ranking', () => {
    expect(scoreOf(entry(500, { weekStart: 320 }), 'week', WEEK)).toBe(180);
    expect(scoreOf(entry(500, { weekStart: 320, week: '2026-11-02' }), 'week', WEEK)).toBe(0);
    expect(scoreOf(entry(500, { weekStart: 320 }), 'total', WEEK)).toBe(500);
  });
});

describe('standing', () => {
  it('ranks areas by average miles and hides those with too few people', () => {
    const entries = [...team('marketing', [100, 100, 100, 100, 100]), ...team('beratung', [400, 300, 200, 100, 0, 200], { compass: true }), ...team('finanzen', [900, 900])];
    const result = standing(entries, 'total', WEEK);
    expect(result.participants).toBe(13);
    expect(result.teams.map((t) => [t.rank, t.area, t.crews, t.average, t.compassShare])).toEqual([
      [1, 'beratung', 6, 200, 100],
      [2, 'marketing', 5, 100, 0]
    ]);
    expect(result.smallTeams).toBe(1);
    expect(result.totalScore).toBe(500 + 1200 + 1800);
    expect(MIN_TEAM).toBe(5);
  });

  it('gives equal miles the same place and lists the person first among equals', () => {
    const entries = [entry(300, { name: 'Anna Muster', area: 'marketing' }), entry(200), entry(200, { mine: true }), entry(200), entry(50), entry(0)];
    const result = standing(entries, 'total', WEEK);
    expect(result.crews.map((c) => [c.rank, c.score, c.mine])).toEqual([
      [1, 300, false],
      [2, 200, true],
      [2, 200, false],
      [2, 200, false],
      [5, 50, false]
    ]);
    expect(result.me).toEqual({ rank: 2, name: undefined, area: undefined, score: 200, mine: true });
  });

  it('shows the area only together with the name', () => {
    const result = standing([entry(300, { name: 'Anna Muster', area: 'marketing' }), entry(200, { area: 'beratung' })], 'total', WEEK);
    expect(result.crews.map((c) => [c.name, c.area])).toEqual([
      ['Anna Muster', 'marketing'],
      [undefined, undefined]
    ]);
  });

  it('lists at most ten crews and still knows the place of the person further back', () => {
    const entries = Array.from({ length: 30 }, (_, i) => entry(1000 - i * 10, { mine: i === 24 }));
    const result = standing(entries, 'total', WEEK);
    expect(result.crews).toHaveLength(10);
    expect(result.me && result.me.rank).toBe(25);
  });

  it('says so when the own area is too small, and knows nobody without a line', () => {
    const small = standing([...team('marketing', [100, 100, 100, 100, 100]), entry(50, { area: 'finanzen', mine: true })], 'week', WEEK);
    expect(small.myTeamHidden).toBe(true);
    expect(small.teams[0].mine).toBe(false);
    const watching = standing(team('marketing', [100, 100, 100, 100, 100]), 'week', WEEK);
    expect(watching.me).toBeUndefined();
    expect(watching.myTeamHidden).toBe(false);
  });
});

describe('RegattaSync', () => {
  class FakeSource implements RegattaSource {
    public calls: string[] = [];
    public fail = false;
    public load(): Promise<RegattaEntry[]> {
      return Promise.resolve([]);
    }
    public report(report: RegattaReport): Promise<void> {
      this.calls.push(`report ${report.miles}`);
      return this.fail ? Promise.reject(new Error('offline')) : Promise.resolve();
    }
    public leave(): Promise<void> {
      this.calls.push('leave');
      return Promise.resolve();
    }
  }
  const report = (miles: number): RegattaReport => ({ miles, compass: false, showName: false, week: WEEK });

  it('writes a report once and again only when something changed', async () => {
    const source = new FakeSource();
    const sync = new RegattaSync(source);
    await Promise.all([sync.push(report(100)), sync.push(report(100)), sync.push(report(130))]);
    expect(source.calls).toEqual(['report 100', 'report 130']);
    expect(sync.reported).toBe(true);
    await sync.push(undefined);
    await sync.push(undefined);
    expect(source.calls).toEqual(['report 100', 'report 130', 'leave']);
    expect(sync.reported).toBe(false);
  });

  it('tries again after a failed report', async () => {
    const source = new FakeSource();
    const sync = new RegattaSync(source);
    source.fail = true;
    await expect(sync.push(report(100))).rejects.toThrow('offline');
    source.fail = false;
    await sync.push(report(100));
    expect(source.calls).toEqual(['report 100', 'report 100']);
  });
});
