import * as React from 'react';

import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import { islandProgress, isPreview, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CompassRose, LockIcon } from './Art';
import { IslandFog, PosterIsland, Sailboat } from './PosterArt';

/** Chart coordinates: the sea is drawn 1000 wide and 470 high. */
const W = 1000;
const H = 470;

/** Little wave marks drifting on the chart, the way old charts draw the sea. */
const WAVE_MARKS = [
  [60, 60],
  [210, 30],
  [470, 40],
  [610, 110],
  [880, 40],
  [120, 250],
  [400, 220],
  [560, 260],
  [760, 230],
  [960, 270],
  [230, 440],
  [520, 450],
  [700, 420]
];

/** A sea serpent in an empty corner, as on the charts of old. */
function Serpent(): React.ReactElement {
  return (
    <g transform="translate(905 430)">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className={styles.chartHump}
          d={`M${-60 + i * 30} 0 a13 15 0 0 1 26 0`}
          fill="#5f9e8f"
          stroke="#1a2940"
          strokeWidth="2.5"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
      <g className={styles.chartHump} style={{ animationDelay: '1.05s' }}>
        <path d="M30 0 C30 -26 40 -38 54 -36 C66 -34 68 -22 58 -18 C50 -15 44 -12 44 0 Z" fill="#5f9e8f" stroke="#1a2940" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="55" cy="-28" r="2.6" fill="#1a2940" />
        <path d="M65 -24 l9 -2 M65 -21 l8 3" stroke="#c94f33" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M-74 2 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fbf6e8" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

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

  // A dotted route from island to island in their order: red where the island ahead is done,
  // flowing towards the suggested island.
  const route = props.islands.slice(1).map((island, i) => {
    const from = props.islands[i];
    const x1 = (from.map.x / 100) * W;
    const y1 = (from.map.y / 100) * H;
    const x2 = (island.map.x / 100) * W;
    const y2 = (island.map.y / 100) * H;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const bend = (i % 2 === 0 ? 1 : -1) * Math.min(40, len / 5);
    const cx = (x1 + x2) / 2 + (-(y2 - y1) / len) * bend;
    const cy = (y1 + y2) / 2 + ((x2 - x1) / len) * bend;
    const p = islandProgress(game, island.id);
    const done = p.total > 0 && p.completed === p.total;
    const next = !!stage && stage.island.id === island.id;
    return { id: island.id, d: `M${x1.toFixed(0)} ${y1.toFixed(0)} Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`, done, next };
  });

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
          <svg className={styles.chartLayer} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <g fill="none" stroke="#3d7a9e" strokeWidth="2" strokeLinecap="round" opacity="0.45">
              {WAVE_MARKS.map(([x, y], i) => (
                <path key={i} className={styles.chartWaveMark} d={`M${x} ${y} q6 -6 12 0 t12 0 t12 0`} style={{ animationDelay: `${(i % 5) * 0.8}s` }} />
              ))}
            </g>
            <g fill="none" strokeLinecap="round" strokeWidth="3">
              {route.map((r) => (
                <path
                  key={r.id}
                  d={r.d}
                  className={r.next ? styles.chartRouteNext : undefined}
                  stroke={r.done ? '#e40028' : '#1a2940'}
                  strokeDasharray={r.done ? '10 7' : '3 9'}
                  opacity={r.done || r.next ? 0.85 : 0.35}
                />
              ))}
            </g>
            <Serpent />
          </svg>
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
                  {preview && <IslandFog />}
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
