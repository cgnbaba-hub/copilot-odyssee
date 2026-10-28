import * as React from 'react';

import { sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { islandProgress, isPreview, nextStop } from '../progressHelpers';
import styles from '../styles.module.scss';

function Ship(): React.ReactElement {
  return (
    <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" className={styles.ship}>
      <path d="M15 4v17h2V4z" fill="#3B2A1A" />
      <path d="M17 5c5 3 7 8 7 14h-7z" fill="#FFFDF7" stroke="#1F2A44" strokeWidth="1" />
      <path d="M15 8c-4 2-6 6-6 11h6z" fill="#E0A526" stroke="#1F2A44" strokeWidth="1" />
      <path d="M5 22h22l-3 6H8z" fill="#8B5A2B" stroke="#1F2A44" strokeWidth="1" />
    </svg>
  );
}

export function SeaMap(): React.ReactElement {
  const game = useGame();
  const { strings, theme, t, navigate } = game;
  const islands = sortedIslands(game.content);
  const next = nextStop(game);
  const route = islands.map((i) => `${i.map.x},${i.map.y}`).join(' ');

  const label = (island: Island): React.ReactElement => {
    const progress = islandProgress(game, island.id);
    return (
      <>
        <span className={styles.islandName}>{t(island.name)}</span>
        <span className={styles.islandTool}>{t(island.tool)}</span>
        <span className={styles.islandMeta}>
          {isPreview(game, island) ? (
            <span className={styles.tagPreview}>{t(theme.terms.preview)}</span>
          ) : (
            progress.total > 0 && (
              <span>
                {progress.completed}/{progress.total}
              </span>
            )
          )}
        </span>
      </>
    );
  };

  return (
    <section className={styles.panel}>
      <h1 className={styles.panelTitle}>{t(theme.terms.mapTitle)}</h1>
      <p className={styles.muted}>{strings.mapIntro}</p>

      <div className={styles.map}>
        <svg className={styles.mapSea} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="od-waves" width="12" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 4 q3 -3 6 0 t6 0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#od-waves)" />
          <polyline points={route} fill="none" stroke="rgba(255,253,247,0.75)" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
        </svg>

        {islands.map((island) => (
          <button
            type="button"
            key={island.id}
            className={isPreview(game, island) ? `${styles.mapIsland} ${styles.mapIslandPreview}` : styles.mapIsland}
            style={{ left: `${island.map.x}%`, top: `${island.map.y}%`, ['--od-island' as string]: island.color } as React.CSSProperties}
            onClick={() => navigate({ name: 'island', islandId: island.id })}
          >
            {next && next.id === island.id && <Ship />}
            <span className={styles.islandShape} aria-hidden="true" />
            <span className={styles.mapIslandLabel}>{label(island)}</span>
          </button>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>{strings.islandsList}</h2>
      <ol className={styles.islandList}>
        {islands.map((island) => (
          <li key={island.id}>
            <button
              type="button"
              className={styles.islandRow}
              style={{ ['--od-island' as string]: island.color } as React.CSSProperties}
              onClick={() => navigate({ name: 'island', islandId: island.id })}
            >
              <span className={styles.islandDot} aria-hidden="true" />
              <span className={styles.islandRowText}>{label(island)}</span>
              {next && next.id === island.id && <span className={styles.tagNext}>{strings.nextStop}</span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
