import * as React from 'react';

import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import { islandProgress, isPreview, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CompassRose, LockIcon } from './Art';
import { PosterIsland, Sailboat } from './PosterArt';

/**
 * All islands at once on an old sea chart. The islands can be visited in any
 * order, so there is no fixed route: the ship only marks a suggestion, and
 * the Premium islands lie in their own waters on the right.
 */
export function SeaChart(props: { islands: Island[] }): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate } = game;
  const stage = nextStage(game);
  const premiumFrom = Math.min(...props.islands.filter((i) => i.license === 'premium').map((i) => i.map.x));
  const basicTo = Math.max(...props.islands.filter((i) => i.license === 'basic').map((i) => i.map.x));
  const border = isFinite(premiumFrom) && isFinite(basicTo) ? (premiumFrom + basicTo) / 2 : undefined;

  return (
    <section className={styles.chart} aria-label={strings.viewChart}>
      <div className={styles.chartHead}>
        <h1 className={styles.pageTitle}>{strings.viewChart}</h1>
        <p className={styles.muted}>{strings.chartIntro}</p>
        <p className={styles.chartScrollHint}>{strings.chartScrollHint}</p>
      </div>
      <div className={styles.chartScroll}>
        <div className={styles.chartSea}>
          {border !== undefined && (
            <div className={styles.chartPremium} style={{ left: `${border}%` }}>
              <span>{strings.chartPremium}</span>
            </div>
          )}
          <CompassRose className={styles.chartCompass} />
          {props.islands.map((island) => {
            const progress = islandProgress(game, island.id);
            const done = progress.total > 0 && progress.completed === progress.total;
            const preview = isPreview(game, island);
            const suggested = !!stage && stage.island.id === island.id;
            return (
              <button
                type="button"
                key={island.id}
                className={`${styles.chartIsland} ${preview ? styles.chartIslandPreview : ''} ${suggested ? styles.chartIslandNext : ''}`}
                style={{ left: `${island.map.x}%`, top: `${island.map.y}%` }}
                onClick={() => navigate({ name: 'island', islandId: island.id })}
                aria-label={`${t(island.name)}: ${done ? strings.statusCompleted : format(strings.deckStagesDone, { done: progress.completed, total: progress.total })}${suggested ? `, ${strings.chartSuggestion}` : ''}`}
              >
                <svg viewBox="-160 -190 320 205" aria-hidden="true">
                  <ellipse cx="0" cy="4" rx="150" ry="14" fill="#fbf6e8" opacity="0.55" />
                  <PosterIsland landmark={island.landmark} color={island.color} flag={done} />
                </svg>
                <span className={styles.chartName}>{t(island.name)}</span>
                <span className={done ? `${styles.chartCount} ${styles.chartCountDone}` : styles.chartCount}>
                  {preview ? <LockIcon /> : done ? '✓' : `${progress.completed}/${progress.total}`}
                </span>
                {island.home && <span className={styles.chartHome}>{strings.chartHome}</span>}
                {suggested && (
                  <span className={styles.chartShip} aria-hidden="true">
                    <svg viewBox="-50 -100 100 116">
                      <Sailboat />
                    </svg>
                    <em>{strings.chartSuggestion}</em>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
