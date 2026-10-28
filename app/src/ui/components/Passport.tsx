import * as React from 'react';

import { sortedIslands } from '../../core/content/bundle';
import { earnedSouvenirs, passportStamps, SOUVENIR_IDS } from '../../core/progress/achievements';
import { formatDate, formatNumber } from '../format';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { rankProgress } from '../theme/types';
import { RankEmblem, SouvenirIcon, Stamp } from './Art';

/** Small deterministic tilt so stamps look hand-pressed. */
const TILTS = [-8, 5, -3, 9, -6, 3, -10, 6, -2, 8];

export function Passport(): React.ReactElement {
  const { content, player, lang, strings, theme, t, navigate, showDrafts } = useGame();
  const stamps = passportStamps(content, player, { showDrafts });
  const souvenirs = earnedSouvenirs(content, player);
  const rank = rankProgress(theme, player.xp);
  const stagesDone = Object.keys(player.modules).filter((id) => player.modules[id].completed > 0).length;

  return (
    <section className={styles.panel}>
      <button type="button" className={styles.linkButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToMap}
      </button>

      <div className={styles.passportCover}>
        <RankEmblem index={rank.index} className={styles.passportEmblem} />
        <div>
          <p className={styles.eyebrowLight}>{t(theme.terms.passport)}</p>
          <h1 className={styles.passportTitle}>{t(rank.rank)}</h1>
          <dl className={styles.passportStats}>
            <div>
              <dt>{t(theme.terms.xp)}</dt>
              <dd>{formatNumber(lang, player.xp)}</dd>
            </div>
            <div>
              <dt>{strings.statsStages}</dt>
              <dd>{stagesDone}</dd>
            </div>
            <div>
              <dt>{strings.statsStamps}</dt>
              <dd>{stamps.length}</dd>
            </div>
            <div>
              <dt>{strings.statsUseCases}</dt>
              <dd>{player.useCases.length}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className={styles.muted}>{strings.passportIntro}</p>

      <h2 className={styles.sectionTitle}>{t(theme.terms.stamps)}</h2>
      <ul className={styles.stampGrid}>
        {sortedIslands(content).map((island, i) => {
          const stamp = stamps.filter((s) => s.islandId === island.id)[0];
          return (
            <li key={island.id} className={stamp ? styles.stamp : `${styles.stamp} ${styles.stampEmpty}`} style={{ transform: stamp ? `rotate(${TILTS[i % TILTS.length]}deg)` : undefined }}>
              <Stamp id={island.id} label={t(island.name)} date={stamp ? formatDate(lang, stamp.date) : ''} color={island.color} landmark={island.landmark} empty={!stamp} />
              <span className={styles.stampCaption}>{stamp ? t(island.name) : `${t(island.name)} · ${strings.stampOpen}`}</span>
            </li>
          );
        })}
      </ul>

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
