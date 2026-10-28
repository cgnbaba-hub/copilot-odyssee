import * as React from 'react';

import { findIsland, findModule } from '../../core/content/bundle';
import { Block } from '../../core/content/types';
import { finishModule, nextBlockIndex, startModule } from '../../core/progress/state';
import { BriefingView } from '../blocks/BriefingView';
import { MissionView } from '../blocks/MissionView';
import { PromptView } from '../blocks/PromptView';
import { QuizView } from '../blocks/QuizView';
import { UseCaseView } from '../blocks/UseCaseView';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { IslandArt, Ship } from './Art';

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

export function ModulePlayer(props: { moduleId: string }): React.ReactElement {
  const { content, player, strings, theme, t, apply, update, navigate } = useGame();
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

  if (!module || index === undefined) return <p className={styles.muted}>{strings.loading}</p>;
  const island = findIsland(content, module.island);
  const backToIsland = (): void => navigate({ name: 'island', islandId: module.island });

  return (
    <section className={styles.panel} style={island ? ({ ['--od-island' as string]: island.color } as React.CSSProperties) : undefined}>
      <button type="button" className={styles.linkButton} onClick={backToIsland}>
        ← {strings.backToIsland}
      </button>
      <div className={styles.playerHead}>
        {island && <IslandArt island={island} className={styles.playerArt} />}
        <div>
          <p className={styles.eyebrow}>{island ? t(island.name) : ''}</p>
          <h1 className={styles.panelTitle}>{t(module.title)}</h1>
        </div>
      </div>

      <ol className={styles.steps} aria-label={format(strings.stepOf, { current: Math.min(index + 1, module.blocks.length), total: module.blocks.length })}>
        {module.blocks.map((b, i) => (
          <li key={b.id} className={i < index ? styles.stepDone : i === index ? styles.stepCurrent : undefined}>
            {i === index && <Ship className={styles.stepShip} />}
          </li>
        ))}
      </ol>

      {done ? (
        <div className={styles.moduleDone}>
          {island && <IslandArt island={island} className={styles.moduleDoneArt} />}
          <h2 className={styles.blockTitle}>{strings.moduleDoneTitle}</h2>
          <p>{format(strings.moduleDoneText, { xp: player.xp - xpAtStart.current, xpName: t(theme.terms.xp) })}</p>
          <div className={styles.blockActions}>
            <button type="button" className={styles.buttonPrimary} onClick={backToIsland}>
              {strings.backToIsland}
            </button>
            <button type="button" className={styles.button} onClick={() => navigate({ name: 'map' })}>
              {strings.backToMap}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.stepLabel}>{format(strings.stepOf, { current: index + 1, total: module.blocks.length })}</p>
          <BlockView key={module.blocks[index].id} moduleId={module.id} block={module.blocks[index]} onDone={() => setIndex(index + 1)} />
        </>
      )}
    </section>
  );
}
