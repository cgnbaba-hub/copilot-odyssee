import { findIsland } from '../content/bundle';
import { ContentBundle, Localized, ModuleStatus } from '../content/types';
import { FeedbackRecord } from './stats';

/**
 * What the editorial team has to look at: stages whose review date has
 * passed or is near, and stages that players reported with «Stimmt das
 * noch?». A report stays open until the stage (or the reported step) gets a
 * newer review date.
 */

/** A review that is due within this many days counts as «soon». */
export const REVIEW_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewState = 'overdue' | 'soon' | 'ok' | 'unknown';

export interface StageReport {
  created: string;
  stepId: string;
  message: string;
}

export interface StageCheck {
  moduleId: string;
  islandId: string;
  island?: Localized;
  title: Localized;
  status: ModuleStatus;
  reviewedAt?: string;
  /** Day the next review is due (YYYY-MM-DD). */
  dueAt?: string;
  /** Days until then; negative when overdue. */
  daysLeft?: number;
  review: ReviewState;
  /** Open reports, newest first. */
  reports: StageReport[];
}

export interface EditorialOverview {
  /** Every stage, those that need attention first. */
  stages: StageCheck[];
  reported: number;
  overdue: number;
  soon: number;
  drafts: number;
}

/** «…(stage-id/step-id)» at the end of the page a fact check was sent from. */
const STEP_REFERENCE = /\(([a-z0-9-]+)\/([a-z0-9-]+)\)\s*$/;

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Stages that need a look come first: reported, then overdue, then due soon; the rest by due date. */
function weight(stage: StageCheck): number {
  if (stage.reports.length > 0) return 0;
  if (stage.review === 'overdue') return 1;
  if (stage.review === 'soon') return 2;
  return 3;
}

export function editorialOverview(content: ContentBundle, feedback: FeedbackRecord[], now: Date): EditorialOverview {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const reportsByStage: { [moduleId: string]: StageReport[] } = {};
  feedback.forEach((entry) => {
    const match = STEP_REFERENCE.exec(entry.context || '');
    if (!match) return;
    (reportsByStage[match[1]] = reportsByStage[match[1]] || []).push({ created: entry.created, stepId: match[2], message: entry.message });
  });

  const stages: StageCheck[] = content.modules
    .filter((module) => module.status !== 'deprecated')
    .map((module) => {
      const island = findIsland(content, module.island);
      const stage: StageCheck = {
        moduleId: module.id,
        islandId: module.island,
        island: island && island.name,
        title: module.title,
        status: module.status,
        reviewedAt: module.reviewedAt,
        review: 'unknown',
        reports: []
      };
      if (module.reviewedAt && module.reviewIntervalDays) {
        const due = new Date(`${module.reviewedAt}T00:00:00Z`).getTime() + module.reviewIntervalDays * DAY_MS;
        stage.dueAt = utcDay(new Date(due));
        stage.daysLeft = Math.round((due - today) / DAY_MS);
        stage.review = stage.daysLeft < 0 ? 'overdue' : stage.daysLeft <= REVIEW_SOON_DAYS ? 'soon' : 'ok';
      }
      stage.reports = (reportsByStage[module.id] || [])
        .filter((report) => {
          const block = module.blocks.filter((b) => b.id === report.stepId)[0];
          // A step can carry its own, newer date; a report from before the last check is settled.
          const checked = (block && 'asOf' in block && block.asOf) || module.reviewedAt || '';
          return report.created.slice(0, 10) >= checked;
        })
        .sort((a, b) => (a.created < b.created ? 1 : -1));
      return stage;
    });

  stages.sort((a, b) => weight(a) - weight(b) || b.reports.length - a.reports.length || (a.daysLeft === undefined ? 1 : b.daysLeft === undefined ? -1 : a.daysLeft - b.daysLeft));
  return {
    stages,
    reported: stages.filter((s) => s.reports.length > 0).length,
    overdue: stages.filter((s) => s.review === 'overdue').length,
    soon: stages.filter((s) => s.review === 'soon').length,
    drafts: stages.filter((s) => s.status === 'draft').length
  };
}
