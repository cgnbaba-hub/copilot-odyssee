import * as React from 'react';

import { findIsland, findModule } from '../../core/content/bundle';
import { Block } from '../../core/content/types';
import { finishModule, getModule, nextBlockIndex, startModule } from '../../core/progress/state';
import { BriefingView } from '../blocks/BriefingView';
import { MissionView } from '../blocks/MissionView';
import { BlockKindIcon, blockKindNames } from '../blockKinds';
import { APP_NAMES } from '../copilot';
import { PromptView } from '../blocks/PromptView';
import { QuizView } from '../blocks/QuizView';
import { UseCaseView } from '../blocks/UseCaseView';
import { Strings, format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { islandProgress, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { IslandArt } from './Art';
import { Confetti } from './Confetti';
import { formatLongDate } from '../format';
import { Guide } from './Guide';
import { Loading } from './Loading';
import { StageRoute } from './StageRoute';

function BlockView(props: { moduleId: string; block: Block; onDone: () => void }): React.ReactElement {
  const { block } = props;
  switch (block.type) {
    case 'briefing':
      return <BriefingView moduleId={props.moduleId} block={block} onDone={props.onDone} />;
    case 'quiz':
      return <QuizView moduleId={props.moduleId} block={block} onDone={props.onDone} />;
    case 'prompt':
      return <PromptView moduleId={props.moduleId} block={block} onDone={props.onDone} />;
    case 'mission':
      return <MissionView moduleId={props.moduleId} block={block} onDone={props.onDone} />;
    case 'usecase':
      return <UseCaseView moduleId={props.moduleId} block={block} onDone={props.onDone} />;
  }
}

/** How long the done screen of a finished island shows before the passport opens. */
const STAMP_DELAY_MS = 4200;

/** Colour of the label that names the kind of step. */
const KIND_CLASS: Record<Block['type'], string> = {
  briefing: styles.kindBriefing,
  quiz: styles.kindQuiz,
  prompt: styles.kindPrompt,
  mission: styles.kindMission,
  usecase: styles.kindUseCase
};

function hintFor(strings: Strings, block: Block): string {
  switch (block.type) {
    case 'briefing':
      return strings.hint_briefing;
    case 'quiz':
      return block.options.filter((o) => o.correct).length > 1 ? strings.hint_quizMulti : strings.hint_quiz;
    case 'prompt':
      return strings.hint_prompt;
    case 'mission':
      if (block.copilot === false) return strings.hint_missionOffline;
      return block.app ? format(strings.hint_missionApp, { app: APP_NAMES[block.app] }) : strings.hint_mission;
    case 'usecase':
      return strings.hint_usecase;
  }
}

export function ModulePlayer(props: { moduleId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, lang, strings, theme, t, apply, update, navigate } = game;
  const module = findModule(content, props.moduleId);
  const [index, setIndex] = React.useState<number | undefined>(undefined);
  const xpAtStart = React.useRef(player.xp);
  const finished = React.useRef(false);

  React.useEffect(() => {
    if (!module) return;
    const state = update((s) => startModule(s, module));
    xpAtStart.current = state.xp;
    setIndex(nextBlockIndex(state, module));
  }, [props.moduleId]);

  const done = module !== undefined && index !== undefined && index >= module.blocks.length;
  React.useEffect(() => {
    if (module && done && !finished.current) {
      finished.current = true;
      apply((s) => finishModule(s, module, new Date()));
    }
  }, [done]);

  // A finished island earns a stamp: after a moment the player is taken to the passport, where it is pressed in.
  const islandStamped =
    done &&
    !!module &&
    getModule(player, module.id).completed === 1 &&
    (() => {
      const p = islandProgress(game, module.island);
      return p.total > 0 && p.completed === p.total;
    })();
  React.useEffect(() => {
    if (!islandStamped || !module) return undefined;
    const timer = window.setTimeout(() => navigate({ name: 'passport', stamp: module.island }), STAMP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [islandStamped]);

  if (!module || index === undefined) return <Loading text={strings.loading} compact />;
  const island = findIsland(content, module.island);
  const total = module.blocks.length;
  const current = Math.min(index + 1, total);
  const backToIsland = (): void => navigate({ name: 'island', islandId: module.island });

  // Copilot changes quickly, so every step says when its facts were checked.
  const currentBlock = module.blocks[Math.min(index, total - 1)];
  const asOf = ('asOf' in currentBlock && currentBlock.asOf) || module.reviewedAt;

  let doneView: React.ReactElement | undefined;
  if (done) {
    const islandDone = island ? islandProgress(game, island.id) : undefined;
    const newStamp = !!island && !!islandDone && islandDone.total > 0 && islandDone.completed === islandDone.total && getModule(player, module.id).completed === 1;
    const following = nextStage(game, module.id);
    doneView = (
      <div className={styles.moduleDone}>
        <Confetti />
        {island && (
          <div className={styles.doneArtWrap}>
            <IslandArt island={island} className={styles.moduleDoneArt} />
            <span className={styles.doneStamp} aria-hidden="true">
              <b>{strings.statusCompleted}</b>
              <small>{new Date().toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')}</small>
            </span>
          </div>
        )}
        <h2 className={styles.moduleDoneTitle}>{strings.moduleDoneTitle}</h2>
        <p className={styles.lead}>{format(strings.moduleDoneText, { xp: player.xp - xpAtStart.current, xpName: t(theme.terms.xp) })}</p>
        {newStamp && island && (
          <div className={styles.stampNotice}>
            <p>{format(strings.stampEarned, { island: t(island.name) })}</p>
            <span className={styles.stampCountdown} aria-hidden="true">
              <i style={{ animationDuration: `${STAMP_DELAY_MS}ms` }} />
            </span>
            <button type="button" className={styles.buttonPrimary} onClick={() => navigate({ name: 'passport', stamp: island.id })}>
              {strings.stampGoNow}
            </button>
          </div>
        )}
        <Guide text={following ? strings.moduleDoneGuide : strings.allDoneText} cheer compact />
        <div className={styles.doneActions}>
          {following && (
            <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'module', moduleId: following.module.id })}>
              {strings.nextStage}: {t(following.module.title)} →
            </button>
          )}
          <button type="button" className={following ? styles.button : `${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'map' })}>
            {strings.backToOverview}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.lesson} style={island ? ({ ['--od-island' as string]: island.color } as React.CSSProperties) : undefined}>
      <div className={styles.lessonTop}>
        <button type="button" className={styles.pauseButton} onClick={() => navigate({ name: 'map' })} title={strings.pauseHint}>
          <span aria-hidden="true">⌂</span> {strings.toStart}
        </button>
        <button type="button" className={styles.pauseButton} onClick={backToIsland} title={strings.pauseHint}>
          <span aria-hidden="true">←</span> {strings.toIsland}
        </button>
      </div>

      <div className={styles.lessonHead}>
        {island && <IslandArt island={island} className={styles.lessonArt} />}
        <div>
          <p className={styles.eyebrow}>{island ? t(island.name) : ''}</p>
          <h1 className={styles.lessonTitle}>{t(module.title)}</h1>
        </div>
      </div>

      <StageRoute blocks={module.blocks} index={Math.min(index, total)} island={island} />

      {doneView || (
        <>
          <Guide text={hintFor(strings, module.blocks[index])} compact />
          <div className={styles.lessonCard}>
            <p className={`${styles.blockKind} ${KIND_CLASS[module.blocks[index].type]}`}>
              <BlockKindIcon type={module.blocks[index].type} />
              <span>{blockKindNames(strings, module.blocks[index].type).long}</span>
              <span className={styles.blockKindCount}>
                {format(strings.stepOf, { current, total })}
                {asOf && (
                  <span className={styles.asOf} title={strings.asOfHint}>
                    {' · '}
                    {format(strings.asOf, { date: formatLongDate(lang, asOf) })}
                  </span>
                )}
              </span>
            </p>
            <BlockView key={module.blocks[index].id} moduleId={module.id} block={module.blocks[index]} onDone={() => setIndex(index + 1)} />
          </div>
        </>
      )}
    </section>
  );
}
