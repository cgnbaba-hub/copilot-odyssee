import * as React from 'react';

import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { RankEmblem } from './Art';

export function RankUp(props: { index: number; onClose: () => void }): React.ReactElement {
  const { strings, theme, t } = useGame();
  const rank = theme.ranks[props.index];

  return (
    <div className={styles.dialogBackdrop} onClick={props.onClose}>
      <div className={`${styles.dialog} ${styles.rankUp}`} role="dialog" aria-modal="true" aria-labelledby="od-rankup-title" onClick={(e) => e.stopPropagation()}>
        <RankEmblem index={props.index} className={styles.rankUpEmblem} />
        <p className={styles.eyebrow}>{strings.rankUpTitle}</p>
        <h2 id="od-rankup-title" className={styles.rankUpName}>
          {t(rank.name)}
        </h2>
        <p>{format(strings.rankUpText, { rank: t(rank.name) })}</p>
        <button type="button" className={styles.buttonPrimary} onClick={props.onClose} autoFocus>
          {strings.continueJourney}
        </button>
      </div>
    </div>
  );
}
