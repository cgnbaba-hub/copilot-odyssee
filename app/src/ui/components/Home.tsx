import * as React from 'react';

import { moduleLicense, sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { islandProgress, isPreview, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CheckIcon, IslandArt, LockIcon } from './Art';
import { Deck } from './Deck';
import { LicenseChip } from './LicenseChip';

type HomeView = 'deck' | 'log';
const VIEW_KEY = 'odyssee-home-view';

function savedView(): HomeView {
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'log' ? 'log' : 'deck';
  } catch {
    return 'deck';
  }
}

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
                <IslandArt island={island} muted={isPreview(game, island)} flag={done} className={styles.islandRowArt} />
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

/** The one stage to do next, as a ticket with a big button. */
function NextTicket(): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate } = game;
  const stage = nextStage(game);
  if (!stage) {
    return (
      <article className={styles.ticket} data-tour="next">
        <div className={styles.ticketMain}>
          <p className={styles.ticketEyebrow}>{strings.allDoneTitle}</p>
          <h2 className={styles.ticketTitle}>{strings.allDoneText}</h2>
        </div>
        <div className={styles.ticketStub}>
          <button type="button" className={styles.ticketGo} onClick={() => navigate({ name: 'passport' })}>
            {strings.openPassportShort}
          </button>
        </div>
      </article>
    );
  }
  return (
    <article className={styles.ticket} data-tour="next">
      <div className={styles.ticketMain}>
        <p className={styles.ticketEyebrow}>{stage.resume ? strings.resumeStageTitle : strings.nextStageTitle}</p>
        <h2 className={styles.ticketTitle}>{t(stage.module.title)}</h2>
        <p className={styles.ticketMeta}>
          <span>{t(stage.island.name)}</span>
          <span>{format(strings.aboutMinutes, { minutes: stage.module.estimatedMinutes })}</span>
          <LicenseChip license={moduleLicense(game.content, stage.module)} />
        </p>
      </div>
      <div className={styles.ticketStub}>
        <span className={styles.ticketStubLabel}>{strings.boarding}</span>
        <button type="button" className={styles.ticketGo} onClick={() => navigate({ name: 'module', moduleId: stage.module.id })}>
          {stage.resume ? strings.resumeShort : strings.go}
        </button>
      </div>
    </article>
  );
}

export function Home(): React.ReactElement {
  const game = useGame();
  const { strings } = game;
  const islands = sortedIslands(game.content);
  const [view, setView] = React.useState<HomeView>(savedView);

  const choose = (next: HomeView): void => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // The choice simply is not remembered.
    }
  };

  return (
    <div className={styles.home}>
      <div className={styles.viewSwitch} role="group" aria-label={strings.viewLabel} data-tour="view">
        <button type="button" aria-pressed={view === 'deck'} className={view === 'deck' ? styles.viewSwitchActive : undefined} onClick={() => choose('deck')}>
          {strings.viewDeck}
        </button>
        <button type="button" aria-pressed={view === 'log'} className={view === 'log' ? styles.viewSwitchActive : undefined} onClick={() => choose('log')}>
          {strings.viewLog}
        </button>
      </div>

      {view === 'deck' ? (
        <Deck islands={islands} />
      ) : (
        <section className={styles.panel}>
          <h1 className={styles.pageTitle}>{strings.viewLog}</h1>
          <p className={styles.muted}>{strings.logIntro}</p>
          <IslandList islands={islands.filter((i) => i.license === 'basic')} route={islands} title={strings.islandsBasicTitle} intro={strings.islandsBasicIntro} />
          <IslandList islands={islands.filter((i) => i.license === 'premium')} route={islands} title={strings.islandsPremiumTitle} intro={strings.islandsPremiumIntro} premium />
        </section>
      )}

      <NextTicket />
    </div>
  );
}
