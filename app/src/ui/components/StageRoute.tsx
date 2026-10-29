import * as React from 'react';

import { Block } from '../../core/content/types';
import { BlockKindIcon, blockKindNames } from '../blockKinds';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

/**
 * The steps of a stage as stops on a route: done ones are ticked, the
 * current one is highlighted, and every stop shows what kind of step it is.
 */
export function StageRoute(props: { blocks: Block[]; index: number }): React.ReactElement {
  const { strings } = useGame();
  const total = props.blocks.length;
  const current = Math.min(props.index, total);
  return (
    <ol className={styles.stageStops} aria-label={format(strings.stepOf, { current: Math.min(current + 1, total), total })}>
      {props.blocks.map((block, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'next';
        const name = blockKindNames(strings, block.type).short;
        return (
          <li
            key={block.id}
            className={state === 'done' ? styles.stopDone : state === 'current' ? styles.stopCurrent : styles.stopNext}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.stopIcon}>
              {state === 'done' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <BlockKindIcon type={block.type} />
              )}
            </span>
            <span className={styles.stopLabel}>
              <span className={styles.visuallyHidden}>{format(strings.stepOf, { current: i + 1, total })}: </span>
              {name}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
