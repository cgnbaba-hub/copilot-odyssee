import * as React from 'react';

import { moduleLicense, sortedIslands } from '../../core/content/bundle';
import { Island } from '../../core/content/types';
import { updateProfile } from '../../core/progress/state';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { compassProgress, islandProgress, isPreview, nextStage, pendingExam } from '../progressHelpers';
import styles from '../styles.module.scss';
import { TermTip } from './Legend';
import { CheckIcon, IslandArt, LockIcon } from './Art';
import { ChallengeCard } from './ChallengeCard';
import { Deck } from './Deck';
import { Regatta } from './Regatta';
import { ReviewInvite } from './ReviewInvite';
import { LicenseChip } from './LicenseChip';
import { SeaChart } from './SeaChart';

type HomeView = 'deck' | 'chart' | 'log' | 'regatta';
const VIEW_KEY = 'odyssee-home-view';

function savedView(): HomeView {
  try {
    const saved = window.localStorage.getItem(VIEW_KEY);
    return saved === 'log' || saved === 'chart' || saved === 'regatta' ? saved : 'deck';
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

/**
 * The moment the compass course is done: the companion says so once and
 * makes clear that everything from here on is free choice.
 */
function CompassDone(): React.ReactElement {
  const game = useGame();
  const { strings, player, update } = game;
  const compass = compassProgress(game);
  if (compass.total === 0 || compass.done < compass.total || player.profile.compassCheered) return <></>;
  return (
    <section className={styles.compassDone} aria-labelledby="od-compass-done">
      <span className={styles.compassDoneMark} aria-hidden="true">
        ✧
      </span>
      <div>
        <h2 id="od-compass-done" className={styles.compassDoneTitle}>
          {strings.compassDoneTitle}
        </h2>
        <p>{format(strings.compassDoneText, { count: compass.total })}</p>
      </div>
      <button type="button" className={styles.buttonPrimary} onClick={() => update((s) => updateProfile(s, { compassCheered: true }))}>
        {strings.compassDoneButton}
      </button>
    </section>
  );
}

/** The one stage to do next, as a ticket with a big button. */
function NextTicket(): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate } = game;
  const stage = nextStage(game);
  const compass = compassProgress(game);
  // An island whose stages are all done waits for its exam; that comes before the next stage further along the route.
  const exam = pendingExam(game);
  if (exam && (!stage || stage.island.order >= exam.order)) {
    return (
      <article className={styles.ticket} data-tour="next">
        <div className={styles.ticketMain}>
          <p className={styles.ticketEyebrow}>{strings.examNextTitle}</p>
          <h2 className={styles.ticketTitle}>{format(strings.examTitle, { island: t(exam.name) })}</h2>
          <p className={styles.ticketMeta}>
            <span>{strings.examTicketSummary}</span>
          </p>
        </div>
        <div className={styles.ticketStub}>
          <span className={styles.ticketStubLabel}>{strings.boarding}</span>
          <button type="button" className={styles.ticketGo} onClick={() => navigate({ name: 'exam', islandId: exam.id })}>
            {strings.go}
          </button>
        </div>
      </article>
    );
  }
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
        <p className={styles.ticketEyebrow}>
          {stage.resume ? strings.resumeStageTitle : strings.nextStageTitle}
          {stage.module.core && compass.total > 0 && (
            <span className={styles.chipCompass}>
              ✧ {format(strings.compassProgress, { done: compass.done + 1, total: compass.total })} <TermTip term="compass" />
            </span>
          )}
        </p>
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
  const [saved, setView] = React.useState<HomeView>(savedView);
  // Without the regatta's list the view does not exist, also when it was open last time.
  const view: HomeView = saved === 'regatta' && !game.regatta ? 'deck' : saved;

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
      <CompassDone />
      <ReviewInvite />
      {/* The next step comes first, so it is in view without scrolling. */}
      <NextTicket />
      <div className={game.regatta ? `${styles.viewSwitch} ${styles.viewSwitchFour}` : styles.viewSwitch} role="group" aria-label={strings.viewLabel} data-tour="view">
        <button type="button" aria-pressed={view === 'deck'} className={view === 'deck' ? styles.viewSwitchActive : undefined} onClick={() => choose('deck')}>
          {strings.viewDeck}
        </button>
        <button type="button" aria-pressed={view === 'chart'} className={view === 'chart' ? styles.viewSwitchActive : undefined} onClick={() => choose('chart')}>
          {strings.viewChart}
        </button>
        <button type="button" aria-pressed={view === 'log'} className={view === 'log' ? styles.viewSwitchActive : undefined} onClick={() => choose('log')}>
          {strings.viewLog}
        </button>
        {game.regatta && (
          <button type="button" aria-pressed={view === 'regatta'} className={view === 'regatta' ? styles.viewSwitchActive : undefined} onClick={() => choose('regatta')}>
            {strings.viewRegatta}
            {game.player.profile.regatta === undefined && <span className={styles.viewSwitchNew}>{strings.regattaNew}</span>}
          </button>
        )}
      </div>

      {view === 'deck' ? (
        <Deck islands={islands} />
      ) : view === 'chart' ? (
        <SeaChart islands={islands} />
      ) : view === 'regatta' ? (
        <Regatta />
      ) : (
        <section className={styles.panel}>
          <h1 className={styles.pageTitle}>{strings.viewLog}</h1>
          <p className={styles.muted}>{strings.logIntro}</p>
          <IslandList islands={islands.filter((i) => i.license === 'basic')} route={islands} title={strings.islandsBasicTitle} intro={strings.islandsBasicIntro} />
          <IslandList islands={islands.filter((i) => i.license === 'premium')} route={islands} title={strings.islandsPremiumTitle} intro={strings.islandsPremiumIntro} premium />
        </section>
      )}

      <ChallengeCard />
    </div>
  );
}
