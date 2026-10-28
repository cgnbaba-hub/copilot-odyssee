import * as React from 'react';

import { sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { islandProgress, isPreview, nextStop } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CompassRose, IslandArt, Ship } from './Art';

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

export function SeaMap(): React.ReactElement {
  const game = useGame();
  const { strings, theme, t, navigate } = game;
  const islands = sortedIslands(game.content);
  const next = nextStop(game);

  const meta = (island: Island): React.ReactElement | null => {
    if (isPreview(game, island)) return <span className={styles.chipPreview}>{t(theme.terms.preview)}</span>;
    const progress = islandProgress(game, island.id);
    if (progress.total === 0) return null;
    return (
      <span className={progress.completed === progress.total ? styles.chipDone : styles.chip}>
        {progress.completed}/{progress.total}
      </span>
    );
  };

  return (
    <section className={styles.mapSection}>
      <div className={styles.mapHeading}>
        <h1 className={styles.panelTitle}>{t(theme.terms.mapTitle)}</h1>
        <p className={styles.muted}>{strings.mapIntro}</p>
      </div>

      <div className={styles.map}>
        <svg className={styles.mapSea} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="od-waves" width="14" height="9" patternUnits="userSpaceOnUse">
              <path d="M0 5 q3.5 -3 7 0 t7 0" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="od-sea-light" cx="0.3" cy="0.25" r="0.9">
              <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#od-sea-light)" />
          <rect width="100" height="100" fill="url(#od-waves)" />
          <path d={routePath(islands)} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <CompassRose className={styles.compass} />

        {islands.map((island) => (
          <button
            type="button"
            key={island.id}
            className={styles.mapIsland}
            style={{ left: `${island.map.x}%`, top: `${island.map.y}%` }}
            onClick={() => navigate({ name: 'island', islandId: island.id })}
            aria-label={`${t(island.name)}: ${t(island.tool)}`}
          >
            {next && next.id === island.id && <Ship className={styles.mapShip} />}
            <IslandArt island={island} muted={isPreview(game, island)} className={styles.mapIslandArt} />
            <span className={styles.mapLabel}>
              <span className={styles.mapLabelName}>{t(island.name)}</span>
              <span className={styles.mapLabelTool}>{t(island.tool)}</span>
              {meta(island)}
            </span>
          </button>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>{strings.islandsList}</h2>
      <ol className={styles.islandList}>
        {islands.map((island) => (
          <li key={island.id}>
            <button type="button" className={styles.islandRow} onClick={() => navigate({ name: 'island', islandId: island.id })}>
              <IslandArt island={island} muted={isPreview(game, island)} className={styles.islandRowArt} />
              <span className={styles.islandRowText}>
                <strong className={styles.islandRowName}>{t(island.name)}</strong>
                <span className={styles.muted}>{t(island.tool)}</span>
              </span>
              <span className={styles.islandRowMeta}>
                {next && next.id === island.id && <span className={styles.chipNext}>{strings.nextStop}</span>}
                {meta(island)}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
