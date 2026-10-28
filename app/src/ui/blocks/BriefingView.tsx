import * as React from 'react';

import { BriefingBlock } from '../../core/content/types';
import { markBriefingRead } from '../../core/progress/state';
import { RichText } from '../components/RichText';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

export function BriefingView(props: BlockViewProps<BriefingBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;

  return (
    <div>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <RichText text={t(block.body)} />
      {block.links && block.links.length > 0 && (
        <ul className={styles.linkList}>
          {block.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {t(link.label)}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.blockActions}>
        <button
          type="button"
          className={styles.buttonPrimary}
          onClick={() => {
            apply((s) => markBriefingRead(s, moduleId, block.id));
            props.onDone();
          }}
        >
          {strings.understood}
        </button>
      </div>
    </div>
  );
}
