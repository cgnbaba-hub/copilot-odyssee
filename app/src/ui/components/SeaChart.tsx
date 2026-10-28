import * as React from 'react';

import { sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { islandProgress, isPreview, nextStop } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CheckIcon, CompassRose, IslandArt, LockIcon, Ship } from './Art';

/** Gently curved sailing route through the islands in route order. */
function routePath(islands: Island[]): string {
  return islands
    .map((island, i) => {
      if (i === 0) return `M ${island.map.x} ${island.map.y}`;
      const prev = islands[i - 1];
      const cx = (prev.map.x + island.map.x) / 2;
      const cy = (prev.map.y + island.map.y) / 2 + (i % 2 === 0 ? -10 : 10);
      return `Q ${cx} ${cy} ${island.map.x} ${island.map.y}`;
    })
    .join(' ');
}

/** The illustrated sea chart. Islands are numbered along the route so the order is clear. */
export function SeaChart(): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate } = game;
  const islands = sortedIslands(game.content);
  const next = nextStop(game);
  const route = routePath(islands);

  return (
    <div className={styles.map}>
      <svg className={styles.mapSea} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="od-waves" width="16" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 6 q4 -3 8 0 t8 0" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />
          </pattern>
          <radialGradient id="od-sea-light" cx="0.25" cy="0.2" r="0.9">
            <stop offset="0" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#od-sea-light)" />
        <rect width="100" height="100" fill="url(#od-waves)" />
        <path d={route} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={route} fill="none" stroke="#FFE08A" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={styles.mapClouds} aria-hidden="true">
        <span className={styles.mapCloud} />
        <span className={`${styles.mapCloud} ${styles.mapCloudTwo}`} />
      </div>
      <CompassRose className={styles.compass} />

      {islands.map((island, index) => {
        const progress = islandProgress(game, island.id);
        const preview = isPreview(game, island);
        const done = progress.total > 0 && progress.completed === progress.total;
        return (
          <button
            type="button"
            key={island.id}
            className={styles.mapIsland}
            style={{ left: `${island.map.x}%`, top: `${island.map.y}%` }}
            onClick={() => navigate({ name: 'island', islandId: island.id })}
            aria-label={`${index + 1}. ${t(island.name)}: ${t(island.tool)}${preview ? `, ${strings.premiumOnly}` : ''}`}
          >
            {next && next.id === island.id && (
              <span className={styles.mapShipWrap}>
                <span className={styles.mapShipLabel}>{strings.nextStop}</span>
                <Ship className={styles.mapShip} />
              </span>
            )}
            <IslandArt island={island} muted={preview} className={styles.mapIslandArt} />
            <span className={preview ? `${styles.mapLabel} ${styles.mapLabelPreview}` : styles.mapLabel}>
              <span className={preview ? `${styles.mapNumber} ${styles.mapNumberPreview}` : styles.mapNumber}>{index + 1}</span>
              <span className={styles.mapLabelName}>{t(island.name)}</span>
              {done && <CheckIcon className={styles.mapDone} />}
              {preview && <LockIcon className={styles.mapLock} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
