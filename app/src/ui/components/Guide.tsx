import * as React from 'react';

import { useGame } from '../GameContext';
import { GuidePortrait, guideById } from '../guides';
import styles from '../styles.module.scss';

/** The chosen companion with a speech bubble that says what to do on this screen. A new text pops in, so the hint is noticed. */
export function Guide(props: { text: string; cheer?: boolean; compact?: boolean }): React.ReactElement {
  const { player, t } = useGame();
  const guide = guideById(player.profile.guide);
  return (
    <div className={props.compact ? `${styles.guide} ${styles.guideCompact}` : styles.guide}>
      <GuidePortrait id={guide.id} className={props.cheer ? `${styles.guideOwl} ${styles.guideCheer}` : styles.guideOwl} />
      <div key={props.text} className={`${styles.guideBubble} ${styles.guideBubbleIn}`} role="note">
        <span className={styles.guideName}>{t(guide.name)}</span>
        <p>{props.text}</p>
      </div>
    </div>
  );
}
