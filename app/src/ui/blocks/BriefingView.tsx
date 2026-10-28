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
  // Content can come from a SharePoint library, so only plain https links are rendered.
  const links = (block.links || []).filter((link) => /^https:\/\//.test(link.url));

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <RichText text={t(block.body)} />
      {links.length > 0 && (
        <ul className={styles.linkList}>
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {t(link.label)} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.actionBar}>
        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.buttonWide}`}
          onClick={() => {
            apply((s) => markBriefingRead(s, moduleId, block.id));
            props.onDone();
          }}
        >
          {strings.understood}
        </button>
      </div>
    </>
  );
}
