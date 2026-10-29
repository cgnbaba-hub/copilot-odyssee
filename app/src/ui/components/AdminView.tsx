import * as React from 'react';

import { AdminSource } from '../../core/admin/source';
import { AdminData, computeStats, MIN_GROUP, Stats, toCsv } from '../../core/admin/stats';
import { formatNumber } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: AdminData; at: Date };

/** Offers a file to save; used for the CSV exports. */
function download(fileName: string, text: string): void {
  // The byte order mark makes Excel read umlauts correctly.
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Tile(props: { value: string; label: string; note?: string }): React.ReactElement {
  return (
    <div className={styles.adminTile}>
      <strong>{props.value}</strong>
      <span>{props.label}</span>
      {props.note && <small>{props.note}</small>}
    </div>
  );
}

/** A labelled horizontal bar; the value is always written out, the bar only helps comparing. */
function BarRow(props: { label: string; value: number; max: number; text: string }): React.ReactElement {
  const width = props.max > 0 ? Math.max(props.value > 0 ? 2 : 0, Math.round((props.value / props.max) * 100)) : 0;
  return (
    <li className={styles.adminBarRow} title={`${props.label}: ${props.text}`}>
      <span className={styles.adminBarLabel}>{props.label}</span>
      <span className={styles.adminBarTrack} aria-hidden="true">
        <span className={styles.adminBarFill} style={{ width: `${width}%` }} />
      </span>
      <span className={styles.adminBarValue}>{props.text}</span>
    </li>
  );
}

/** Figures for the site owners: how far people got, what they think, what they wrote. */
export function AdminView(props: { source: AdminSource }): React.ReactElement {
  const { content, lang, strings, t, showDrafts } = useGame();
  const [load, setLoad] = React.useState<Load>({ status: 'loading' });
  const [kind, setKind] = React.useState('');

  const reload = React.useCallback((): void => {
    setLoad({ status: 'loading' });
    props.source.load().then(
      (data) => setLoad({ status: 'ready', data, at: new Date() }),
      () => setLoad({ status: 'failed' })
    );
  }, [props.source]);

  React.useEffect(reload, [reload]);

  const n = (value: number): string => formatNumber(lang, value);

  if (load.status !== 'ready') {
    return (
      <section className={styles.panel}>
        <h1 className={styles.pageTitle}>{strings.adminTitle}</h1>
        {load.status === 'loading' ? (
          <p>{strings.adminLoading}</p>
        ) : (
          <div className={styles.feedbackBad} role="alert">
            <p>{strings.adminFailed}</p>
            <button type="button" className={styles.button} onClick={reload}>
              {strings.adminReload}
            </button>
          </div>
        )}
      </section>
    );
  }

  const stats: Stats = computeStats(content, load.data, load.at, { showDrafts });
  const areaName = (id: string): string => {
    if (id === 'none') return strings.adminAreaNone;
    const area = (content.areas || []).filter((a) => a.id === id)[0];
    return area ? t(area.name) : id;
  };
  const islandName = (id: string): string => {
    const island = stats.islands.filter((i) => i.islandId === id)[0];
    return island ? t(island.name) : id;
  };
  const hours = Math.round(stats.useCaseMinutesPerMonth / 60);
  const kinds = load.data.feedback.map((f) => f.kind).filter((k, i, all) => k && all.indexOf(k) === i);
  const feedback = load.data.feedback.filter((f) => !kind || f.kind === kind);
  const date = (iso: string): string => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB');
  };

  const exportStages = (): void => {
    const rows = stats.modules.map((m) => [islandName(m.islandId), t(m.title), m.started, m.completed, m.open, m.rating, m.ratingCount]);
    download(
      'odyssee-etappen.csv',
      toCsv(
        [strings.adminColIsland, strings.adminColStage, strings.adminColStarted, strings.adminColCompleted, strings.adminColOpen, strings.adminColRating, strings.adminColRatings],
        rows
      )
    );
  };
  const exportFeedback = (): void => {
    const rows = load.data.feedback.map((f) => [date(f.created), f.kind, f.message, f.context, f.profile]);
    download('odyssee-feedback.csv', toCsv([strings.adminColDate, strings.adminColKind, strings.adminColMessage, strings.adminColPage, strings.adminColProfile], rows));
  };

  const licenseRows: [string, number][] = [
    [strings.adminLicenseBasic, stats.licenses.basic],
    [strings.adminLicensePremium, stats.licenses.premium],
    [strings.adminLicenseUnknown, stats.licenses.unknown]
  ];
  const maxLicense = Math.max(...licenseRows.map((r) => r[1]));
  const maxArea = Math.max(0, ...stats.areas.map((a) => a.count));

  return (
    <section className={`${styles.panel} ${styles.admin}`}>
      <div className={styles.adminHead}>
        <div>
          <h1 className={styles.pageTitle}>{strings.adminTitle}</h1>
          <p className={styles.muted}>{format(strings.adminIntro, { min: MIN_GROUP })}</p>
        </div>
        <div className={styles.adminActions}>
          {props.source.sample && <span className={styles.chipDraft}>{strings.adminSample}</span>}
          <span className={styles.muted}>
            {format(strings.adminLoadedAt, { time: load.at.toLocaleTimeString(lang === 'de' ? 'de-CH' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) })}
          </span>
          <button type="button" className={styles.button} onClick={reload}>
            {strings.adminReload}
          </button>
        </div>
      </div>

      <div className={styles.adminTiles}>
        <Tile value={n(stats.participants)} label={strings.adminParticipants} />
        <Tile value={n(stats.active30)} label={strings.adminActive} />
        <Tile
          value={n(stats.stagesCompleted)}
          label={strings.adminStages}
          note={stats.participants ? format(strings.adminPerPerson, { value: (stats.stagesCompleted / stats.participants).toFixed(1) }) : undefined}
        />
        <Tile value={n(stats.useCases)} label={strings.adminUseCases} note={hours > 0 ? format(strings.adminUseCaseHours, { hours: n(hours) }) : undefined} />
        <Tile value={n(stats.feedback)} label={strings.adminFeedbackCount} />
      </div>

      {stats.participants < MIN_GROUP ? (
        <p className={styles.notice}>{format(strings.adminTooFew, { min: MIN_GROUP })}</p>
      ) : (
        <>
          <h2 className={styles.sectionTitle}>{strings.adminIslands}</h2>
          <p className={styles.muted}>{strings.adminIslandsIntro}</p>
          <ul className={styles.adminBars}>
            {stats.islands.map((island) => (
              <BarRow
                key={island.islandId}
                label={t(island.name)}
                value={island.completed}
                max={stats.participants}
                text={format(strings.adminIslandValue, { completed: n(island.completed), started: n(island.started) })}
              />
            ))}
          </ul>

          <div className={styles.adminSectionHead}>
            <h2 className={styles.sectionTitle}>{strings.adminStageTable}</h2>
            <button type="button" className={styles.button} onClick={exportStages}>
              {strings.adminExportStages}
            </button>
          </div>
          <p className={styles.muted}>{format(strings.adminStageIntro, { min: MIN_GROUP })}</p>
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th scope="col">{strings.adminColStage}</th>
                  <th scope="col">{strings.adminColStarted}</th>
                  <th scope="col">{strings.adminColCompleted}</th>
                  <th scope="col">{strings.adminColOpen}</th>
                  <th scope="col">{strings.adminColRating}</th>
                </tr>
              </thead>
              <tbody>
                {stats.modules.map((m) => {
                  // Many people who start but do not finish point to a stage that needs a look.
                  const stuck = m.started >= MIN_GROUP && m.open / m.started >= 0.4;
                  return (
                    <tr key={m.moduleId} className={stuck ? styles.adminRowWarn : undefined}>
                      <th scope="row">
                        <span className={styles.adminStageName}>{t(m.title)}</span>
                        <span className={styles.adminStageIsland}>{islandName(m.islandId)}</span>
                        {stuck && <span className={styles.adminWarn}>⚠ {strings.adminStuck}</span>}
                      </th>
                      <td>{n(m.started)}</td>
                      <td>{n(m.completed)}</td>
                      <td>{n(m.open)}</td>
                      <td>{m.rating !== undefined ? `${m.rating.toFixed(1)} / 5` : '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.adminColumns}>
            <div>
              <h2 className={styles.sectionTitle}>{strings.adminLicenses}</h2>
              <ul className={styles.adminBars}>
                {licenseRows.map(([label, value]) => (
                  <BarRow key={label} label={label} value={value} max={maxLicense} text={n(value)} />
                ))}
              </ul>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>{strings.adminAreas}</h2>
              <ul className={styles.adminBars}>
                {stats.areas.map((a) => (
                  <BarRow key={a.id} label={areaName(a.id)} value={a.count} max={maxArea} text={n(a.count)} />
                ))}
              </ul>
              {stats.smallAreas > 0 && <p className={styles.muted}>{format(strings.adminSmallAreas, { count: n(stats.smallAreas), min: MIN_GROUP })}</p>}
            </div>
          </div>
        </>
      )}

      <div className={styles.adminSectionHead}>
        <h2 className={styles.sectionTitle}>{strings.adminFeedback}</h2>
        <div className={styles.adminActions}>
          <label className={styles.adminFilter}>
            <span>{strings.adminFeedbackFilter}</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">{strings.adminFeedbackAll}</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          {load.data.feedback.length > 0 && (
            <button type="button" className={styles.button} onClick={exportFeedback}>
              {strings.adminExportFeedback}
            </button>
          )}
        </div>
      </div>
      {feedback.length === 0 ? (
        <p className={styles.muted}>{strings.adminFeedbackEmpty}</p>
      ) : (
        <ul className={styles.adminFeedbackList}>
          {feedback.map((f, i) => (
            <li key={i} className={styles.adminFeedbackItem}>
              <p className={styles.adminFeedbackMeta}>
                <span className={styles.chip}>{f.kind}</span>
                <span>{date(f.created)}</span>
                {f.context && <span>{f.context}</span>}
              </p>
              <p className={styles.adminFeedbackText}>{f.message}</p>
              {f.profile && <p className={styles.muted}>{f.profile}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className={styles.muted}>{strings.adminFeedbackNames}</p>
    </section>
  );
}
