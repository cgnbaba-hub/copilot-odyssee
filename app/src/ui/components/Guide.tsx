import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { Owl } from './Art';

/** Athene the owl with a speech bubble that says what to do on this screen. */
export function Guide(props: { text: string; cheer?: boolean; compact?: boolean }): React.ReactElement {
  const { theme, t } = useGame();
  return (
    <div className={props.compact ? `${styles.guide} ${styles.guideCompact}` : styles.guide}>
      <Owl className={styles.guideOwl} cheer={props.cheer} />
      <div className={styles.guideBubble} role="note">
        <span className={styles.guideName}>{t(theme.terms.guide)}</span>
        <p>{props.text}</p>
      </div>
    </div>
  );
}
