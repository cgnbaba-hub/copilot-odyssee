import * as React from 'react';

import { modulesOfIsland, sortedIslands } from '../../core/content/bundle';
import { moduleStatus } from '../../core/progress/state';
import { earnedSouvenirs, passportStamps, SOUVENIR_IDS } from '../../core/progress/achievements';
import { formatDate, formatNumber } from '../format';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { rankProgress } from '../theme/types';
import { RankEmblem, SouvenirIcon, Stamp } from './Art';

/** Small deterministic tilt so stamps look hand-pressed. */
const TILTS = [-8, 5, -3, 9, -6, 3, -10, 6, -2, 8];

/** Delay before the rubber stamp comes down, so the page has settled. */
const STAMP_START_MS = 450;

export function Passport(props: { stamp?: string }): React.ReactElement {
  const { content, player, lang, strings, theme, t, navigate, showDrafts } = useGame();
  const stamps = passportStamps(content, player, { showDrafts });
  const souvenirs = earnedSouvenirs(content, player);
  const rank = rankProgress(theme, player.xp);
  const islands = sortedIslands(content);
  const freshRef = React.useRef<HTMLLIElement>(null);
  // A stamp just earned is pressed in with a rubber stamp, like at a border crossing.
  const fresh = props.stamp && stamps.some((x) => x.islandId === props.stamp) ? props.stamp : undefined;
  const freshIsland = fresh ? islands.filter((i) => i.id === fresh)[0] : undefined;
  React.useEffect(() => {
    if (freshRef.current && freshRef.current.scrollIntoView) freshRef.current.scrollIntoView({ block: 'center' });
  }, [fresh]);
  const stagesDone = Object.keys(player.modules).filter((id) => player.modules[id].completed > 0).length;
  // Islands with at least one stage done or started, but no stamp yet.
  const underway = islands
    .map((island) => {
      const modules = modulesOfIsland(content, island.id, { showDrafts });
      const statuses = modules.map((m) => moduleStatus(player, m));
      return { island, total: modules.length, completed: statuses.filter((x) => x === 'completed').length, started: statuses.some((x) => x !== 'new') };
    })
    .filter((row) => row.started && row.completed < row.total);

  return (
    <section className={styles.panel}>
      <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToDeck}
      </button>

      <h1 className={styles.pageTitle}>{t(theme.terms.passport)}</h1>
      <p className={styles.muted}>{strings.passportIntro}</p>
      {freshIsland && (
        <p className={styles.passportStamped} role="status" style={{ animationDelay: `${STAMP_START_MS + 900}ms` }}>
          {format(strings.passportStamped, { island: t(freshIsland.name) })}
        </p>
      )}

      <div
        className={fresh ? `${styles.passportBook} ${styles.passportBookThump}` : styles.passportBook}
        style={fresh ? { animationDelay: `${STAMP_START_MS + 620}ms` } : undefined}
      >
        <div className={`${styles.passportPage} ${styles.passportId}`}>
          <p className={styles.passportPageTitle}>
            {t(theme.terms.passport)} · {t(theme.terms.appTitle)}
          </p>
          <div className={styles.passportPhoto}>
            <RankEmblem index={rank.index} className={styles.passportEmblem} />
          </div>
          <dl className={styles.passportFields}>
            <dt>{strings.passportRank}</dt>
            <dd>{t(rank.rank)}</dd>
            <dt>{t(theme.terms.xp)}</dt>
            <dd>{formatNumber(lang, player.xp)}</dd>
            <dt>{strings.statsStages}</dt>
            <dd>{stagesDone}</dd>
            <dt>{strings.statsUseCases}</dt>
            <dd>{player.useCases.length}</dd>
          </dl>
          <div className={styles.passportRank}>
            <span className={styles.passportRankBar} aria-hidden="true">
              <span style={{ width: `${rank.percent}%` }} />
            </span>
            <span>
              {rank.next ? format(strings.toNextRank, { xp: formatNumber(lang, rank.xpToNext), xpName: t(theme.terms.xp), rank: t(rank.next) }) : strings.passportTopRank}
            </span>
          </div>
          <div className={styles.passportUnderway}>
            <p className={styles.passportPageTitle}>{strings.passportUnderway}</p>
            {underway.length === 0 ? (
              <p className={styles.passportUnderwayEmpty}>{strings.passportUnderwayEmpty}</p>
            ) : (
              <ul>
                {underway.map((row) => (
                  <li key={row.island.id} style={{ ['--od-island' as string]: row.island.color } as React.CSSProperties}>
                    <button type="button" onClick={() => navigate({ name: 'island', islandId: row.island.id })}>
                      <span className={styles.passportUnderwayName}>{t(row.island.name)}</span>
                      <span className={styles.passportUnderwayBar} aria-hidden="true">
                        <span style={{ width: `${Math.round((row.completed / row.total) * 100)}%` }} />
                      </span>
                      <span className={styles.passportUnderwayCount}>{format(strings.deckStagesDone, { done: row.completed, total: row.total })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={styles.passportMrz} aria-hidden="true">
            {`P<CHEODYSSEE<<${t(rank.rank)
              .toUpperCase()
              .replace(/[^A-Z]/g, '<')}<<<<<<<<`.slice(0, 34)}
            <br />
            {`${('0000' + player.xp).slice(-5)}SM<${stamps.length}V${islands.length}<<<<<<<<<<<<<<<<<<<<`.slice(0, 34)}
          </p>
        </div>

        <div className={styles.passportPage}>
          <p className={styles.passportPageTitle}>
            {t(theme.terms.stamps)} · {format(strings.passportStampCount, { count: stamps.length, total: islands.length })}
          </p>
          <ul className={styles.stampGrid}>
            {islands.map((island, i) => {
              const stamp = stamps.filter((s) => s.islandId === island.id)[0];
              return (
                <li
                  key={island.id}
                  ref={island.id === fresh ? freshRef : undefined}
                  className={`${stamp ? styles.stamp : `${styles.stamp} ${styles.stampEmpty}`} ${island.id === fresh ? styles.stampFresh : ''}`}
                  style={
                    {
                      transform: stamp ? `rotate(${TILTS[i % TILTS.length]}deg)` : undefined,
                      ['--od-stamp-delay' as string]: `${STAMP_START_MS}ms`
                    } as React.CSSProperties
                  }
                >
                  {island.id === fresh && (
                    <svg className={styles.stampTool} viewBox="0 0 80 120" aria-hidden="true">
                      <rect x="30" y="4" width="20" height="44" rx="10" fill="#8a5a34" stroke="#1a2940" strokeWidth="3" />
                      <rect x="22" y="44" width="36" height="12" rx="4" fill="#5c3a22" stroke="#1a2940" strokeWidth="3" />
                      <rect x="8" y="56" width="64" height="22" rx="5" fill="#e40028" stroke="#1a2940" strokeWidth="3" />
                      <rect x="8" y="78" width="64" height="8" rx="2" fill="#1a2940" />
                    </svg>
                  )}
                  <Stamp id={island.id} label={t(island.name)} date={stamp ? formatDate(lang, stamp.date) : ''} color={island.color} landmark={island.landmark} empty={!stamp} />
                  <span className={styles.stampCaption}>{stamp ? t(island.name) : `${t(island.name)} · ${strings.stampOpen}`}</span>
                </li>
              );
            })}
          </ul>
          <p className={styles.passportGoal}>{stamps.length === islands.length ? strings.passportComplete : strings.passportGoal}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>{t(theme.terms.souvenirs)}</h2>
      <ul className={styles.souvenirGrid}>
        {SOUVENIR_IDS.map((id) => {
          const earned = souvenirs.indexOf(id) >= 0;
          return (
            <li key={id} className={earned ? styles.souvenir : `${styles.souvenir} ${styles.souvenirLocked}`}>
              <span className={styles.souvenirIcon}>
                <SouvenirIcon id={id} />
              </span>
              <span>
                <strong>{t(theme.souvenirs[id].name)}</strong>
                <span className={styles.muted}>{earned ? t(theme.souvenirs[id].hint) : `${strings.souvenirLocked}: ${t(theme.souvenirs[id].hint)}`}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
