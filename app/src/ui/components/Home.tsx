import * as React from 'react';

import { moduleLicense, sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { islandProgress, isPreview, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CheckIcon, IslandArt, LockIcon } from './Art';
import { Guide } from './Guide';
import { LicenseChip } from './LicenseChip';
import { SeaChart } from './SeaChart';

function IslandList(props: { islands: Island[]; route: Island[]; title: string; intro: string; premium?: boolean }): React.ReactElement {
  const game = useGame();
  const { t, navigate } = game;
  if (props.islands.length === 0) return <></>;
  return (
    <section className={styles.islandGroup}>
      <h2 className={styles.sectionTitle}>
        {props.premium && <LockIcon className={styles.sectionIcon} />} {props.title}
      </h2>
      <p className={styles.muted}>{props.intro}</p>
      <ol className={styles.islandList}>
        {props.islands.map((island) => {
          const progress = islandProgress(game, island.id);
          const done = progress.total > 0 && progress.completed === progress.total;
          return (
            <li key={island.id}>
              <button type="button" className={styles.islandRow} onClick={() => navigate({ name: 'island', islandId: island.id })}>
                <span className={isPreview(game, island) ? `${styles.mapNumber} ${styles.mapNumberPreview}` : styles.mapNumber}>{props.route.indexOf(island) + 1}</span>
                <IslandArt island={island} muted={isPreview(game, island)} className={styles.islandRowArt} />
                <span className={styles.islandRowText}>
                  <strong className={styles.islandRowName}>{t(island.name)}</strong>
                  <span className={styles.muted}>{t(island.tool)}</span>
                </span>
                <span className={styles.islandRowMeta}>
                  {done ? (
                    <span className={styles.chipDone}>
                      <CheckIcon /> {progress.completed}/{progress.total}
                    </span>
                  ) : (
                    progress.total > 0 && !isPreview(game, island) && <span className={styles.chip}>{`${progress.completed}/${progress.total}`}</span>
                  )}
                  <span className={styles.rowArrow} aria-hidden="true">
                    ›
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Home(): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate, player } = game;
  const stage = nextStage(game);
  const started = Object.keys(player.modules).length > 0;
  const islands = sortedIslands(game.content);

  const guideText = !stage ? strings.homeGuideDone : started ? strings.homeGuideBack : strings.homeGuideNew;

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <Guide text={guideText} cheer={!stage} />
        {stage ? (
          <div className={styles.nextCard}>
            <IslandArt island={stage.island} className={styles.nextCardArt} />
            <div className={styles.nextCardBody}>
              <p className={styles.eyebrow}>{stage.resume ? strings.resumeStageTitle : strings.nextStageTitle}</p>
              <h1 className={styles.nextCardTitle}>{t(stage.module.title)}</h1>
              <p className={styles.nextCardMeta}>
                {t(stage.island.name)} · {format(strings.aboutMinutes, { minutes: stage.module.estimatedMinutes })}
              </p>
              <LicenseChip license={moduleLicense(game.content, stage.module)} />
              <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'module', moduleId: stage.module.id })}>
                {stage.resume ? strings.resumeStage : strings.startStage} →
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.nextCard}>
            <div className={styles.nextCardBody}>
              <h1 className={styles.nextCardTitle}>{strings.allDoneTitle}</h1>
              <p>{strings.allDoneText}</p>
              <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'passport' })}>
                {strings.openPassport} →
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>{strings.routeTitle}</h2>
        <p className={styles.muted}>{strings.routeIntro}</p>
        <SeaChart />
        <IslandList islands={islands.filter((i) => i.license === 'basic')} route={islands} title={strings.islandsBasicTitle} intro={strings.islandsBasicIntro} />
        <IslandList islands={islands.filter((i) => i.license === 'premium')} route={islands} title={strings.islandsPremiumTitle} intro={strings.islandsPremiumIntro} premium />
      </section>
    </div>
  );
}
