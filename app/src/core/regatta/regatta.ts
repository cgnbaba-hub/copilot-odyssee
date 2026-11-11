import { ContentFilter, isModuleVisible } from '../content/bundle';
import { ContentBundle } from '../content/types';
import { getModule, PlayerState, Profile } from '../progress/state';

/**
 * The regatta: a friendly comparison between the fields of work and, for
 * those who want it, between people. Nobody takes part without saying so:
 * «off» leaves no trace, «team» counts for the area without a name, «name»
 * also shows the name in the ranking.
 */

export type RegattaChoice = NonNullable<Profile['regatta']>;

/** Smallest area that is shown as a team of its own. */
export const MIN_TEAM = 5;
/** How many crews the ranking lists. */
export const TOP_CREWS = 10;

/** One participant's line, as everyone taking part can read it. */
export interface RegattaEntry {
  /** Field of work (id from areas.json). */
  area?: string;
  /** Nautical miles in total. */
  miles: number;
  /** Week (Monday, YYYY-MM-DD) that weekStart belongs to. */
  week?: string;
  /** Miles the person had when that week began. */
  weekStart: number;
  /** Whether the compass course is done. */
  compass: boolean;
  /** Only when the person chose to show it. */
  name?: string;
  mine: boolean;
}

/** What a participant's app reports about itself. */
export interface RegattaReport {
  area?: string;
  miles: number;
  compass: boolean;
  showName: boolean;
  /** Current week (Monday, YYYY-MM-DD). */
  week: string;
}

export interface RegattaSource {
  load(): Promise<RegattaEntry[]>;
  /** Creates or updates the current person's line. */
  report(report: RegattaReport): Promise<void>;
  /** Removes the current person's line. */
  leave(): Promise<void>;
  /** True for the demo, which shows invented crews. */
  sample?: boolean;
}

/** The report for a player, or undefined when they do not take part. */
export function reportOf(content: ContentBundle, state: PlayerState, filter: ContentFilter, week: string): RegattaReport | undefined {
  const choice = state.profile.regatta;
  if (!state.profile.onboarded || (choice !== 'team' && choice !== 'name')) return undefined;
  const core = content.modules.filter((m) => m.core && isModuleVisible(m, filter));
  return {
    area: state.profile.area,
    miles: state.xp,
    compass: core.length > 0 && core.every((m) => getModule(state, m.id).completed > 0),
    showName: choice === 'name',
    week
  };
}

/**
 * The miles a line had when the reported week began. A line seen for the
 * first time starts the week at its current miles, so joining late does not
 * count everything sailed before as this week's distance.
 */
export function weekStartFor(previous: { miles: number; week?: string; weekStart: number } | undefined, report: RegattaReport): number {
  if (!previous) return report.miles;
  const start = previous.week === report.week ? previous.weekStart : previous.miles;
  // After deleting all progress the miles are lower than before.
  return Math.max(0, Math.min(start, report.miles));
}

export type RegattaPeriod = 'week' | 'total';

export function scoreOf(entry: RegattaEntry, period: RegattaPeriod, week: string): number {
  if (period === 'total') return Math.max(0, entry.miles);
  return entry.week === week ? Math.max(0, entry.miles - entry.weekStart) : 0;
}

export interface TeamRow {
  rank: number;
  area: string;
  crews: number;
  /** Average miles per person, so large and small areas compare fairly. */
  average: number;
  /** Share of the team that finished the compass course, in percent. */
  compassShare: number;
  mine: boolean;
}

export interface CrewRow {
  rank: number;
  /** Missing for people who take part without their name. */
  name?: string;
  /** Only given together with the name. */
  area?: string;
  score: number;
  mine: boolean;
}

export interface Standing {
  participants: number;
  /** Miles of everyone together. */
  totalScore: number;
  teams: TeamRow[];
  /** Areas with fewer than MIN_TEAM people; they sail along but are not shown on their own. */
  smallTeams: number;
  /** The current person's line; missing when they do not take part. */
  me?: CrewRow;
  /** True when the person's area is too small to be shown. */
  myTeamHidden: boolean;
  /** The fastest crews; lines with nothing sailed are left out. */
  crews: CrewRow[];
}

export function standing(entries: RegattaEntry[], period: RegattaPeriod, week: string): Standing {
  const scored = entries.map((entry) => ({ entry, score: scoreOf(entry, period, week) }));
  // The person's own line wins a tie in the order, the rank stays shared.
  scored.sort((a, b) => b.score - a.score || Number(b.entry.mine) - Number(a.entry.mine));

  const rows: CrewRow[] = [];
  scored.forEach((line, index) => {
    const rank = index > 0 && scored[index - 1].score === line.score ? rows[index - 1].rank : index + 1;
    rows.push({ rank, name: line.entry.name, area: line.entry.name ? line.entry.area : undefined, score: line.score, mine: line.entry.mine });
  });

  const byArea: { [area: string]: { entry: RegattaEntry; score: number }[] } = {};
  scored.forEach((line) => {
    if (!line.entry.area) return;
    (byArea[line.entry.area] = byArea[line.entry.area] || []).push(line);
  });
  const myArea = (entries.filter((e) => e.mine)[0] || { area: undefined }).area;
  const teams: TeamRow[] = [];
  let smallTeams = 0;
  Object.keys(byArea).forEach((area) => {
    const lines = byArea[area];
    if (lines.length < MIN_TEAM) {
      smallTeams += 1;
      return;
    }
    teams.push({
      rank: 0,
      area,
      crews: lines.length,
      average: Math.round(lines.reduce((sum, l) => sum + l.score, 0) / lines.length),
      compassShare: Math.round((lines.filter((l) => l.entry.compass).length / lines.length) * 100),
      mine: area === myArea
    });
  });
  teams.sort((a, b) => b.average - a.average || b.compassShare - a.compassShare || (a.area < b.area ? -1 : 1));
  teams.forEach((team, index) => {
    team.rank = index > 0 && teams[index - 1].average === team.average ? teams[index - 1].rank : index + 1;
  });

  return {
    participants: entries.length,
    totalScore: scored.reduce((sum, l) => sum + l.score, 0),
    teams,
    smallTeams,
    me: rows.filter((r) => r.mine)[0],
    myTeamHidden: !!myArea && !teams.some((t) => t.mine),
    crews: rows.filter((r) => r.score > 0).slice(0, TOP_CREWS)
  };
}

function signature(report: RegattaReport | undefined): string {
  return report ? [report.area || '', report.miles, report.compass, report.showName, report.week].join('|') : 'off';
}

/**
 * Sends reports one after the other and skips those that change nothing, so
 * the view and the background sync can both ask without writing twice.
 */
export class RegattaSync {
  private _sent: string | undefined;
  private _queue: Promise<void> = Promise.resolve();

  public constructor(public readonly source: RegattaSource) {}

  /** Reports the line, or removes it when there is nothing to report. */
  public push(report: RegattaReport | undefined): Promise<void> {
    const run = async (): Promise<void> => {
      const next = signature(report);
      if (next === this._sent) return;
      if (report) await this.source.report(report);
      else await this.source.leave();
      this._sent = next;
    };
    const result = this._queue.then(run);
    // A failed report must not block the ones after it.
    this._queue = result.catch(() => undefined);
    return result;
  }

  /** Whether a line was reported in this session. */
  public get reported(): boolean {
    return this._sent !== undefined && this._sent !== 'off';
  }
}
