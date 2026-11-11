import * as React from 'react';

import { editorialOverview, REVIEW_SOON_DAYS, StageCheck } from '../../core/admin/editorial';
import { FeedbackRecord, toCsv } from '../../core/admin/stats';
import { saveFile } from '../download';
import { formatDate } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

/**
 * For the editorial team, inside the evaluation: which stages are due for
 * their review and which ones players reported with «Stimmt das noch?».
 */
export function EditorialSection(props: { feedback: FeedbackRecord[]; now: Date }): React.ReactElement {
  const { content, lang, strings, t, navigate } = useGame();
  const [all, setAll] = React.useState(false);
  const overview = editorialOverview(content, props.feedback, props.now);
  const urgent = overview.stages.filter((s) => s.reports.length > 0 || s.review === 'overdue' || s.review === 'soon');
  const shown = all ? overview.stages : urgent;
  const day = (iso: string | undefined): string => (iso ? formatDate(lang, `${iso}T12:00:00`) : '–');

  const dueText = (stage: StageCheck): string => {
    if (stage.daysLeft === undefined) return strings.editorialNoDate;
    if (stage.daysLeft < 0) return format(strings.editorialOverdue, { days: -stage.daysLeft });
    return format(strings.editorialDueIn, { date: day(stage.dueAt), days: stage.daysLeft });
  };

  const exportList = (): void => {
    const rows = overview.stages.map((s) => [s.island ? t(s.island) : s.islandId, t(s.title), s.moduleId, s.status, s.reviewedAt, s.dueAt, s.daysLeft, s.reports.length]);
    const header = [
      strings.adminColIsland,
      strings.adminColStage,
      'ID',
      strings.editorialColStatus,
      strings.editorialColReviewed,
      strings.editorialColDue,
      strings.editorialColDays,
      strings.editorialColReports
    ];
    // The byte order mark makes Excel read umlauts correctly.
    saveFile('odyssee-redaktion.csv', '\ufeff' + toCsv(header, rows), 'text/csv;charset=utf-8');
  };

  return (
    <>
      <div className={styles.adminSectionHead}>
        <h2 className={styles.sectionTitle}>{strings.editorialTitle}</h2>
        <button type="button" className={styles.button} onClick={exportList}>
          {strings.editorialExport}
        </button>
      </div>
      <p className={styles.muted}>{format(strings.editorialIntro, { days: REVIEW_SOON_DAYS })}</p>
      <p className={styles.editorialCounts}>
        <span className={overview.reported > 0 ? styles.editorialCountWarn : undefined}>{format(strings.editorialReported, { count: overview.reported })}</span>
        <span className={overview.overdue > 0 ? styles.editorialCountWarn : undefined}>{format(strings.editorialOverdueCount, { count: overview.overdue })}</span>
        <span>{format(strings.editorialSoonCount, { count: overview.soon })}</span>
        <span>{format(strings.editorialDrafts, { count: overview.drafts, total: overview.stages.length })}</span>
      </p>
      {overview.drafts > 0 && <p className={styles.notice}>{strings.editorialDraftNote}</p>}
      {shown.length === 0 ? (
        <p>{strings.editorialNothing}</p>
      ) : (
        <ul className={styles.editorialList}>
          {shown.map((stage) => (
            <li
              key={stage.moduleId}
              className={stage.reports.length > 0 || stage.review === 'overdue' ? `${styles.editorialItem} ${styles.editorialItemWarn}` : styles.editorialItem}
            >
              <div className={styles.editorialMain}>
                <span className={styles.adminStageName}>{t(stage.title)}</span>
                <span className={styles.adminStageIsland}>
                  {stage.island ? t(stage.island) : stage.islandId}
                  {stage.status === 'draft' ? ` · ${strings.editorialDraft}` : ''}
                </span>
              </div>
              <span className={styles.editorialDue}>
                {format(strings.editorialReviewed, { date: day(stage.reviewedAt) })} · {dueText(stage)}
              </span>
              <button type="button" className={styles.button} onClick={() => navigate({ name: 'module', moduleId: stage.moduleId })}>
                {strings.editorialOpen}
              </button>
              {stage.reports.length > 0 && (
                <details className={styles.editorialReports}>
                  <summary>{stage.reports.length === 1 ? strings.editorialReportOne : format(strings.editorialReportMany, { count: stage.reports.length })}</summary>
                  <ul>
                    {stage.reports.map((report, i) => (
                      <li key={i}>
                        <span className={styles.muted}>
                          {formatDate(lang, report.created)} · {report.stepId}
                        </span>
                        <span>{report.message}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
      {overview.stages.length > urgent.length && (
        <button type="button" className={styles.linkButton} aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? strings.editorialShowUrgent : format(strings.editorialShowAll, { count: overview.stages.length })}
        </button>
      )}
    </>
  );
}
